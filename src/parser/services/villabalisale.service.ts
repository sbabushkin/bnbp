import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric, parsePrice, parseSquare } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { getYear } from 'date-fns';
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class VillabalisaleService extends ParserBaseService {

	public async parse() {

		let page = 1;

		// TODO: move to service
		const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();
		while (true) {
			const url = `https://www.villabalisale.com/search/villas-for-sale?page=${page}`;
			const resp = await axios.get(url);
			const parsedContent = parse(resp.data);
			const props = parsedContent.querySelectorAll('.box-item ');

			const urlsArr = props.map(el => {
				return el.querySelector('a').getAttribute('href');
			});

			console.log(url, urlsArr.length);

			if (!urlsArr.length) break;

			const data = [];

			for (const url of urlsArr) {
				const item = await this.parseItem(url, currentRate);
				data.push(item);
			}

			await this.loadToDb(data);
			page += 1;
		}
		return 'ok';
	}

	private async parseItem(itemUrl, currentRate) {
		console.log('item URL >>>', itemUrl)
		const respItem = await axios.get(itemUrl);
		const parsedContent = parse(respItem.data);

		const infoObj = {};
		parsedContent.querySelector('div.available ').querySelectorAll('.item').forEach(el => {
			const valueOfI = el.querySelector('i').text.trim();

			switch (valueOfI) {
				case 'place':
					infoObj['location'] = el.querySelector('span').text.trim();
					break;
				case 'hotel':
					infoObj['bedroomsCount'] = el.querySelector('p').text.trim();
					break;
				case 'zoom_out_map':
					const landSizeStr = el.querySelector('p > span').text.trim();
					const landSizeInAres = Number(parseFloat(landSizeStr));
					infoObj['landSize'] = landSizeInAres * 100;
					infoObj['buildingSize'] = parseNumeric(el.querySelectorAll('p')[1].text.trim());
					break;
				case 'info_outline':
					const paragraphs = el.querySelectorAll('p');
					infoObj['ownership'] = paragraphs[0].text.trim().replace(' ', '');
					infoObj['leaseYearsLeft'] = parseNumeric(paragraphs[1].text.trim());
					break;
				case '':
					infoObj['bathroomsCount'] = parseNumeric(el.querySelector('p').text.trim());
					break;
			}
		});

		const externalId = parsedContent.querySelectorAll('.property-description-column')[1].querySelector('p > strong').text
		const name = parsedContent.querySelector('#property-name').text;
		const priceUsd = parsedContent.querySelector('#content > div > div.right-side > div.price > div.regular-price').text;
		const isHavePool = parsedContent.querySelectorAll('.property-facility').filter(el => el.innerText.indexOf('Pool') !== -1);

		const imgArr = parsedContent.querySelector('.property_detail_slide').querySelectorAll('figure').map(el => {
			return el.querySelector('img').getAttribute('src');
		});

		const leaseYearsLeft = parseInt(infoObj['leaseYearsLeft']) || 0;

		const propertyObj = {};
		propertyObj['id'] = v4();
		propertyObj['externalId'] = externalId;
		propertyObj['name'] = name;
		propertyObj['location'] = this.normalizeLocation(infoObj['location']);;
		propertyObj['ownership'] = infoObj['ownership'];
		propertyObj['buildingSize'] = infoObj['buildingSize'];
		propertyObj['landSize'] = infoObj['landSize'] || null;

		if (leaseYearsLeft) {
			propertyObj['leaseExpiryYear'] = getYear(new Date()) + leaseYearsLeft;
		}
		// propertyObj['leaseYearsLeft'] = infoObj['leaseYearsLeft'] ? infoObj['leaseYearsLeft'] : undefined;
		propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(name);
		propertyObj['bedroomsCount'] = infoObj['bedroomsCount'];
		propertyObj['bathroomsCount'] = infoObj['bathroomsCount'];
		propertyObj['pool'] = isHavePool.length ? 'Yes' : 'No' ;
		propertyObj['priceUsd'] = Number(parseNumeric(priceUsd)) ? parseNumeric(priceUsd) : null;
		// propertyObj['priceIdr'] = 0; // не указано
		propertyObj['url'] = itemUrl;
		propertyObj['source'] = 'villabalisale.com';
		propertyObj['photos'] = imgArr[0];
		propertyObj['isValid'] = this.checkIsValid(propertyObj);
		console.log(propertyObj);
		return propertyObj;
	}
}
