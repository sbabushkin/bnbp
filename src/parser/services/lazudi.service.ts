import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";


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
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'h1';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text.trim();

    const info = parsedContent
      .querySelectorAll('.prop-spec-detail span.font-detail-lg')
      .map(item => item.text.trim());

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

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(location);
    // propertyObj['ownership'] = ownership; // TODO: parse from text
    propertyObj['buildingSize'] = parseNumeric(info[0]);
    propertyObj['landSize'] = parseNumeric(info[1]);
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft; // TODO: fix
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(info[2]);
    propertyObj['bathroomsCount'] = parseNumeric(info[3]);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parseNumeric(priceIdr);
    propertyObj['priceUSD'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'lazudi.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
