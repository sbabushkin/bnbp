import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { getYear } from "date-fns";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class BalitreasurepropertiesService extends ParserBaseService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://balitreasureproperties.com/properties/freehold-leasehold-villa-for-sale/?cpage=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'a.view_details';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .filter(item => item.text === 'View Details')
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
    const propertyNameSelector = 'h1';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    const info = parsedContent
      .querySelectorAll('.property-description p')
      .reduce((arr, item) => {
        const keyVal = item.text.split(':');
        if (keyVal[0] && keyVal[1]) {
          arr[keyVal[0].trim()] = keyVal[1].trim();
        }
        return arr;
      }, {});


    const pricePartHtml = parsedContent.querySelector('div.price_part');
    const leaseHoldText = pricePartHtml.querySelectorAll('span.show_type_Lease')[2]?.text;

    // get bedrooms
    const bedroomsSelector = 'img[src*="icon-bedroom.png"]';
    const bedrooms = parsedContent.querySelector(bedroomsSelector)
      ?.parentNode.querySelector('div').text;

    // get landSize
    const landSizeSelector = 'img[src*="icon-building.png"]';
    const landSize = parsedContent.querySelector(landSizeSelector)
      ?.parentNode.querySelector('div').text;

    // get bathrooms
    const bathroomsSelector  = 'img[src*="icon-bathroom.png"]';
    const bathrooms = parsedContent.querySelector(bathroomsSelector)
      ?.parentNode.querySelector('div').text;

    // get price IDR
    const priceIdrSelector = `.price span.show_type_${leaseHoldText ? 'Lease' : 'Sale'}`;
    const priceIdr = parsedContent.querySelector(priceIdrSelector)?.text;

    // get price USD
    const priceUsdSelector = 'span.show_curency_USD';
    const priceUsd = parsedContent.querySelector(priceUsdSelector)?.text;

    //
    // // get pool
    // const poolSelector = 'span.swim-icon';
    // const poolExists = parsedContent.querySelector(poolSelector);
    //
    // get location
    const propertyLocationSelector = 'span.area strong';
    const location = parsedContent.querySelectorAll(propertyLocationSelector)[1]?.text.trim();

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();
    //
    // const imgArr = parsedContent.querySelectorAll('.slides img')
    //   .map(item => item.getAttribute('src'));

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = leaseHoldText ? 'leasehold' : 'freehold';
    propertyObj['buildingSize'] = parseNumeric(info['Building size']); // TODO: // hard to parse
    propertyObj['landSize'] = parseNumeric(landSize);
    const leaseYearsLeft = leaseHoldText && parseNumeric(leaseHoldText);

    if (leaseYearsLeft) {
      propertyObj['leaseExpiryYear'] = getYear(new Date()) + parseInt(leaseYearsLeft);
    }
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(bedrooms);
    propertyObj['bathroomsCount'] = parseNumeric(bathrooms);
    propertyObj['pool'] = 'Yes';
    propertyObj['priceIdr'] = parseNumeric(priceIdr);
    propertyObj['priceUsd'] = parseNumeric(priceUsd) || this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balitreasureproperties.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
