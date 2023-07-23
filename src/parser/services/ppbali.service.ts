import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric, parseSquare, parseText } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class PpbaliService extends ParserService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://ppbali.com/search-result/page/${page}/?property_type=villa`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'a.more-details';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
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
    propertyObj['location'] = this.normalizeLocation(info['Location']);
    propertyObj['ownership'] = ownershipAndYear[0] && ownershipAndYear[0].trim().toLowerCase();
    propertyObj['buildingSize'] = info['Build size'] && parseSquare(info['Build size']);
    propertyObj['landSize'] = info['Land size'] && parseSquare(info['Land size']);
    propertyObj['leaseExpiryYear'] = ownershipAndYear[1] && parseNumeric(ownershipAndYear[1]);
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(bedrooms);
    propertyObj['bathroomsCount'] = parseNumeric(bathrooms);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parseNumeric(priceIdr);
    propertyObj['priceUsd'] = parseNumeric(priceUsd) || this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'ppbali.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
