import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";
import { getYear } from "date-fns";


export class RajavillapropertyService extends ParserService {

  public async parse() {

    let page = 75;

    // // TODO: move to service
    // const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://www.rajavillaproperty.com/properties/page/${page}/?filter-contract=SALE&filter-property-type=55`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = 'h3.entry-title a';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

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

    // get name and ownership
    const propertyNameSelector = 'h1.property-title';
    const titleText = parsedContent.querySelector(propertyNameSelector)?.text;
    const listingName = titleText;
    const splitTitle = titleText.split('-');
    const ownership = splitTitle[splitTitle.length - 1].trim().toLowerCase();

    // get details list
    const detailsSelector = 'ul.columns-gap > li';
    const details = parsedContent.querySelectorAll(detailsSelector)
      .reduce((aggr, item) => {
        const pair = item.text.split(':');
        if (pair.length > 1) {
          const key = pair[0]?.trim();
          const value = pair[1]?.trim();
          if (key && value) aggr[key] = value;
        }
        return aggr;
      }, {});

    // get price / years
    const priceYearsSelector = 'div.price';
    const priceUsd = parsedContent.querySelector(priceYearsSelector)?.text.trim();

    // get pool
    const amenitiesSelector = 'ul.list-check > li.yes';
    const amenitiesList = parsedContent.querySelectorAll(amenitiesSelector);
    const poolExists = details['Pool Size'] || amenitiesList.find((value) => value.text.toUpperCase().includes('POOL'));

    // get location
    const propertyLocationSelector = 'div.address > a';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();

    // get external id
    const urlSplit = itemUrl.split('/');
    const itemUrlId = urlSplit[urlSplit.length - 2];

    // get images
    const imgArr = parsedContent.querySelectorAll('img')
      .map(item => item.getAttribute('src'));

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(details['Home area']);
    propertyObj['landSize'] = parseNumeric(details['Lot area']);
    if (details['Lease Period']) {
      const yearsLeft = parseNumeric(details['Lease Period']);
      propertyObj['leaseExpiryYear'] = getYear(new Date()) + Number(yearsLeft);
    }
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = details['Bedrooms'] ? parseInt(details['Bedrooms']) : undefined;
    propertyObj['bathroomsCount'] = details['Baths'] ? parseInt(details['Baths']) : undefined;
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    // propertyObj['priceIdr'] = priceIdr;
    propertyObj['priceUsd'] = parseNumeric(priceUsd) ? parseNumeric(priceUsd) : undefined;
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'rajavillaproperty.com';
    propertyObj['photos'] = imgArr[3];
    return propertyObj;
  }
}
