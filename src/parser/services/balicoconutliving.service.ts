import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";
import { getYear } from 'date-fns';


export class BalicoconutlivingService extends ParserBaseService {

  public async parse() {
    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();
    const categories = ['leasehold', 'freehold'];

    for (let category of categories) {
      while (true) {
        const listUrl = `https://balicoconutliving.com/bali-villa-sale-${category}/?page=${page}&?type=villa`;
          const listResp = await axios.get(listUrl, {
            headers: {
              'User-Agent': 'Chrome/59.0.3071.115',
            }
          });
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

          if (propertiesUrlArr.length < 10) break; // TODO: think about break;

          // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
          // const url = propertiesUrlArr[1]
          // const data: any = await this.parseItem(url);

          // const data: any = await Promise.all(propertiesUrlArr.map(url => this.parseItem(url)));
          const data = [];

          for (const url of propertiesUrlArr) {
            const item = await this.parseItem(url, currentRate);
            data.push(item);
          }

          await this.loadToDb(data);
          page += 1;
      }
    }
    return 'ok';
  }


  private async parseItem(itemUrl, currentRate) {
    const respItem = await axios.get(itemUrl, {
      headers: {
        'User-Agent': 'Chrome/59.0.3071.115',
      }
    });
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

    const descTextSelector = 'section.line-section > p';
    let leaseYearsLeft;
    let leaseExpYear;
    const descText = parsedContent.querySelector(descTextSelector)?.text;
    if (descText) {
      const sentences = descText.split('.');

      for (let sentence of sentences) {
        const upperSentence = sentence.toUpperCase();
        const condition = (upperSentence.includes('LEASEHOLD') || upperSentence.includes('LEASE'));

        if (condition && (upperSentence.includes(' YEARS ') || upperSentence.includes('-YEAR '))) {
          const numbers = sentence.split(/[^0-9]+/);
          const yearsLeftIndex = numbers.findIndex((value) => value.length === 2);
          leaseYearsLeft = yearsLeftIndex > 0 ? numbers[yearsLeftIndex] : undefined;
          break;
        } else if (condition && upperSentence.match(/LEASE UNTIL([^]*?)\s\d{4}/)?.length) {
          leaseExpYear = parseNumeric(upperSentence.match(/LEASE UNTIL([^]*?)\s\d{4}/)[0].match(/\d{4}/)[0]);
          break;
        }
      }
    }

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
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = ownership.trim();
    propertyObj['buildingSize'] = parseNumeric(info['Building Size:']?.replace('m2'));
    propertyObj['landSize'] = parseNumeric(info['Land Size:']?.replace('m2'));
    if (leaseYearsLeft) {
      propertyObj['leaseExpiryYear'] = getYear(new Date()) + parseInt(leaseYearsLeft);
    } else if (leaseExpYear) {
      propertyObj['leaseExpiryYear'] = leaseExpYear;
    }
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(info['Bedroom(s):']);
    propertyObj['bathroomsCount'] = parseNumeric(info['Bathroom(s):']);
    propertyObj['pool'] = info['Swimming Pool:'] ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parseNumeric(priceIdr);
    propertyObj['priceUsd'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balicoconutliving.com';
    // propertyObj['photos'] = imgArr[0];
    propertyObj['isValid'] = this.checkIsValid(propertyObj);
    return propertyObj;
  }

}
