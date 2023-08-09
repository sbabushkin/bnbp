import { ParserBaseService } from "../parser.base.service";
import axios from "axios";
import { parseNumeric } from "../../helpers/common.helper";
import parse from "node-html-parser";
import { v4 } from 'uuid';
import { CurrencyRate } from "../../currency/entities/currency.entity";

export class AnniedeanpropertiesService extends ParserBaseService { // TODO: resourse doesnt work properly

	public async parse() {
		const categories = ['leasehold', 'freehold'];
		let listUrl = '';
		const propertiesUrlArr = [];

		// TODO: move to service
		const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

		for (let category of categories) {
			listUrl = `https://anniedeanproperties.com/filters?type=villa&category=${category}&location_area=all&roomrange1=1&roomrange2=10&range1=1000&range2=100000`
			const listResp = await axios.get(listUrl);
			const parsedContentList = parse(listResp.data);
			const propertiesClass = 'ul > li';
			parsedContentList.querySelectorAll(propertiesClass).forEach(el => {
				propertiesUrlArr.push(el.querySelector('a').attrs.href);
			});
			console.log(listUrl, propertiesUrlArr.length);
		}

		const data = [];

		for (const url of propertiesUrlArr) {
			const item = await this.parseItem(url, currentRate);
			data.push(item);
		}

		await this.loadToDb(data);

		return 'ok';
	}

	private async parseItem(itemUrl, currentRate) {
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
		propertyObj['location'] = this.normalizeLocation(infoObj['Location']);
		propertyObj['ownership'] = infoObj['Title'];
		propertyObj['buildingSize'] = parseNumeric(infoObj['Building/Floor Area'].replace('sqm'));
		propertyObj['landSize'] =  parseNumeric(infoObj['Land Area'].replace('sqm'));
		// propertyObj['leaseYearsLeft'] = leaseYearsLeft;
		propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(listingName);
		propertyObj['bedroomsCount'] = parseNumeric(infoObj['bedrooms']);
		propertyObj['bathroomsCount'] = parseNumeric(infoObj['bathrooms']);
		propertyObj['pool'] = Number(infoObj['pool']) > 0 ? 'Yes' : 'No' ;
		propertyObj['priceUsd'] = parseNumeric(priceUsd) || this.convertToUsd(priceIdr, currentRate.amount);
		propertyObj['priceIdr'] = parseNumeric(priceIdr);
		propertyObj['url'] = itemUrl;
		propertyObj['source'] = 'anniedeanproperties.com';
		propertyObj['photos'] = imgArr[0];
		return propertyObj;
	}
}
