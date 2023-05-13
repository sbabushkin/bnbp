import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric, parseSquare, parseText } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class PpbaliService extends ParserService {

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://ppbali.com/bali-villa-sale/page/${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'a.more-details';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr.length);

      if (!propertiesUrlArr.length) break;

      // const url = 'https://ppbali.com/property/modern-5-bedroom-freehold-villa-in-canggu/';
      // const url = propertiesUrlArr[1]
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

    let respItem;

    try {
      respItem = await axios.get(itemUrl);
    } catch(e) {}

    if (!respItem) { // TODO: too many redirects
      console.log(itemUrl);
      return;
    }

    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'h1';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    const info = parsedContent.querySelectorAll('.quick-facts li')
      .map(item => item.text.trim())
      .reduce((aggr, item) => {
        const keyValue = item.split(':');
        if (keyValue[0] && keyValue[1]) {
          aggr[keyValue[0].trim()] = keyValue[1].trim();
        }
        return aggr;
      }, {});

    const priceHtml = parsedContent.querySelector('.price_conv');
    const priceIdr = priceHtml && priceHtml.getAttribute('data-price_IDR');
    const priceUsd = priceHtml && priceHtml.getAttribute('data-price_USD');

    const poolExists = parsedContent.text.toLowerCase().indexOf('pool') >= 0; // TODO: find another way

    // get Info html
    const bathBedRow = parsedContent
      .querySelector('.quick-facts tr')
      .querySelectorAll('td');
    const bedrooms = bathBedRow && bathBedRow[0]?.text;
    const bathrooms = bathBedRow && bathBedRow[1]?.text;

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    // const imgArr = parsedContent.querySelectorAll('.gallery img')
    //   .map(item => item.getAttribute('src'));

    const ownershipAndYear = info['Status'] ? info['Status'].split('until') : [];

    const propertyObj = {};
    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = info['Location'];
    propertyObj['ownership'] = ownershipAndYear[0] && ownershipAndYear[0].trim().toLowerCase();
    propertyObj['buildingSize'] = info['Build size'] && parseSquare(info['Build size']);
    propertyObj['landSize'] = info['Land size'] && parseSquare(info['Land size']);
    propertyObj['leaseExpiryYear'] = ownershipAndYear[1] && parseNumeric(ownershipAndYear[1]);
    propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
    propertyObj['bedroomsCount'] = parseNumeric(bedrooms);
    propertyObj['bathroomsCount'] = parseNumeric(bathrooms);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceUSD'] = parseNumeric(priceUsd);
    propertyObj['priceIDR'] = parseNumeric(priceIdr);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'ppbali.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
