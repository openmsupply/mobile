/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

const DOMAIN_OFFSET = 3;
const AXIS_OFFSET = 50;
const STROKE_WIDTH = 2;
const STROKE_SIZE = 3;
const INTERPOLATION = 'natural';
const MAX_DATA_POINTS = 30;

const SENSOR_LOGS_PER_TEMPERATURE_LOG = 6;

export const VACCINE_CONSTANTS = {
  SENSOR_LOGS_PER_TEMPERATURE_LOG,
};

export const CHART_CONSTANTS = {
  DOMAIN_OFFSET,
  AXIS_OFFSET,
  STROKE_SIZE,
  STROKE_WIDTH,
  INTERPOLATION,
  MAX_DATA_POINTS,
};

export const VACCINE_ENTITIES = {
  SENSOR: 'Sensor',
  TEMPERATURE_LOG: 'TemperatureLog',
  TEMPERATURE_BREACH: 'TemperatureBreach',
  TEMPERATURE_BREACH_CONFIGURATION: 'TemperatureBreachConfiguration',
  SENSOR_LOG: 'SensorLog',
};
