import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class BalicoconutlivingService extends ParserService {

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://balicoconutliving.com/bali-property-sale-freehold-and-leasehold/?page=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.property-thumb-button a';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item =>  {
          const onclick = item.getAttribute('onclick');
          const urlPart = onclick
            .replace('openDetail("', '')
            .replace('")', '');
          return `https://balicoconutliving.com${urlPart}`;
        });

      console.log(listUrl, propertiesUrlArr.length);
      // console.log(listUrl, propertiesUrlArr);

      if (!propertiesUrlArr.length) break; // TODO: think about break;

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[1]
      // const data: any = await this.parseItem(url);

      // const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
      const data = [];

      for (const url of propertiesUrlArr) {
        const item = await this.parseItem(url);
        data.push(item);
      }

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
    const propertyNameSelector = '.blue-section h2.title';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    // get priceIdr
    const priceIdrSelector = '.pills-price-content p';
    const priceIdr = parsedContent.querySelector(priceIdrSelector)?.text;

    const infoValues = parsedContent
      .querySelectorAll('ul.list-detail li span')
      .map(item => item.text);

    const infoKeys = parsedContent
      .querySelectorAll('ul.list-detail li')
      .map(item => item.removeChild(item.querySelector('span')).text);

    const info = infoKeys.reduce((aggr, item, key) => {
      if (infoValues[key]) {
        aggr[item.trim()] = infoValues[key].trim();
      }
      return aggr;
    }, {})

    // get ownership
    const ownershipSelector = '#dd_price_tag';
    const ownership = parsedContent.querySelector(ownershipSelector)?.text.toLowerCase();

    // get location
    const propertyLocationSelector = '.fa-map-marker';
    const location = parsedContent.querySelector(propertyLocationSelector).parentNode.text.trim();

    const itemUrlId =  itemUrl.split('/').pop();
    //
    // const imgArr = parsedContent.querySelectorAll('.slides img')
    //   .map(item => item.getAttribute('src'));

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = location;
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(info['Building Size:']?.replace('m2'));
    propertyObj['landSize'] = parseNumeric(info['Land Size:']?.replace('m2'));
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
    propertyObj['bedroomsCount'] = parseNumeric(info['Bedroom(s):']);
    propertyObj['bathroomsCount'] = parseNumeric(info['Bathroom(s):']);
    propertyObj['pool'] = info['Swimming Pool:'] ? 'Yes' : 'No';
    // propertyObj['priceUSD'] = priceUsd;
    propertyObj['priceIDR'] = parseNumeric(priceIdr);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balicoconutliving.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}