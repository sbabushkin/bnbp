import { ParserService } from "../parser.service";
import axios from "axios";
import { parseNumeric } from "../../helpers/common.helper";
import parse from "node-html-parser";
import { v4 } from 'uuid';
import {PropertyPrice} from "../entities/property_price.entity";

export class ExotiqpropertyService extends ParserService {

	public async parse() {
		const propertiesUrlArr = [];
		const hostUrl = 'https://www.exotiqproperty.com';
		const listingUrl = 'https://www.exotiqproperty.com/all-listings?for-lease=true&for-sale=true&villa=true'
		const listResp = await axios.get(listingUrl);
		const parsedContentList = parse(listResp.data);
		const propertiesClass = '.listing_item';

		parsedContentList.querySelectorAll(propertiesClass).forEach(el => {
			propertiesUrlArr.push(hostUrl + el.querySelector('.slider_second-link').getAttribute('href'));
		})
		const data = [];

		for (const url of propertiesUrlArr) {
			const item = await this.parseItem(url);
			if (!item) {
				continue;
			}
			data.push(item);
		}

		await this.loadToDb(data);

		return 'ok';
	}

	private async parseItem(itemUrl) {
		console.log('item URL >>>', itemUrl);
		let respItem;

		try {
			respItem = await axios.get(itemUrl);
		} catch (err) {
			console.error(err.message);
			return;
		}

		const parsedContent = parse(respItem.data);
		const infoObj = {};

		parsedContent.querySelectorAll('.detail-wrapper').forEach(el => {
			const title = el.querySelector('div.detail_title').text;
			const value = el.querySelector('div.detail-row > div').innerText;
			infoObj[title.trim()] = value.trim();
		});

		// Фильтры в самом запросе почему-то не работают
		if (infoObj['Type of property'] !== 'Villa') {
			console.log('Not villa...');
			return;
		}
		const propertyNameSelector = 'body > div.main > div.section-100vh.is--listing-top.wf-section > div.listing-container > h1';
		const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

		const itemUrlId = parsedContent
			.querySelector('#w-node-a5c74fbf-72e4-aab3-2830-bc671495bff2-c8406691 > div.info-txt')
			.text;

		const location = parsedContent
			.querySelectorAll('.listing-location')[0]
			.text;

		const imgArr = parsedContent.querySelectorAll('.img_grid').map(el => {
			return el.querySelector('div > a > img').getAttribute('src');
		});

		const priceIdr = parseNumeric(infoObj['Price'].replace('IDR').replace('Rp').trim());
		const leaseYearsLeft = parseNumeric(infoObj['Ownership details'].replace(' years lease'));

		const propertyObj = {};
		propertyObj['id'] = v4();
		propertyObj['externalId'] = itemUrlId;
		propertyObj['name'] = listingName;
		propertyObj['location'] = location;
		propertyObj['ownership'] = infoObj['Ownership'] === 'For sale' ? 'freehold' : 'leasehold';
 		propertyObj['buildingSize'] = parseNumeric(infoObj['Land area']);
		propertyObj['landSize'] = parseNumeric(infoObj['Building size']);
		propertyObj['leaseYearsLeft'] = propertyObj['ownership'] === 'freehold' ? undefined : leaseYearsLeft;
		propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
		propertyObj['bedroomsCount'] = parseNumeric(infoObj['Bedrooms']);
		propertyObj['bathroomsCount'] = parseNumeric(infoObj['Bathrooms']);
		propertyObj['pool'] = infoObj['Pool(s)'] ? 'Yes' : 'No' ;
		propertyObj['priceUsd'] = 0; // Не указано
		propertyObj['priceIdr'] = priceIdr;
		propertyObj['url'] = itemUrl;
		propertyObj['source'] = 'exotiqproperty.com';
		propertyObj['photos'] = imgArr[0];
		return propertyObj;
	}
}
