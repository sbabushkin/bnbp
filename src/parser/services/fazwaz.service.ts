import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parseSquare } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class FazwazService extends ParserService {

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://www.fazwaz.id/villa-for-sale/indonesia/bali?order_by=rank|asc&page=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.loaded a.link-unit';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr.length);

      if (!propertiesUrlArr.length) break;

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]
      // const data: any = await this.parseItem(url);

      const data = [];

      for (const url of propertiesUrlArr) { // TODO: have to use buffer bcs of 503 error
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

    const infoKeys = parsedContent
      .querySelectorAll('div.property-info-element small')
      .map(item => item.text.trim());

    const infoValues = parsedContent
      .querySelectorAll('div.property-info-element')
      .map(item => item.removeChild(item.querySelector('small')).text.trim());

    const info = infoKeys.reduce((aggr, item, key) => {
      if (infoValues[key]) {
        aggr[item] = infoValues[key];
      }
      return aggr;
    }, {});

    const basicInfoKeys = parsedContent
      .querySelectorAll('span.basic-information-topic')
      .map(item => item.text.trim());

    const basicInfoValues = parsedContent
      .querySelectorAll('span.basic-information-info')
      .map(item => item.text.trim());

    const basicInfo = basicInfoKeys.reduce((aggr, item, key) => {
      if (basicInfoValues[key]) {
        aggr[item] = basicInfoValues[key];
      }
      return aggr;
    }, {});

    // get priceIdr
    const priceIdrSelector = '.gallery-unit-sale-price__price';
    const priceIdr = parsedContent.querySelector(priceIdrSelector).text;

    // get location
    const propertyLocationSelector = 'span.project-location';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();

    // get ownership
    // const ownershipSelector = '.fa-copy';
    // const ownership = parsedContent.querySelector(ownershipSelector)
    //   .parentNode.parentNode.querySelector('p').text.toLowerCase();

    // get pool
    const poolSelector = 'img[src*="relax.png"]';
    const poolExists = parsedContent.querySelector(poolSelector);

    // get bathrooms
    const bathroomsSelector = '.property-detail-baths';
    const bathrooms = parsedContent.querySelector(bathroomsSelector)?.text;

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = location;
    // propertyObj['ownership'] = ownership.indexOf('leasehold') >= 0 ? 'leasehold' : 'freehold';
    propertyObj['buildingSize'] = parseNumeric(info['Indoor Area']);
    propertyObj['landSize'] = parseNumeric(basicInfo['Plot Size']);
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    // propertyObj['leaseExpiryYear'] = leaseExpiryYear;
    propertyObj['propertyType'] = 'Villa';
    propertyObj['bedroomsCount'] = parseSquare(info['Bedrooms'] || info['Bedroom']) ;
    propertyObj['bathroomsCount'] = parseSquare(info['Bathrooms'] || info['Bathroom']);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    // propertyObj['priceUSD'] = priceUsd;
    propertyObj['priceIDR'] = parseNumeric(priceIdr);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'fazwaz.id';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
