/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class TemperatureLog extends Realm.Object {}

TemperatureLog.schema = {
  name: 'TemperatureLog',
  primaryKey: 'id',
  properties: {
    id: 'string',
    temperature: 'double',
    timestamp: 'date',
    location: 'Location',
    sensor: 'Sensor',
    logInterval: 'int',
    breach: { type: 'TemperatureBreach', optional: true },
  },
};

export default TemperatureLog;
