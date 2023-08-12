import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parseSquare } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class RumahService extends ParserBaseService {

  private sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://www.rumah123.com/en/sale/bali/house/?page=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.card-featured__content-wrapper a h2';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => 'https://www.rumah123.com' + item.parentNode.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr);

      if (!propertiesUrlArr.length) break;

      const data = [];
      for (const url of propertiesUrlArr) {
        const item = await this.parseItem(url, currentRate);
        if (item) data.push(item);
      }
      await this.loadToDb(data);
      page += 1;
    }
    await this.sleep(10000);
    return 'ok';
  }

  private async parseItem(itemUrl, currentRate) {
    let respItem;
    try {
      respItem = await axios.get(itemUrl);
    } catch (err) {
      console.error(err.message);
      console.log('Captcha on item with url >>> ', itemUrl);
      return;
    }
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'h1';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    const priceIdrSelector = '.r123-listing-summary__price span';
    const priceIdr = parsedContent.querySelector(priceIdrSelector).text;
    const multi = priceIdr.indexOf('Billion') >= 0 ? 1000000000 : (priceIdr.indexOf('Million') >= 0 ? 1000000 : 1);

    const infoValues = parsedContent
      .querySelectorAll('p.ui-listing-specification__badge--value')
      .map(item => item.text);

    const infoKeys = parsedContent
      .querySelectorAll('p.ui-listing-specification__badge--label')
      .map(item => item.text);

    const infoObj = infoKeys.reduce((aggr, item, key) => {
      if (infoValues[key]) {
        aggr[item] = infoValues[key];
      }
      return aggr;
    }, {});

    // get location
    const propertyLocationSelector = '.r123-listing-summary__header-container-address';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    // const imgArr = parsedContent.querySelectorAll('.slides img')
    //   .map(item => item.getAttribute('src'));

    console.log((infoObj['Certificate'] || '').toLowerCase());


    const isFreehold  = (infoObj['Certificate'] || '').toLowerCase().indexOf('hak milik') > 0
      || (infoObj['Certificate'] || '').toLowerCase().indexOf('freehold') > 0;

    const isLeasehold  = (infoObj['Certificate'] || '').toLowerCase().indexOf('hak sewa') > 0
      || (infoObj['Certificate'] || '').toLowerCase().indexOf('leasehold') > 0;

    const propertyObj = {};
    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = isLeasehold ? 'leasehold' : (isFreehold ? 'freehold' : null);
    propertyObj['landSize'] = parseNumeric(infoObj['Land Size'] || infoObj['L. Tanah']);
    propertyObj['buildingSize'] = parseNumeric(infoObj['Building Size'] || infoObj['L. Bangunan']);
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(infoObj['Bedrooms'] || infoObj['Bedroom'] || infoObj['K. Tidur']);
    propertyObj['bathroomsCount'] = parseNumeric(infoObj['Bathrooms'] || infoObj['Bathroom'] || infoObj['K. Mandi']);
    // propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parseSquare(priceIdr) * multi;
    propertyObj['priceUsd'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'rumah123.com';
    // propertyObj['photos'] = imgArr[0];
    propertyObj['isValid'] = this.checkIsValid(propertyObj);

    propertyObj['isValid'] = this.checkIsValid(propertyObj);
    await this.sleep(1000 + Math.random() * 500);
    return propertyObj;
  }

}
