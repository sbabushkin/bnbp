import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parseSquare } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class FazwazService extends ParserBaseService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

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

      const data = [];

      for (const url of propertiesUrlArr) {
        const item = await this.parseItem(url, currentRate);
        data.push(item);
      }

      await this.loadToDb(data);
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl, currentRate) {
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
    propertyObj['location'] = this.normalizeLocation(location);
    // propertyObj['ownership'] = ownership.indexOf('leasehold') >= 0 ? 'leasehold' : 'freehold';
    propertyObj['buildingSize'] = parseNumeric(info['Indoor Area']) || null;
    propertyObj['landSize'] = parseNumeric(basicInfo['Plot Size']) || null;
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    // propertyObj['leaseExpiryYear'] = leaseExpiryYear;
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseInt(parseSquare(info['Bedrooms'] || info['Bedroom']).toString())  || null;
    propertyObj['bathroomsCount'] = parseInt(parseSquare(info['Bathrooms'] || info['Bathroom']).toString()) || null;
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parseNumeric(priceIdr) || null;
    propertyObj['priceUsd'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'fazwaz.id';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
