import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";
import { getYear } from 'date-fns';

export class BalivillasalesService extends ParserBaseService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://www.balivillasales.com/page/${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.read-more a';
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
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = '#stitle';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    // get ownership
    const ownershipSelector = 'span.key-icon';
    const ownership = parsedContent.querySelector(ownershipSelector)?.text.toLowerCase();

    // get land size
    const landSizeSelector = 'span.ruler-icon';
    const landSize = parsedContent.querySelector(landSizeSelector)?.text;

    // get building size
    const buildingSizeSelector = 'span.buildingsize';
    const buildingSize = parsedContent.querySelector(buildingSizeSelector)?.text;

    // get bedrooms
    const bedroomsSelector = 'span.bed-icon';
    const bedrooms = parsedContent.querySelector(bedroomsSelector)?.text;

    // get price / years
    const priceYearsSelector = '.single-price';
    const priceYears = parsedContent.querySelector(priceYearsSelector)?.text.split('/');
    const priceIdr = priceYears[0].indexOf('IDR') >= 0 ? parseNumeric(priceYears[0]) : null;
    const priceUsd = priceYears[0].indexOf('USD') >= 0 ? parseNumeric(priceYears[0]) : null;
    const leaseYearsLeft = parseInt(priceYears[1]);

    // get pool
    const poolSelector = 'span.swim-icon';
    const poolExists = parsedContent.querySelector(poolSelector);

    // get Lease Exp Year
    const leaseSelector = 'div.the_content';
    const leaseContent = parsedContent.querySelector(leaseSelector);

    // get bathrooms
    const bathroomsSelector = 'span.bath-icon';
    const bathrooms = parsedContent.querySelector(bathroomsSelector)?.text;

    // get location
    const propertyLocationSelector = '.code-location span span';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();
    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    const imgArr = parsedContent.querySelectorAll('.slides img')
      .map(item => item.getAttribute('src'));

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(buildingSize?.replace('m2', ''));
    propertyObj['landSize'] = parseNumeric(landSize?.replace('m2', ''));
    if (leaseYearsLeft) {
      propertyObj['leaseExpiryYear'] = getYear(new Date()) + leaseYearsLeft;
    }
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(bedrooms);
    propertyObj['bathroomsCount'] = parseNumeric(bathrooms);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceIdr'] = priceIdr;
    propertyObj['priceUsd'] = priceUsd || this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balivillasales.com';
    propertyObj['photos'] = imgArr[0];
    propertyObj['isValid'] = this.checkIsValid(propertyObj);
    return propertyObj;
  }

}
