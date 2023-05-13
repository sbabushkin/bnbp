import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parseSquare } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class RumahService extends ParserService {

  public async parse() {

    let page = 1;

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

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]
      // const data: any = await this.parseItem(url);

      const data = [];

      for (const url of propertiesUrlArr) {
        const item = await this.parseItem(url);
        data.push(item);
      }

      // const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
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

    const propertyObj = {};
    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = location;
    // propertyObj['ownership'] = ownership;
    propertyObj['landSize'] = parseNumeric(infoObj['Land Size'] || infoObj['L. Tanah']);
    propertyObj['buildingSize'] = parseNumeric(infoObj['Building Size'] || infoObj['L. Bangunan']);
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = infoObj['Property Type'];
    propertyObj['bedroomsCount'] = parseNumeric(infoObj['Bedrooms'] || infoObj['Bedroom'] || infoObj['K. Tidur']);
    propertyObj['bathroomsCount'] = parseNumeric(infoObj['Bathrooms'] || infoObj['Bathroom'] || infoObj['K. Mandi']);
    // propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    // propertyObj['priceUSD'] = priceUsd;
    propertyObj['priceIDR'] = parseSquare(priceIdr) * multi;
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'rumah123.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
