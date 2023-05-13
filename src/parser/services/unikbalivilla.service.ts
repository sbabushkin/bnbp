import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class UnikbalivillaService extends ParserService {

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://unikbalivilla.com/villas-for-sale/page/${page}/?localisation&statut&superficie-du-terrain&chambres&types-of=Villas+for+sale`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.property_unit_carousel .active a';
      const propertiesUrlArr = parsedContentList
        .querySelectorAll(propertiesClass)
        .map(item => item.getAttribute('href'));

      console.log(listUrl, propertiesUrlArr.length);

      if (!propertiesUrlArr.length) break;

      // const url = 'https://bali-home-immo.com/realestate-property/for-rent/villa/monthly/seminyak/5-bedroom-villa-for-rent-and-sale-in-bali-seminyak-ff039'
      // const url = propertiesUrlArr[0]
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
    const respItem = await axios.get(itemUrl);
    const parsedContent = parse(respItem.data);

    // get name
    const propertyNameSelector = 'p.the_title_villa';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    const info = parsedContent.querySelectorAll('ul.es_list li span')
      .reduce((aggr, item) => {
        const keyValue = item.text?.split(':') || [];
        if (keyValue[0] && keyValue[1]) {
          aggr[keyValue[0].trim()] = keyValue[1].trim();
        }
        return aggr;
      }, {});

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    const imgArr = parsedContent.querySelectorAll('.slides img')
      .map(item => item.getAttribute('src'));

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = info['Location'];
    propertyObj['ownership'] = info['Status'].indexOf('Leasehold') >= 0 ? 'leasehold' : 'freehold';
    propertyObj['leaseYearsLeft'] = info['Status'].indexOf('Leasehold') >= 0 ? parseNumeric(info['Status']) : '';;
    propertyObj['buildingSize'] = parseNumeric(info['Building size']);
    propertyObj['landSize'] = parseNumeric(info['Land size']);
    propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
    propertyObj['bedroomsCount'] = parseNumeric(info['Number of bedroom(s)']);
    propertyObj['bathroomsCount'] = parseNumeric(info['Number of bathroom(s)']);
    propertyObj['pool'] = info['Pool'];
    propertyObj['priceUSD'] = info['Price'];
    // propertyObj['priceIDR'] = priceIdr;
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balivillasales.com';
    // propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
