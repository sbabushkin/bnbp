import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric, parsePrice, parseSquare } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class HarcourtspurbabaliService extends ParserBaseService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://harcourtspurbabali.com/villa-for-sale/page/${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.card a.btn-primary';
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
    const propertyNameSelector = 'h1';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    // get location
    const propertyLocationSelector = 'address.item-address';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    const imgArr = parsedContent.querySelectorAll('#property-gallery-js img.img-fluid')
      .map(item => item.getAttribute('data-src'));

    const details = parsedContent.querySelectorAll('.detail-wrap li')
      .reduce((aggr, item) => {
        const key = item.querySelector('strong')?.text;
        const value = item.querySelector('span')?.text;
        if (key || value) aggr[key] = value;
        return aggr;
      }, {});

    // console.log(details);

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = details['Property Title:']?.toLowerCase();
    propertyObj['buildingSize'] = parseSquare(details['Property Size:']);
    propertyObj['landSize'] = parseSquare(details['Land Area:']);
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(details['Bedrooms:']);
    propertyObj['bathroomsCount'] = parseNumeric(details['Bathrooms:']);
    propertyObj['pool'] = details['Pool Details:'] ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parsePrice(details['Price:']) || null;
    propertyObj['priceUsd'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'harcourtspurbabali.com';
    propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
