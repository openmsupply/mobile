/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { SUSSOL_ORANGE } from '../globalStyles/index';
import { vaccineStrings } from '../localization/index';
import { ScanRow } from '../pages/NewSensor/ScanRow';
import { selectScannedSensors } from '../selectors/Bluetooth/sensorScan';
import { TextWithIcon } from './Typography/index';
import { SensorScanActions } from '../actions/index';

const Spinner = () => (
  <TextWithIcon
    left
    Icon={<ActivityIndicator color={SUSSOL_ORANGE} />}
    containerStyle={{ justifyContent: 'center' }}
  >
    {vaccineStrings.scanning}
  </TextWithIcon>
);

export const SensorPickerComponent = ({
  macAddresses,
  startScan,
  stopScan,
  selectSensor,
  text,
}) => {
  const isFocused = useIsFocused();
  const isScanning = useRef();

  useEffect(() => {
    if (isFocused) {
      isScanning.current = true;
      startScan();
    } else {
      isScanning.current = false;
      stopScan();
    }
    return () => (isScanning.current ? stopScan() : null);
  }, [startScan, isFocused]);

  return (
    <FlatList
      data={macAddresses}
      renderItem={({ item }) => (
        <ScanRow selectSensor={selectSensor} macAddress={item} text={text} />
      )}
      keyExtractor={item => item}
      style={{ height: 360 }}
      ListFooterComponent={<Spinner />}
    />
  );
};

SensorPickerComponent.defaultProps = {
  text: vaccineStrings.connect,
};

SensorPickerComponent.propTypes = {
  macAddresses: PropTypes.array.isRequired,
  startScan: PropTypes.func.isRequired,
  stopScan: PropTypes.func.isRequired,
  selectSensor: PropTypes.func.isRequired,
  text: PropTypes.string,
};

const dispatchToProps = dispatch => {
  const startScan = () => dispatch(SensorScanActions.startSensorScan());
  const stopScan = () => dispatch(SensorScanActions.stopSensorScan());

  return { startScan, stopScan };
};

const stateToProps = state => {
  const macAddresses = selectScannedSensors(state);
  return { macAddresses };
};

export const SensorPicker = connect(stateToProps, dispatchToProps)(SensorPickerComponent);
