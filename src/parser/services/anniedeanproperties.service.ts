import { ParserService } from "../parser.service";
import axios from "axios";
import { parseNumeric } from "../../helpers/common.helper";
import parse from "node-html-parser";
import { v4 } from 'uuid';
import {Property} from "../entities/property.entity";
import {PropertyPrice} from "../entities/property_price.entity";

export class AnniedeanpropertiesService extends ParserService { // TODO: resourse doesnt work properly

	public async parse() {
		const categories = ['leasehold', 'freehold', 'rental'];
		let listUrl = '';
		const propertiesUrlArr = [];

		for (let category of categories) {
			listUrl = `https://anniedeanproperties.com/filters?type=villa&category=${category}&roomrange1=1&roomrange2=10&range1=1&range2=999`
			const listResp = await axios.get(listUrl);
			const parsedContentList = parse(listResp.data);
			const propertiesClass = '.search-list';
			parsedContentList.querySelectorAll(propertiesClass).forEach(el => {
				propertiesUrlArr.push(el.querySelector('.listing').attrs.href);
			});
			console.log(listUrl, propertiesUrlArr.length);
		}

		const data = [];

		for (const url of propertiesUrlArr) {
			const item = await this.parseItem(url);
			data.push(item);
		}

		await this.loadToDb(data);

		return 'ok';
	}

	private async parseItem(itemUrl) {
		console.log('item URL >>>', itemUrl)
		const respItem = await axios.get(itemUrl);
		const parsedContent = parse(respItem.data);

		// get name
		const propertyNameSelector = 'body > div:nth-child(7) > h4 > b';
		const listingName = parsedContent.querySelector(propertyNameSelector)?.text;

		// get main info
		const infoObj = {};

		parsedContent.querySelector('#detail-bg > table').childNodes.forEach(elems => {
			if(elems.text.trim().length > 3) {
				const pairStr = elems.text.trim().replace(/\n/g, '');
				const elemsArr = pairStr.split(':');
				infoObj[elemsArr[0]] = elemsArr[1];
			}
		})

		parsedContent.querySelector('#leak').childNodes.forEach(elems => {
			if(elems.text.trim().length > 3) {
				const pairStr = elems.text.trim().replace(/\n/g, '');
				const elemsArr = pairStr.split(':');
				infoObj[elemsArr[0]] = elemsArr[1];
			}
		})

		const itemUrlId =  itemUrl.split('/').pop();

		const [ priceIdr, priceUsd ] = infoObj['Price List'].replace('Rp', '').replace('$', '').trim().split('  ');

		const imgArr = parsedContent.querySelectorAll('.thumb-gallery').map(el => {
			return el.querySelector('a > img').attrs.src;
		});

		const propertyObj = {};

		propertyObj['id'] = v4();
		propertyObj['externalId'] = itemUrlId;
		propertyObj['name'] = listingName;
		propertyObj['location'] = infoObj['Location'];
		propertyObj['ownership'] = infoObj['Title'];
		propertyObj['buildingSize'] = parseNumeric(infoObj['Building/Floor Area'].replace('sqm'));
		propertyObj['landSize'] =  parseNumeric(infoObj['Land Area'].replace('sqm'));
		// propertyObj['leaseYearsLeft'] = leaseYearsLeft;
		propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
		propertyObj['bedroomsCount'] = parseNumeric(infoObj['bedrooms']);
		propertyObj['bathroomsCount'] = parseNumeric(infoObj['bathrooms']);
		propertyObj['pool'] = Number(infoObj['pool']) > 0 ? 'Yes' : 'No' ;
		propertyObj['priceUsd'] = parseNumeric(priceUsd);
		propertyObj['priceIdr'] = parseNumeric(priceIdr);
		propertyObj['url'] = itemUrl;
		propertyObj['source'] = 'anniedeanproperties.com';
		propertyObj['photos'] = imgArr[0];
		return propertyObj;
	}
}
