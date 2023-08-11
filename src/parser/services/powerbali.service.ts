import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric, parseSquare, parseText } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";
import { getYear } from 'date-fns';


export class PowerbaliService extends ParserBaseService {

	public async parse() {
		let page = 1;

		// TODO: move to service
		const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();
		while (true) {
			const url = `https://www.powerbali.com/property-type/resale-villas/page/${page}/`;
			let resp;
			try {
				resp = await axios.get(url);
			} catch (e) {
				console.error(e.message);
				break;
			}

			const parsedContent = parse(resp.data);

			const urlsArr = parsedContent.querySelectorAll('.property-item').map(el => {
				return el.querySelector('figure > a').getAttribute('href');
			})

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

		const externalId = parsedContent
			.querySelector('#overview > h3')
			.text
			.split('::')[1]
			.trim();

		const name = parsedContent.querySelector('#overview > article > div.wrap.clearfix > h4').text;

		const aboutLocation = parsedContent
			.querySelector('#overview > article > div.wrap.clearfix > h5 > span.status-label')
			.text
			.split('-')[1]
			.trim()

		const location = aboutLocation.indexOf(',') === -1 ? aboutLocation : aboutLocation.split(',')[1].trim();

		const infoObj = {};

		const price = parsedContent
			.querySelector('#overview > article > div.wrap.clearfix > h5 > span:nth-child(2)')
			.text
			.trim()
			.replace(/,/g, '');

		infoObj['price' + price.slice(0, 3)] = parseNumeric(price)

		parsedContent.querySelectorAll('.tbl-property-details').forEach(el => {
			const arr = el.querySelectorAll('td')
			for (let i = 0; i < arr.length; i += 2) {
				infoObj[arr[i].text.trim()] = arr[i + 1].text.trim().slice(2);
			}
		})

		const checkBathrooms = parsedContent.querySelector('#overview > article > div.property-meta.clearfix > span:nth-child(3)')?.text;
		if (checkBathrooms?.includes('Print this page')) {
			infoObj['bedroomsCount'] = parsedContent.querySelector('#overview > article > div.property-meta.clearfix > span:nth-child(1)').text[0];
			infoObj['bathroomsCount'] = parsedContent.querySelector('#overview > article > div.property-meta.clearfix > span:nth-child(2)').text[0];
		} else if (checkBathrooms?.length) {
			infoObj['bedroomsCount'] = parsedContent.querySelector('#overview > article > div.property-meta.clearfix > span:nth-child(2)')?.text[0];
			infoObj['bathroomsCount'] = checkBathrooms[0];
		}

		const imgArr = parsedContent.querySelectorAll('ul.slides > li').map(el => {
			return el.querySelector('a').getAttribute('href');
		})

		const matches = infoObj['Leasehold Period']?.match(/\d{4}/g);
		const matchesYears = infoObj['Leasehold Period']?.match(/\d{2} years/g);
		if (matches?.length) infoObj['leaseExpiryYear'] = matches[0] || getYear(new Date()) + parseInt(matchesYears[0]);

		let buildingSize = parseNumeric(infoObj['House size']?.split(' And ')[0]?.split(' - ')[0]);
		let landSize = parseNumeric(infoObj['Land size']?.split(' And ')[0]?.split(' - ')[0]);
		if (infoObj['House size']?.includes('.')) buildingSize = parseFloat(infoObj['House size'].split(' ')[0]);
		if (infoObj['Land size']?.includes('.')) landSize = parseFloat(infoObj['Land size'].split(' ')[0]);

		const propertyObj = {};
		propertyObj['id'] = v4();
		propertyObj['externalId'] = externalId;
		propertyObj['name'] = name;
		propertyObj['location'] = this.normalizeLocation(location);
		propertyObj['ownership'] = infoObj['Title']?.split(',')[0].trim().toLowerCase();
		propertyObj['leaseExpiryYear'] = infoObj['leaseExpiryYear'];
		propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(name);
		propertyObj['buildingSize'] = buildingSize;
		propertyObj['landSize'] = landSize;
		propertyObj['bedroomsCount'] = infoObj['bedroomsCount'];
		propertyObj['bathroomsCount'] = infoObj['bathroomsCount'];
		// propertyObj['pool'] = isHavePool ? 'Yes' : 'No';
		propertyObj['priceIdr'] = infoObj['priceIDR'];
		propertyObj['priceUsd'] = infoObj['priceUSD'] || this.convertToUsd(propertyObj['priceIdr'], currentRate.amount);
		propertyObj['url'] = itemUrl;
		propertyObj['source'] = 'powerbali.com';
		propertyObj['photos'] = imgArr[0];
		propertyObj['isValid'] = this.checkIsValid(propertyObj);
		return propertyObj;
	}
}
