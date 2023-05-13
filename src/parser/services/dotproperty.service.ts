import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parseSquare } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class DotpropertyService extends ParserService {

  public async parse() {

    let page = 46;

    while (true) {
      const listUrl = `https://www.dotproperty.id/en/villas-for-sale/bali?page=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'div.description-block a.hj-listing-snippet';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr.length);

      if (!propertiesUrlArr.length) break;

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]
      // const data: any = await this.parseItem(url);

      const data = [];
      let buffer = [];
      const bufferSize = 3;

      for (const url of propertiesUrlArr) { // TODO: have to use buffer bcs of 503 error
        const item = await this.parseItem(url);
        data.push(item);
        // buffer.push(url);
        // if (buffer.length === bufferSize || propertiesUrlArr.indexOf(url) === propertiesUrlArr.length) {
        //   const items = await Promise.all(buffer.map(url => this.parseItem(url)));
        //   data.push(...items);
        //   buffer = []
        // }
      }

      // const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
      // await Property.query().insert(data);
      await this.loadToSheets(data);
      // console.log(data.length, propertiesUrlArr.length);
      // break;
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl) {
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'h1.page-title';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text.trim();

    const infoValues = parsedContent
      .querySelectorAll('ul.key-featured li span')
      .map(item => item.removeChild(item.querySelector('sup')).text);

    const infoKeys = parsedContent
      .querySelectorAll('ul.key-featured li')
      .map(item => item.removeChild(item.querySelector('span')).text);

    const infoObj = infoKeys.reduce((aggr, item, key) => {
      if (infoValues[key]) {
        aggr[item] = infoValues[key];
      }
      return aggr;
    }, {});

    // get price
    const priceYearsSelector = '.price-title';
    const priceIdr = parsedContent.querySelector(priceYearsSelector)?.text;

    // get pool
    const poolSelector = 'i.icon-swimming-pool';
    const poolExists = parsedContent.querySelector(poolSelector);
    //
    // get location
    const propertyLocationSelector = '.location';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    // const imgArr = parsedContent.querySelectorAll('.slides img')
    //   .map(item => item.getAttribute('src'));
    const isFreehold = listingName.toLowerCase().indexOf('freehold') >= 0;
    const isLeaseHold = listingName.toLowerCase().indexOf('leasehold') >= 0;
    const ownership = isFreehold ? 'freehold' : (isLeaseHold ? 'leasehold' : '');

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = location;
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(infoObj['Usable area']);
    propertyObj['landSize'] = parseNumeric(infoObj['Land area']);
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft; // TODO: only in text
    propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
    propertyObj['bedroomsCount'] = parseNumeric(infoObj['Beds'] || infoObj['Bed']);
    propertyObj['bathroomsCount'] = parseNumeric(infoObj['Baths'] || infoObj['Bath']);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    // propertyObj['priceUSD'] = priceUsd;
    propertyObj['priceIDR'] = priceIdr.indexOf('billion') >= 0
      ? parseSquare(priceIdr) * 1000000000 : parseNumeric(priceIdr);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'dotproperty.id';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
