import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parsePrice, parseSquare } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class ExcelbaliService extends ParserService {

  public async parse() {

    let page = 1;

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

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]
      // const data: any = await this.parseItem(url);

      const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
      // await Property.query().insert(data);
      await this.loadToSheets(data);
      // console.log(data); break;
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl) {
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
    propertyObj['location'] = info['Location'];

    if (holdInfo) {
      propertyObj['ownership'] = holdInfo[0].trim();
      propertyObj['leaseExpiryYear'] = parseNumeric(holdInfo[1]);
    }

    propertyObj['buildingSize'] = parseSquare(info['Build Size']);
    propertyObj['landSize'] = parseSquare(info['Land Size']);
    propertyObj['propertyType'] = 'Villa';
    propertyObj['bedroomsCount'] = parseNumeric(info['Bedrooms']);
    propertyObj['bathroomsCount'] = parseNumeric(info['Bathrooms']);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceUSD'] = info['Price'].indexOf('USD') >= 0 ? parsePrice(info['Price']) : 0;
    propertyObj['priceIDR'] = info['Price'].indexOf('IDR') >= 0 ? parsePrice(info['Price']) : 0;
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'excelbali.com';
    propertyObj['photos'] = imgArr.length && imgArr[0];
    return propertyObj;
  }

}
