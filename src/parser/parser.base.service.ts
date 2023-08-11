import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "./entities/property.entity";
import { v4 } from 'uuid';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PropertyPrice } from "./entities/property_price.entity";
import { UpdatePropertyInput } from "./dto/update-property.input";
import { CacheService } from "../cache/cache.service";
import { CurrencyService } from "../currency/currency.service";

// TODO: move to config
const spreadsheetId = '1VdNUg64ef3HFnsy4A9q_RimC75L6AjCSBdLEZMeQJxE';
const sheetName = 'Dataset';
const TOKEN_PATH = join(process.cwd(), 'token.json');


export class ParserBaseService {

  private sheets;

  checkIsValid(item: any) { // TODO: types
    let isValid = true;

    if (!item.ownership) isValid = false;

    if (item.ownership && item.ownership === 'leasehold' && !item.leaseExpiryYear) {
      console.log('leaseExpiryYear does not exists');
      isValid = false;
    }

    if (item.leaseExpiryYear && item.ownership === 'leasehold') {
      if (String(item.leaseExpiryYear).length > 4) {
        isValid = false;
        console.log('invalid leaseExpiryYear');
      }
    }

    if (item.propertyType !== 'land' && !item.buildingSize) {
      console.log('buildingSize does not exists');
      isValid = false;
    }

    if (!item.priceUsd) {
      console.log('priceUsd does not exists');
      isValid = false;
    }

    return isValid;
  }

  normalizeLocation(location: string) { // TODO: area id instead of string
    const locations = [
      {value: 'Amed', groupBy: '', match: false},
      {value: 'Balian', groupBy: '', match: false},
      {value: 'Batu Belig', groupBy: '', match: false},
      {value: 'Karangasem', groupBy: '', match: false},
      {value: 'Kedungu', groupBy: '', match: false},
      {value: 'Kerobokan', groupBy: '', match: false},
      {value: 'Ketewel', groupBy: '', match: false},
      {value: 'Kuta', groupBy: '', match: false},
      {value: 'Lovina', groupBy: '', match: false},
      {value: 'Medewi', groupBy: '', match: false},
      {value: 'Megwi', groupBy: '', match: false},
      {value: 'North Bali', groupBy: '', match: false},
      {value: 'Pecatu', groupBy: '', match: false},
      {value: 'Saba', groupBy: '', match: false},
      {value: 'Sanur', groupBy: '', match: false},
      {value: 'Sukawati', groupBy: '', match: false},
      {value: 'Umalas', groupBy: '', match: false},
      {value: 'Bukit', groupBy: 'Bukit', match: false},
      {value: 'Balangan', groupBy: 'Bukit', match: false},
      {value: 'Bingin', groupBy: 'Bukit', match: false},
      {value: 'Jimbaran', groupBy: 'Bukit', match: false},
      {value: 'Nusa Dua', groupBy: 'Bukit', match: false},
      {value: 'Padang Padang', groupBy: 'Bukit', match: false},
      {value: 'Pecatu', groupBy: 'Bukit', match: false},
      {value: 'Uluwatu', groupBy: 'Bukit', match: false},
      {value: 'Ungasan', groupBy: 'Bukit', match: false},
      {value: 'Buwit', groupBy: 'Buwit', match: false},
      {value: 'Tabanan', groupBy: 'Buwit', match: false},
      {value: 'Canggu', groupBy: 'Canggu', match: false},
      {value: 'Babakan', groupBy: 'Canggu', match: false},
      {value: 'Batu Bolong', groupBy: 'Canggu', match: false},
      {value: 'Berawa', groupBy: 'Canggu', match: false},
      {value: 'Cemagi', groupBy: 'Canggu', match: false},
      {value: 'Echo Beach', groupBy: 'Canggu', match: false},
      {value: 'Kayu Tulang', groupBy: 'Canggu', match: false},
      {value: 'Nelayan', groupBy: 'Canggu', match: false},
      {value: 'North', groupBy: 'Canggu', match: false},
      {value: 'Nyanyi', groupBy: 'Canggu', match: false},
      {value: 'Padonan', groupBy: 'Canggu', match: false},
      {value: 'Pantai Lima', groupBy: 'Canggu', match: false},
      {value: 'Pererenan', groupBy: 'Canggu', match: false},
      {value: 'Seseh', groupBy: 'Canggu', match: false},
      {value: 'Tiying Tutul', groupBy: 'Canggu', match: false},
      {value: 'Tumbak Bayuh', groupBy: 'Canggu', match: false},
      {value: 'Other Islands', groupBy: 'Other Islands', match: false},
      {value: 'Lombok', groupBy: 'Other Islands', match: false},
      {value: 'Sumba', groupBy: 'Other Islands', match: false},
      {value: 'Seminyak', groupBy: 'Seminyak', match: false},
      {value: 'Batu Belig', groupBy: 'Seminyak', match: false},
      {value: 'Drupadi', groupBy: 'Seminyak', match: false},
      {value: 'Legian', groupBy: 'Seminyak', match: false},
      {value: 'Oberoi', groupBy: 'Seminyak', match: false},
      {value: 'Petitenget', groupBy: 'Seminyak', match: false},
      {value: 'Tabanan', groupBy: 'Tabanan', match: false},
      {value: 'Kedungu', groupBy: 'Tabanan', match: false},
      {value: 'Tanah Lot', groupBy: 'Tabanan', match: false},
      {value: 'Ubud', groupBy: 'Ubud', match: false},
      {value: 'Central', groupBy: 'Ubud', match: false},
      {value: 'Other', groupBy: 'Ubud', match: false},
      {value: 'Sayan', groupBy: 'Ubud', match: false},
      {value: 'Tegalalang', groupBy: 'Ubud', match: false},
      {value: 'Tegallalang', groupBy: 'Ubud', match: false},
    ];

    const matchedLocations = locations.map((loc) => {
      return {
        ...loc,
        match: location.toLowerCase().includes(loc.value.toLowerCase())
      }
    }).filter(loc => loc.match);

    return matchedLocations[0]?.value || location;
  }

  convertToUsd(idrValue: number, rate: number) {
    console.log(idrValue, rate);
    if (idrValue && rate) {
      return idrValue/rate;
    }
    return null;
  }

  parsePropertyTypeFromTitle(title: string) { // TODO: move to helper
    const types = {
      villa: 'villa',
      apartment: 'apartment',
      hotel: 'hotel/resort',
      resort: 'hotel/resort',
      land: 'land',
      commercial: 'commercial',
    }

    const includes = Object.keys(types)
      .map((type) => ({ includes: title.toLowerCase().includes(type), type }))
      .filter((value) => value.includes);

    const result = types[includes[0]?.type] || types.villa; // villa by default
    return result;
  }

  protected async loadToDb(data: Property[]) {
    const bindings = data.map(item => ([item.source, item.externalId]));

    const existedRows = await Property.query().whereIn(
      ['source', 'external_id'],
      bindings
    );    

    const existedRowsMap = existedRows.reduce((map, item) => {
      map[item.externalId] = item;
      return map;
    }, {});

    const insertData = data
      .filter(item => !existedRowsMap[item.externalId])
      .map(item => {
        item.prices = [{
          priceIdr: item.priceIdr,
          priceUsd: item.priceUsd,
        }]
        return item;
      });

    await Property.query().insertGraph(insertData);
    await PropertyPrice.query().insert(
      data
        .filter(item => existedRowsMap[item.externalId])
        .map(item => ({
          propertyId: existedRowsMap[item.externalId].id,
          priceIdr: item.priceIdr,
          priceUsd: item.priceUsd,
          created: (new Date()).toISOString(),
        }))
    );
  }

  protected async loadToSheets(items: Property[]) {
    const resource = {
      values: items.filter(item => !!item).map(item => ([
        item.name,
        item.url,
        item.location,
        null, // Ownership+Property type
        item.ownership,
        item.propertyType,
        item.landSize && item.landSize.toString().replace('.',','), // sqm
        item.landSize / 10, // are TODO: need formula
        item.buildingSize && item.buildingSize.toString().replace('.',','),
        item.bedroomsCount,
        item.bathroomsCount,
        item.priceIdr,
        item.priceUsd,
        null, // Villa Price per sqm
        null, // Price per sqm per year, Leasehold
        null, // Land price per are Freehold, USD
        null, // Land price per are Freehold, IDR
        item.leaseExpiryYear,
        item.leaseYearsLeft,
        null, // price per year
        null, // Land price per are per year Leasehold, $
        null, // Land price per are per year Leasehold, IDR
        null, // usd/idr
        null, // LIVING
        item.pool,
        'notes'
      ])),
    };
    try {
      const result = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A5`,
        valueInputOption: 'USER_ENTERED',
        resource,
      });
      console.log(`${result.data.updates.updatedCells} cells appended.`);
      return result;
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }
}
