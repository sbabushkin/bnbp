import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { PropertyPrice } from "../entities/property_price.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class BaliHomeImmoService extends ParserService {

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://bali-home-immo.com/realestate-property/for-sale/villa?page=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.property-desc a';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      // console.log(listUrl, propertiesUrlArr);

      if (!propertiesUrlArr.length) break;

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]

      // const data: any = await this.parseItem(url);
      const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
      const bindings = data.map(item => ([item.source, item.externalId]));

      const existedRows = await Property.query().whereIn(
        ['source', 'external_id'],
        bindings
      );

      const existedRowsMap = existedRows.reduce((map, item) => {
        map[item.externalId] = item;
        return map;
      }, {});

      const insertData = data
        .filter(item => !existedRowsMap[item.externalId])
        .map(item => {
          item.prices = [{
            priceIdr: item.priceIDR,
            priceUsd: item.priceUSD,
          }]
          return item;
        });

      await Property.query().insertGraph(insertData);
      await PropertyPrice.query().insert(
        data
          .filter(item => existedRowsMap[item.externalId])
          .map(item => ({
            propertyId: existedRowsMap[item.externalId].id,
            priceIdr: item.priceIDR,
            priceUsd: item.priceUSD,
          }))
      );

      break;
      page += 1;
    }
    return 'ok';
  }

  private async parseItem(itemUrl) {
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'h2.side-title';
    const listingName = parsedContent.querySelector(propertyNameSelector).text;

    // get ownership
    const ownershipSelector = 'span.btn-price-categories';
    const ownership = parsedContent.querySelector(ownershipSelector).text;

    // get location
    const propertyLocationSelector = '.side-location span';
    const location = parsedContent.querySelector(propertyLocationSelector).text.trim();

    const itemUrlId =  itemUrl.split('/').pop();
    const priceUsdUrl = `https://bali-home-immo.com/change-property-currency/${itemUrlId}?currency=USD`;
    const respPriceUsd = await axios.get(priceUsdUrl);
    const priceUsd = Object.values(respPriceUsd.data)[0];

    const priceIdrUrl = `https://bali-home-immo.com/change-property-currency/${itemUrlId}?currency=IDR`;
    const respPriceIdr = await axios.get(priceIdrUrl);
    const priceIdr = Object.values(respPriceIdr.data)[0];

    const imgArr = parsedContent.querySelectorAll('.main-swiper img')
      .map(item => item.getAttribute('src'));

    const propertyObj = {};

    const generalInfoObj = parsedContent
      .querySelectorAll(`#list-general-information-${ownership} td`)
      .map(item => item.text.trim())
      .filter(item => item !== ':')
      .reduce((aggr, item, key, arr) => {
        if (key % 2 == 1) {
          aggr[arr[key-1]] = item;
        }
        return aggr;
      }, {});

    const indoorObj = parsedContent
      .querySelectorAll(`#list-indoor-${ownership} td`)
      .map(item => item.text.trim())
      .filter(item => item !== ':')
      .reduce((aggr, item, key, arr) => {
        if (key % 2 == 1) {
          aggr[arr[key-1]] = item;
        }
        return aggr;
      }, {});

    const outdoorObj = parsedContent
      .querySelectorAll(`#list-outdoor-${ownership} td`)
      .map(item => item.text.trim())
      .filter(item => item !== ':')
      .reduce((aggr, item, key, arr) => {
        if (key % 2 == 1) {
          aggr[arr[key-1]] = item;
        }
        return aggr;
      }, {});


    console.log(generalInfoObj, itemUrlId);

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = location;
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(generalInfoObj['Building Size']);
    propertyObj['landSize'] = parseNumeric(generalInfoObj['Land Size']);
    propertyObj['leaseYearsLeft'] = parseNumeric(generalInfoObj['Leasehold Period']);
    propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
    propertyObj['bedroomsCount'] = parseNumeric(indoorObj['Bedroom']);
    propertyObj['bathroomsCount'] = parseNumeric(indoorObj['Bathroom'] || indoorObj['Ensuite Bathroom']);
    propertyObj['pool'] = (outdoorObj['Swimming Pool'] && outdoorObj['Swimming Pool'].indexOf('Yes')) ? 'Yes' : 'No';
    propertyObj['priceUSD'] = parseNumeric(priceUsd.toString());
    propertyObj['priceIDR'] = parseNumeric(priceIdr.toString());
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'bali-home-immo.com';
    propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}