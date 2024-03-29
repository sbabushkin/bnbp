import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric, parsePrice, parseSquare } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";
import { getYear } from 'date-fns';


export class ExcelbaliService extends ParserBaseService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://excelbali.com/bali-villas-for-sale/page/${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'a.icon_atleft';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr.length);

      if (!propertiesUrlArr.length) break;

      // const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
      const data = [];

      for (const url of propertiesUrlArr) {
        const item = await this.parseItem(url, currentRate);
        data.push(item);
      }
      await this.loadToDb(data);
      // console.log(data); break;
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl, currentRate) {
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    // property-info__item__label
    // property-info__item__lvalue

    // get name
    const propertyNameSelector = 'h2.post_title';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    // propery info keys
    const propertyKeys = parsedContent
      .querySelectorAll('.property-info-container .property-info__item__label')
      .map(item => item.text);

    // propery info values
    const propertyVals = parsedContent
      .querySelectorAll('.property-info-container .property-info__item__value')
      .map(item => item.text);

    const info = propertyKeys.reduce((aggr, item , key) => {
      if (propertyVals[key]) aggr[item] = propertyVals[key];
      return aggr;
    }, {})

    // get pool
    const poolExists = parsedContent.querySelector('.post_custom_field')
      ?.text.indexOf('pool') >= 0;

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();
    const imgArr = parsedContent.querySelectorAll('#main-carousel img')
      .map(item => item.getAttribute('src'));


    const holdInfo = info['Title']?.toLowerCase().split('until');
    
    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(info['Location']);
    propertyObj['ownership'] = holdInfo ? holdInfo[0].split(' ')[0].trim() : undefined;

    if (propertyObj['ownership'] === 'leasehold') {
      const ownershipRow = holdInfo[0] + holdInfo[1];
      const expiryYear = ownershipRow.match(/\d{4}/)?.shift();
      const yearsLeft = ownershipRow.match(/\d{2} year/)?.shift();
      propertyObj['leaseExpiryYear'] = expiryYear || getYear(new Date()) + parseInt(yearsLeft) || undefined;
    }

    propertyObj['buildingSize'] = parseSquare(info['Build Size']);
    propertyObj['landSize'] = parseSquare(info['Land Size']);
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(info['Bedrooms']);
    propertyObj['bathroomsCount'] = parseNumeric(info['Bathrooms']);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    const priceUsd = info['Price'].indexOf('USD') >= 0 ? parsePrice(info['Price']) : null;
    propertyObj['priceIdr'] = info['Price'].indexOf('IDR') >= 0 ? parsePrice(info['Price']) : null;
    propertyObj['priceUsd'] = priceUsd || this.convertToUsd(propertyObj['priceIdr'], currentRate.amount)
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'excelbali.com';
    propertyObj['photos'] = imgArr.length && imgArr[0];
    propertyObj['isValid'] = this.checkIsValid(propertyObj);
    return propertyObj;
  }

}
