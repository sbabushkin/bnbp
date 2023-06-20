import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parseSquare } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class PropertiabaliService extends ParserService {
  constructor() {
    super();
  }

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://propertiabali.com/bali-villas-for-sale/?wplpage=${page}&limit=50`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'a.view_detail';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'))
        .filter((item, index, arr) => arr.indexOf(item) === index); // remove duplicates

      console.log(listUrl, propertiesUrlArr.length);

      if (!propertiesUrlArr.length) break;

      // const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
      const data = [];

      for (const url of propertiesUrlArr) {
        const item = await this.parseItem(url);
        data.push(item);
      }
      await this.loadToDb(data);
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl) {
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    const details = parsedContent
      .querySelectorAll('div.wpl_prp_show_detail_boxes_cont .other')
      .map(item => item.text)
      .reduce((aggr, item) => {
        const keyValArr = item.split(':');
        if (keyValArr[0] && keyValArr[1]) {
          aggr[keyValArr[0].trim()] = keyValArr[1].trim();
        }
        return aggr;
      }, {});

    // get name
    const propertyNameSelector = 'h1.title_text';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    // get bedrooms
    const bedroomsSelector = 'div.bedroom span';
    const bedrooms = parsedContent.querySelector(bedroomsSelector)?.text;

    // get bathrooms
    const bathroomsSelector = 'div.bathroom span';
    const bathrooms = parsedContent.querySelector(bathroomsSelector)?.text;

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    // const imgArr = parsedContent.querySelectorAll('.slides img')
    //   .map(item => item.getAttribute('src'));

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = details['Area'];
    propertyObj['ownership'] = details['Property Type']?.toLowerCase();
    propertyObj['buildingSize'] = parseSquare(details['Building size']);
    propertyObj['landSize'] = parseSquare(details['Land size']) * 100;
    propertyObj['leaseYearsLeft'] = parseNumeric(details['Years']);
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = bedrooms;
    propertyObj['bathroomsCount'] = bathrooms;
    propertyObj['pool'] = details['POOL'];
    // propertyObj['priceUsd'] = priceUsd;
    propertyObj['priceIdr'] = parseNumeric(details['Price']);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'propertiabali.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
