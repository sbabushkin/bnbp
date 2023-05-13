import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class LazudiService extends ParserService {

  public async parse() {

    let page = 1;

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

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]
      // const data: any = await this.parseItem(url);

      const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
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
    propertyObj['location'] = location;
    // propertyObj['ownership'] = ownership; // TODO: parse from text
    propertyObj['buildingSize'] = parseNumeric(info[0]);
    propertyObj['landSize'] = parseNumeric(info[1]);
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
    propertyObj['bedroomsCount'] = parseNumeric(info[2]);
    propertyObj['bathroomsCount'] = parseNumeric(info[3]);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    // propertyObj['priceUSD'] = priceUsd;
    propertyObj['priceIDR'] = parseNumeric(priceIdr);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'lazudi.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
