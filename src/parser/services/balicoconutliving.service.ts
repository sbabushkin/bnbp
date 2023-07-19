import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class BalicoconutlivingService extends ParserService {

  public async parse() {
    let page = 1;

    // TODO: move to service
    const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();


    while (true) {
      const categories = ['leasehold', 'freehold'];

      for (let i = 0; i < categories.length; i++) {
        const listUrl = `https://balicoconutliving.com/bali-villa-sale-${categories[i]}/?page=${page}`;
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
        // console.log(listUrl, propertiesUrlArr);

        if (!propertiesUrlArr.length) return 'ok'; // TODO: think about break;

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
    console.log(priceIdr);
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
    propertyObj['location'] = this.normalizeLocation(location);
    propertyObj['ownership'] = ownership;
    propertyObj['buildingSize'] = parseNumeric(info['Building Size:']?.replace('m2'));
    propertyObj['landSize'] = parseNumeric(info['Land Size:']?.replace('m2'));
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(info['Bedroom(s):']);
    propertyObj['bathroomsCount'] = parseNumeric(info['Bathroom(s):']);
    propertyObj['pool'] = info['Swimming Pool:'] ? 'Yes' : 'No';
    propertyObj['priceIdr'] = parseNumeric(priceIdr);
    propertyObj['priceUsd'] = this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balicoconutliving.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
