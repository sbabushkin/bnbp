import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";
import { getYear } from "date-fns";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class BaliexceptionService extends ParserService {

  public async parse() {

    let page = 2;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    // Первая страница парсится только отдельно
    const listUrl = `https://baliexception.com/buy/`;
    const listResp = await axios.get(listUrl);
    const parsedContentList = parse(listResp.data);
    const propertiesClass = '.item-title > a';
    const propertiesUrlArr = parsedContentList
      .querySelectorAll(propertiesClass)
      .map(item => item.getAttribute('href'));

    console.log(listUrl, propertiesUrlArr.length);
    const data = [];

    for (const url of propertiesUrlArr) {
      const item = await this.parseItem(url, currentRate);
      data.push(item);
    }

    await this.loadToDb(data);

    let counter = 0;

    while (true) {
      let listUrl = `https://baliexception.com/buy/page/${page}/`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.item-title > a';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr.length);

      if (counter > 15) break;

      if (!propertiesUrlArr.length) {
        counter += 1;
        continue;
      }



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

    const ownership = itemUrl.split('/')[4];

    const mainInfoSelector = '.detail-wrap > ul > li';
    const infoTable = parsedContent.querySelectorAll(mainInfoSelector);

    const infoObj = {};
    let yearsLeft;
    let poolExists: boolean;
    infoTable.forEach(el => {
      const keys = el.text.trim().split('\n');
      if (keys.length > 1) {
        const key = keys[0].replace('\r', '').trim();
        infoObj[key] = keys[1].replace('\r', '').trim();
      }
      if(keys[0].includes('Pool Size')) poolExists = true;
      if(keys[0].includes('Leasehold')) yearsLeft = parseInt(keys[0].split(' ')[1]);
    });


    const propertyLocationSelector = '.elementor-heading-title';
    const mainTitle = parsedContent.querySelector(propertyLocationSelector)?.text;
    const location = mainTitle?.split('|')[1].trim();
    const name = mainTitle?.split('|')[0].trim();


    // const imgArr = parsedContent.querySelectorAll('a.test1');
    // imgArr.forEach(el => {
    //   console.log(el.attrs);
    // })

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = infoObj['Property ID'];
    propertyObj['name'] = name;
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(infoObj['Property Size']);
    propertyObj['landSize'] = parseNumeric(infoObj['Land Area']);
    if (yearsLeft) {
      propertyObj['leaseExpiryYear'] = getYear(new Date()) + parseInt(yearsLeft);
    }
    propertyObj['propertyType'] = 'villa';
    propertyObj['bedroomsCount'] = parseNumeric(infoObj['Bedrooms']) || parseNumeric(infoObj['Bedroom']);
    propertyObj['bathroomsCount'] = parseNumeric(infoObj['Bathrooms']) || parseNumeric(infoObj['Bathroom']);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    // propertyObj['priceIdr'] = this.convertToIdr() // TODO: convert to IDR
    propertyObj['priceUsd'] = parseNumeric(infoObj['Price']);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'baliexception.com';
    // propertyObj['photos'] = imgArr[0];
    console.log(propertyObj);
    return propertyObj;
  }

}
