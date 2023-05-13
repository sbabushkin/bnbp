import { parse } from 'node-html-parser';
import axios from 'axios';
import { Property } from "./entities/property.entity";
import { v4 } from 'uuid';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

// TODO: move to config
const spreadsheetId = '1VdNUg64ef3HFnsy4A9q_RimC75L6AjCSBdLEZMeQJxE';
const sheetName = 'Dataset';
const TOKEN_PATH = join(process.cwd(), 'token.json');

export class ParserService {

  private sheets;

  constructor() {
    // const content = readFileSync(TOKEN_PATH).toString();
    // const credentials = JSON.parse(content);
    // const auth = google.auth.fromJSON(credentials);
    this.sheets = {}; //google.sheets({version: 'v4', auth});
  }

  // protected async loadToDb(items: Property[]) {}

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
        item.priceIDR,
        item.priceUSD,
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
