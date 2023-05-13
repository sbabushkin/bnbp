import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class BaliexceptionService extends ParserService {

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://baliexception.com//page/${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.item-title a';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr.length);

      if (!propertiesUrlArr.length) break;

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]
      // const data: any = await this.parseItem(url);

      // const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
      // await Property.query().insert(data);
      // await this.loadToSheets(data);
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl) {
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
    const priceIdr = priceYears[0].indexOf('IDR') >= 0 ? parseNumeric(priceYears[0]) : 0;
    const priceUsd = priceYears[0].indexOf('USD') >= 0 ? parseNumeric(priceYears[0]) : 0;
    const leaseYearsLeft = parseNumeric(priceYears[1]);

    // get pool
    const poolSelector = 'span.swim-icon';
    const poolExists = parsedContent.querySelector(poolSelector);

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
    propertyObj['location'] = location;
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(buildingSize);
    propertyObj['landSize'] = parseNumeric(landSize);
    propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
    propertyObj['bedroomsCount'] = parseNumeric(bedrooms);
    propertyObj['bathroomsCount'] = parseNumeric(bathrooms);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceUSD'] = priceUsd;
    propertyObj['priceIDR'] = priceIdr;
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balivillasales.com';
    propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
