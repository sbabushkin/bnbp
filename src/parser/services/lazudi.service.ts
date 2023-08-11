import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";
import { getYear } from 'date-fns';


export class LazudiService extends ParserBaseService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://lazudi.com/id-en/properties/for-sale/bali?page=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'a.property-card';
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
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl, currentRate) {
    const correctUrl = encodeURI(itemUrl);
    const respItem = await axios.get(correctUrl);
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'h1';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text.trim();

    const keys = parsedContent
      .querySelectorAll('.prop-spec-detail span.d-block')
      .map(item => {
        return item.text.trim();
      });

    const infoObj = {};

    parsedContent
      .querySelectorAll('.prop-spec-detail span.font-detail-lg')
      .forEach((item, index) => {
        const key = keys[index];
        infoObj[key] = item.text.trim();
      });
    console.log(infoObj);
    
    // get price idr
    const priceIdrSelector = '.prop-detail-price div div';
    const priceIdr = parsedContent.querySelector(priceIdrSelector)?.text.trim();

    // get pool
    const poolSelector = '#property_detail';
    const poolExists = parsedContent.querySelector(poolSelector)?.text.toLowerCase().indexOf('pool');

    // get location
    const propertyLocationSelector = 'h2 span';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();
    // const imgArr = parsedContent.querySelectorAll('.slides img')
    //   .map(item => item.getAttribute('src'));

    const details = parsedContent.querySelector('#property_detail').innerText;
    const ownership = details.indexOf('Freehold') >= 0 ? 'freehold' : 'leasehold';
    const descTextSelector = '.description-text';
    let leaseYearsLeft;
    const descText = parsedContent.querySelector(descTextSelector)?.text;
    if (descText) {
      const sentences = descText.split('.');

      for (let sentence of sentences) {
        const upperSentence = sentence.toUpperCase();
        const condition = (upperSentence.includes('LEASEHOLD') || upperSentence.includes('LEASE'));

        if (condition && (upperSentence.includes('YEARS') || upperSentence.includes('-YEAR'))) {
          const numbers = sentence.split(/[^0-9]+/);
          const yearsLeftIndex = numbers.findIndex((value) => value.length === 2);
          leaseYearsLeft = yearsLeftIndex > 0 ? numbers[yearsLeftIndex] : undefined;
          break;
        }
      }
    }

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(infoObj['Interior']);
    propertyObj['landSize'] = parseNumeric(infoObj['Land']);

    if (leaseYearsLeft && propertyObj['ownership'] === 'leasehold') {
			propertyObj['leaseExpiryYear'] = getYear(new Date()) + parseInt(leaseYearsLeft);
		}

    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(infoObj['Bed']) || parseNumeric(infoObj['Beds']);
    propertyObj['bathroomsCount'] = parseNumeric(infoObj['Bath']) || parseNumeric(infoObj['Baths']);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parseNumeric(priceIdr);
    propertyObj['priceUsd'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'lazudi.com';
    // propertyObj['photos'] = imgArr[0];
    propertyObj['isValid'] = this.checkIsValid(propertyObj);
    return propertyObj;
  }

}
