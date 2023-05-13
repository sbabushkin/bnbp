import { Model } from 'objection';
import { mapKeys, snakeCase, camelCase } from 'lodash';

const trimDeep = (value) => {
  if (value) {
    if (Array.isArray(value)) {
      value.forEach(trimDeep);
    }
    if (typeof value === 'object') {
      Object.keys(value).forEach((key) => {
        value[key] = trimDeep(value[key]);
      });
    }
    if (typeof value === 'string') {
      // eslint-disable-next-line no-param-reassign
      value = value.trim();
    }
  }
  return value;
};

export default class BaseModel extends Model {
  $formatDatabaseJson(json) {
    let jsonConv = super.$formatDatabaseJson(json);
    jsonConv = trimDeep(jsonConv);
    return mapKeys(jsonConv, (value, key) => snakeCase(key));
  }

  $parseDatabaseJson(json) {
    const jsonConv = mapKeys(json, (value, key) => camelCase(key));
    const jsonWithParsedDates = Object.entries(jsonConv).reduce(
      (aggr, [key, val]) => {
        if (val instanceof Date) {
          aggr[key] = val.toISOString();
        } else {
          aggr[key] = val;
        }
        return aggr;
      },
      {},
    );

    return super.$parseDatabaseJson(jsonWithParsedDates);
  }
}
