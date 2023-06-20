import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "../entities/property.entity";
import { v4 } from 'uuid';
import { parseNumeric } from "../../helpers/common.helper";
import { ParserService } from "../parser.service";


export class BalimovesService extends ParserService {

  public async parse() {

    let page = 1;

    while (true) {
      const listUrl = `https://www.balimoves.com/buy/?fwp_paged=${page}`;
      const listResp = await axios.get(listUrl);
      const parsedContentList = parse(listResp.data);
      const propertiesClass = '.new-listing-cta a';
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

    // get name
    const propertyNameSelector = 'h1.fl-heading span';
    const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

    //

    // get ownership
    const ownershipSelector = '.fa-copy';
    const ownership = parsedContent.querySelector(ownershipSelector)
      .parentNode.parentNode.querySelector('p').text.toLowerCase();
    //
    // get land size
    const landSizeSelector = '.property-detail-land';
    const landSize = parsedContent.querySelector(landSizeSelector)?.text;
    //
    // get building size
    const buildingSizeSelector = '.fa-expand';
    const buildingSizeParagraph = parsedContent.querySelector(buildingSizeSelector)
      .parentNode.parentNode.querySelector('p');
    buildingSizeParagraph.removeChild(buildingSizeParagraph.querySelector('sup'));
    const buildingSize = buildingSizeParagraph.text;
    //
    // get bedrooms
    const bedroomsSelector = '.property-detail-beds';
    const bedrooms = parsedContent.querySelector(bedroomsSelector)?.text;
    //
    // get price / years
    const priceYearsSelector = '.fl-html';
    const priceYears = parsedContent.querySelector(priceYearsSelector)?.text
      .trim().toLowerCase().split('lease until');

    const regexIdr = /idr [0-9.]+/g;
    const regexUsd = /usd [0-9.]+/g;

    const priceIdr = priceYears[0].match(regexIdr) ? parseNumeric(priceYears[0].match(regexIdr)[0]) : 0;
    const priceUsd = priceYears[0].match(regexUsd) ? parseNumeric(priceYears[0].match(regexUsd)[0]) : 0;
    // const priceUsd = priceYears[0].indexOf('usd') == 0 ? parseNumeric(priceYears[0]) : 0;
    const leaseExpiryYear = priceYears[1] && parseNumeric(priceYears[1].split(' ').pop());

    // get pool
    const poolSelector = '.fa-swimmer';
    const poolExists = parsedContent.querySelector(poolSelector);
    //
    // get bathrooms
    const bathroomsSelector = '.property-detail-baths';
    const bathrooms = parsedContent.querySelector(bathroomsSelector)?.text;
    //
    // get location
    const propertyLocationSelector = '.fa-map-marker-alt';
    const location = parsedContent.querySelector(propertyLocationSelector)
      .parentNode.parentNode.querySelector('p').text;

    const itemUrlId =  itemUrl.slice(0, -1).split('/').pop();

    const noscriptHtml = parsedContent.querySelector('.justified-image-grid-html').text;
    const parsedNoScript = parse(noscriptHtml);

    const imgArr = parsedNoScript.querySelectorAll('li a')
      .map(item => item.getAttribute('href'));

    const propertyObj = {};

    propertyObj['id'] = v4();
    propertyObj['externalId'] = itemUrlId;
    propertyObj['name'] = listingName;
    propertyObj['location'] = location.split(',')[0];
    propertyObj['ownership'] = ownership.indexOf('leasehold') >= 0 ? 'leasehold' : 'freehold';
    propertyObj['buildingSize'] = parseNumeric(buildingSize);
    propertyObj['landSize'] = parseFloat(landSize.replace(',', '.'));
    // propertyObj['leaseYearsLeft'] = leaseYearsLeft;
    propertyObj['leaseExpiryYear'] = leaseExpiryYear;
    propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
    propertyObj['bedroomsCount'] = parseNumeric(bedrooms);
    propertyObj['bathroomsCount'] = parseNumeric(bathrooms);
    propertyObj['pool'] = poolExists ? 'Yes' : 'No';
    propertyObj['priceUsd'] = priceUsd;
    propertyObj['priceIdr'] = priceIdr;
    propertyObj['url'] = itemUrl;
    propertyObj['source'] = 'balimoves.com';
    propertyObj['photos'] = imgArr[0];
    return propertyObj;
  }

}
