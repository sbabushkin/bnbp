import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";
import { getYear } from "date-fns";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class BalitreasurepropertiesService extends ParserService {

  public async parse() {

    let page = 11;

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
        if (item) data.push(item);
      }
      await this.loadToDb(data);
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl, currentRate) {
    let respItem;

    try {
      respItem = await axios.get(itemUrl);
    } catch(e) {
      console.log('Not found villa >>>', itemUrl);
      return;
    }

    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'h1';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    // get desc info
    const info = parsedContent
      .querySelector('div.property-description')
      ?.text.split('\n')
      .reduce((arr, item) => {
        const keyVal = item.split(':');
        if (keyVal[0] && keyVal[1]) {
          arr[keyVal[0].trim().toLowerCase()] = keyVal[1].trim();
        }
        return arr;
        }, {});


    const pricePartHtml = parsedContent.querySelector('div.price_part');
    const leaseHoldText = pricePartHtml.querySelectorAll('span.show_type_Lease')[2]?.text;
    let yearsLeft;
    leaseHoldText.split(' ').forEach((el, index, arr) => {
      if(el.toUpperCase().includes('YEARS')) {
        yearsLeft = parseInt(arr[index - 1]);
      }
    });

    // get bedrooms
    const bedroomsSelector = 'img[src*="icon-bedroom.png"]';
    const bedrooms = parsedContent.querySelector(bedroomsSelector)
      ?.parentNode.querySelector('div').text;

    // get landSize
    const landSizeSelector = 'img[src*="icon-building.png"]';
    const landSizeText = parsedContent.querySelector(landSizeSelector)
      ?.parentNode.querySelector('div').text;
    const landSize = landSizeText.includes('.') ? landSizeText.split('.')[0] : landSizeText;

    // get buildingSize
    let buildingSize;
    if (info['building size']?.includes('.')) buildingSize = info['building size']?.replace('.', ' ');
    else if (info['building size']?.includes(',')) {
      const secondPart = info['building size'].split(',')[1];
      const matches = secondPart.match(/\d{3}/);
      buildingSize = matches[0]?.length ?
        info['building size'].replace(',', '') :
        info['building size'].replace(',', ' ');
    } else {
      buildingSize = info['building size'];
    }

    // get bathrooms
    const bathroomsSelector  = 'img[src*="icon-bathroom.png"]';
    const bathrooms = parsedContent.querySelector(bathroomsSelector)
      ?.parentNode.querySelector('div').text;

    // get price IDR
    const priceIdrSelector = `.price span.show_type_${leaseHoldText ? 'Lease' : 'Sale'}`;
    const priceIdr = parsedContent.querySelector(priceIdrSelector)?.text;

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
    propertyObj['buildingSize'] = parseInt(buildingSize) ? parseInt(buildingSize) : undefined;
    propertyObj['landSize'] = parseNumeric(landSize?.replace('m2', ''));
    if (yearsLeft) {
      propertyObj['leaseExpiryYear'] = getYear(new Date()) + parseInt(yearsLeft);
    }
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(bedrooms);
    propertyObj['bathroomsCount'] = parseNumeric(bathrooms);
    propertyObj['pool'] = 'Yes';
    propertyObj['priceIdr'] = parseNumeric(priceIdr);
    propertyObj['priceUsd'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balitreasureproperties.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
