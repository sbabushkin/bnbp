import { parse } from 'node-html-parser';
import axios from 'axios';
import { v4 } from 'uuid';
import { parseNumeric, parsePrice, parseSquare } from "../../helpers/common.helper";
import { ParserBaseService } from "../parser.base.service";
import { CurrencyRate } from "../../currency/entities/currency.entity";


export class SuasarealestateService extends ParserBaseService {

	public async parse() {
		let page = 1;

		// TODO: move to service
		const currentRate = await CurrencyRate.query().where({ from: 'USD'}).orderBy('created', 'desc').first();

		while (true) {
			const url = `https://www.suasarealestate.com/wp-json/wp/v2/villa?page=${page}&per_page=100`; // TODO: catch 404

			let resp;

			try {
				resp = await axios.get(url);
			} catch (e) {
				console.error(e.message);
				break;
			}

			const urlsArr = resp.data.map(el => el.link);
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
			.querySelector('#main > section:nth-child(1) > div > div:nth-child(1) > div.col-12.col-lg-5 > section > ul > li:nth-child(1)')
			.text
			.split(':')[1]
			.trim();

		const name = parsedContent.querySelector('#main > section:nth-child(1) > div > div:nth-child(1) > div.col-12.col-lg-7 > h1').text;
		const location = name.slice(name.lastIndexOf('in') + 2, name.length).trim();

		const infoObj = {};

		const price = parsedContent
			.querySelector('#main > section:nth-child(1) > div > div:nth-child(1) > div.col-12.col-lg-5 > section > ul > li.prop-price > div > span')
			?.text
			?.replace(/,/g, '')
			?.trim();

		const currency = price?.slice(0, 3);
		infoObj['price' + currency] = parseNumeric(price);

		const convertedPriceUsd = this.convertToUsd(infoObj['priceIDR'], currentRate.amount)

		parsedContent.querySelectorAll('.table').forEach(el => {
			const arr = el.querySelectorAll('td')
			for (let i = 0; i < arr.length; i += 2) {
				infoObj[arr[i].text.trim()] = arr[i + 1].text.trim();
			}
		})

		const img = parsedContent
			.querySelector('.photoswipe-item > a')
			.getAttribute('href');

		const propertyObj = {};
		propertyObj['id'] = v4();
		propertyObj['externalId'] = externalId;
		propertyObj['name'] = name;
		propertyObj['location'] = this.normalizeLocation(location);
		propertyObj['ownership'] = infoObj['Term'].toLowerCase();
		propertyObj['buildingSize'] = parseNumeric(infoObj['Building Size'].replace('m2'));
		propertyObj['landSize'] = parseNumeric(infoObj['Land Size'].replace('m2'));
		propertyObj['leaseExpiryYear'] = parseNumeric(infoObj['End of Lease']) || undefined;
		propertyObj['propertyType'] = this.parsePropertyTypeFromTitle(name);
		propertyObj['bedroomsCount'] = parseNumeric(infoObj['Number of Bedroom(s)']);
		propertyObj['bathroomsCount'] = parseNumeric(infoObj['Number of Bathroom(s)']);
		propertyObj['pool'] = infoObj['Pool Size'] ? 'Yes' : 'No' ;
		propertyObj['priceIdr'] = infoObj['priceIDR'] || null;
		propertyObj['priceUsd'] = infoObj['priceUSD'] || convertedPriceUsd;
		propertyObj['url'] = itemUrl;
		propertyObj['source'] = 'suasarealestate.com';
		propertyObj['photos'] = img;
		propertyObj['isValid'] = this.checkIsValid(propertyObj);
		return propertyObj;
	}

}
