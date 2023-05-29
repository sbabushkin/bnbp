import { ParserService } from "../parser.service";
import axios from "axios";
import { parseNumeric } from "../../helpers/common.helper";
import parse from "node-html-parser";
import { v4 } from 'uuid';

export class OptimumbaliService extends ParserService {

	public async parse() {

		let page = 1;
		while (true) {
			const url = `https://optimumbali.com/villa-bali/property-for-sale/page/${page}/`;
			const resp = await axios.get(url);
			const parsedContent = parse(resp.data);
			const props = parsedContent.querySelectorAll('div.property_unit_custom.row_no_4.col-md-12');

			const urlsArr = props.map(el => {
				return el.querySelector('div > h4 > a').getAttribute('href');
			});

			console.log(url, urlsArr.length);

			if (!urlsArr.length) break;

			const data = [];

			for (const url of urlsArr) {
				const item = await this.parseItem(url);
				data.push(item);
			}

			await this.loadToDb(data);

			page += 1;
		}
		return 'ok';
	}

	private async parseItem(itemUrl) {
		console.log('item URL >>>', itemUrl)
		const respItem = await axios.get(itemUrl);
		const parsedContent = parse(respItem.data);

		const leaseDuration = parsedContent.querySelector('.suruneligne').text.trim().replace(/\n/g, '').split(':')[1].slice(0, 2).trim();

		const infoObj = {};
		parsedContent.querySelectorAll('.property_custom_detail_wrapper').forEach(el => {
			if(el.text.indexOf(':') !== -1) {
				const pairStr = el.text.trim().replace(/\n/g, '');
				const elemsArr = pairStr.split(':');
				infoObj[elemsArr[0].trim()] = elemsArr[1];
			}
			if(el.text.indexOf('±') === -1 && el.text.split(' | ').length === 3) {
				const [externalId, name, fullLocation] = el.text.split(' | ');
				infoObj['externalId'] = externalId.trim();
				infoObj['name'] = name;
				infoObj['location'] = fullLocation.split('–')[0].trim();
			}
		});

		const imgArr = parsedContent.querySelectorAll('.multi_image_slider_image').map(el => {
			return el.getAttribute('data-bg');
		});

		const propertyObj = {};

		switch (infoObj['Price'].slice(3)) {
			case 'USD':
				propertyObj['priceUsd'] = parseNumeric(infoObj['Price'].replace('USD'));
				propertyObj['priceIdr'] = Number(propertyObj['priceUsd']) * 14962.35;
				break;
			case 'IDR':
				propertyObj['priceIdr'] = parseNumeric(infoObj['Price'].replace('IDR'));
				propertyObj['priceUsd'] = Number(propertyObj['priceIdr']) * 0.000067;
				break;
			case 'EUR':
				const valueInEur = parseNumeric(infoObj['Price'].replace('EUR'));
				propertyObj['priceUsd'] = Number(valueInEur) * 1.07;
				propertyObj['priceIdr'] = Number(valueInEur) * 16029.61;
				break;
		}

		propertyObj['id'] = v4();
		propertyObj['externalId'] = infoObj['externalId'];
		propertyObj['name'] = infoObj['name'];
		propertyObj['location'] = infoObj['location'];
		propertyObj['ownership'] = leaseDuration === 'Fr' ? 'freehold' : 'leasehold';
		propertyObj['buildingSize'] = parseNumeric(infoObj['Living space'].replace('m2'));
		propertyObj['landSize'] = parseNumeric(infoObj['Land size'].replace('m2'));
		propertyObj['leaseYearsLeft'] = leaseDuration === 'Fr' ? undefined : leaseDuration;
		propertyObj['propertyType'] = 'Villa'; // TODO: ask about it
		propertyObj['bedroomsCount'] = parseNumeric(infoObj['Bedrooms']);
		propertyObj['bathroomsCount'] = parseNumeric(infoObj['Bathrooms']);
		// propertyObj['pool'] = isHavePool ? 'Yes' : 'No'; Не указано
		propertyObj['url'] = itemUrl;
		propertyObj['source'] = 'optimumbali.com';
		propertyObj['photos'] = imgArr[0];
		return propertyObj;
	}
}
