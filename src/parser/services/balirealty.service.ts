import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";
import {getYear} from "date-fns";
const FormData = require('form-data');


export class BalirealtyService extends ParserBaseService {

  public async parse() {

    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

    while (true) {
      const listUrl = `https://www.balirealty.com/properties/page/${page}/?filter-contract=SALE&filter-location&filter-property-type=75&display=grid`;
      let listResp;

      try {
        listResp = await axios.get(listUrl);
      } catch (e) {
        // console.log(e.response.status);
      }

      if (!listResp) break;
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.property-text h3 a';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

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
    // console.log(propertiesHtmlArr.length);
  }

  private async parseItem(itemUrl, currentRate) {
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = '.page-title h2';
    const listingName = parsedContent.querySelector(propertyNameSelector).text;

    // get currency
    const currencySelector = '#basecurrency';
    const currency = parsedContent.querySelector(currencySelector)?.getAttribute('value') || 'IDR'; // TODO: empty selectbox

    const propertyInfoSelector = '.property-overview ul';
    const propertyDataHtml = parsedContent.querySelector(propertyInfoSelector);
    const liArr = propertyDataHtml.querySelectorAll('li');
    // const imgArr = parsedContent.querySelectorAll('.property-gallery img')
    //   .map(item => item.getAttribute('src'));

    const properties = [
      { key: 'price', selector: 'strong span.display_currency', numeric: true }, // TODO: convert price
      { key: 'externalId', selector: 'strong'},
      { key: 'contact_name', selector: 'strong', skip: true},
      { key: 'contact_phone', selector: 'strong', skip: true},
      { key: 'propertyType', selector: 'strong'},
      { key: 'is_sold', selector: 'strong', skip: true},
      { key: 'contract', selector: 'strong', skip: true},
      { key: 'status', selector: 'strong'},
      { key: 'location', selector: 'strong a'},
      { key: 'buildingSize', selector: 'strong span.display_buildsize', numeric: true },
      { key: 'landSize', selector: 'strong span.display_landsize', numeric: true },
      { key: 'bedroomsCount', selector: 'strong', numeric: true },
      { key: 'bathroomsCount', selector: 'strong', numeric: true },
      { key: 'parking', selector: 'strong', skip: true},
    ]

    const propertyObj = properties.reduce((aggr, item, key) => {
      const value = liArr[key]?.querySelector(item.selector)?.text.trim();
      if(!item.skip) aggr[item.key] = item.numeric ? parseNumeric(value) : value;
      return aggr;
    }, {});

    const poolExists = parsedContent.querySelectorAll('.property-amenities li.yes')
      .map(value => value.text)
      .find(value => value === 'Pool');

    const descElemsArr = parsedContent.querySelectorAll('.property-description > p');
    let yearsLeftOrExpYear;
    descElemsArr.forEach(el => {
      if(el.text.indexOf('Ownership') !== -1) {
        const matchesArr = el.text.split(':')[1].trim().match(/[0-9]+/);
        if (propertyObj['status'].indexOf('Freehold') >= 0 || !matchesArr?.length) yearsLeftOrExpYear = undefined
        else yearsLeftOrExpYear = matchesArr[0];
      }
    })

    // const convertUrl = 'https://www.balirealty.com/wp-content/plugins/currency_converter_shortcode/convertit.php'
    // const bodyFormData = new FormData();
    // bodyFormData.append('currency_b', currency === 'IDR' ? 'USD' : currency);
    // bodyFormData.append('basecurrency_b', currency);
    // bodyFormData.append('currentprice_b', propertyObj['price']);
    // const priceResp = await axios.post(convertUrl, bodyFormData); // TODO: fix 503


    propertyObj['id'] = v4();
    propertyObj['name'] = listingName;
    propertyObj['ownership'] = propertyObj['status'].indexOf('Freehold') >= 0 ? 'freehold' : 'leasehold';
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['priceIdr'] = currency === 'IDR' ? propertyObj['price'] : null;
    const priceUsd = currency === 'USD' ? propertyObj['price'] : null;
    propertyObj['priceUsd'] = priceUsd || this.convertToUsd(priceUsd, currentRate.amount);
    propertyObj['url'] = itemUrl;
    if (yearsLeftOrExpYear) {
      propertyObj['leaseExpiryYear'] = yearsLeftOrExpYear.length < 4 ? getYear(new Date()) + parseInt(yearsLeftOrExpYear) : yearsLeftOrExpYear;
    }
    propertyObj['source'] = 'balirealty.com';
    // propertyObj['photos'] = imgArr[0];
    propertyObj['isValid'] = this.checkIsValid(propertyObj);
    delete propertyObj['price'];
    delete propertyObj['status'];
    return propertyObj;
  }

}
