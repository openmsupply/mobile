/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';

import { selectUsingVaccines } from '../selectors/modules';
import { PermissionSelectors } from '../selectors/permission';
import { PermissionActions } from '../actions/PermissionActions';

import { useToggle } from '../hooks/index';
import { CancelIcon, CogIcon, ConfirmIcon, DisabledIcon, HazardIcon } from './icons';
import { PaperModalContainer } from './PaperModal/PaperModalContainer';
import { IconButton } from './IconButton';
import { FlexRow } from './FlexRow';

import { SUSSOL_ORANGE } from '../globalStyles';
import { modalStrings } from '../localization';

const PermissionRow = ({ comment, enabled, onPress, label }) => (
  <TouchableOpacity onPress={enabled ? null : onPress}>
    <FlexRow alignItems="flex-start" flex={0} style={localStyles.permissionRowContainer}>
      {enabled ? <ConfirmIcon /> : <DisabledIcon />}
      <FlexRow style={{ flexDirection: 'column', marginLeft: 10 }}>
        <Text style={localStyles.permissionRowText}>{label}</Text>
        <Text style={localStyles.permissionRowComment}>{comment}</Text>
      </FlexRow>
    </FlexRow>
  </TouchableOpacity>
);

PermissionRow.defaultProps = {
  comment: '',
};

PermissionRow.propTypes = {
  comment: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

const PermissionChecker = ({ enabled, checkPermissions }) => {
  const handler = useRef();

  useEffect(() => {
    if (enabled && handler.current) {
      clearInterval(handler.current);
    }
    if (!enabled) {
      handler.current = setInterval(() => checkPermissions(), 500);
    }
    return () => clearInterval(handler.current);
  }, [enabled]);
  return <></>;
};
PermissionChecker.propTypes = {
  enabled: PropTypes.bool.isRequired,
  checkPermissions: PropTypes.func.isRequired,
};

const SettingsIconComponent = ({
  bluetooth,
  checkPermissions,
  location,
  locationService,
  requestBluetooth,
  requestLocation,
  requestLocationService,
  requestWriteStorage,
  usingVaccines,
  writeStorage,
}) => {
  const [settingsModalOpen, toggleSettingsModal] = useToggle();

  if (!usingVaccines) {
    return null;
  }

  const icon =
    location && bluetooth && writeStorage && locationService ? (
      <CogIcon />
    ) : (
      <HazardIcon color={SUSSOL_ORANGE} size={20} />
    );

  return (
    <>
      <IconButton Icon={icon} containerStyle={{ marginLeft: 8 }} onPress={toggleSettingsModal} />

      <PaperModalContainer
        isVisible={settingsModalOpen}
        onClose={toggleSettingsModal}
        heightFactor={0.6}
      >
        <View style={localStyles.container}>
          <FlexRow
            alignItems="flex-start"
            justifyContent="flex-end"
            style={localStyles.cancelContainer}
            flex={0}
          >
            <IconButton onPress={toggleSettingsModal} Icon={<CancelIcon />} />
          </FlexRow>

          <Text>{modalStrings.permissions_intro_1}</Text>
          <Text style={localStyles.intro}>{modalStrings.permissions_intro_2}</Text>
          <Text style={localStyles.heading}>{modalStrings.permissions}</Text>
          <PermissionRow
            onPress={requestWriteStorage}
            label={modalStrings.storage_permission}
            comment={modalStrings.storage_permission_comment}
            enabled={writeStorage}
          />
          <PermissionRow
            onPress={requestLocation}
            label={modalStrings.location_permission}
            comment={modalStrings.location_permission_comment}
            enabled={location}
          />
          <Text style={localStyles.heading}>{modalStrings.services}</Text>
          <PermissionRow
            onPress={requestBluetooth}
            label={modalStrings.bluetooth_permission}
            comment={modalStrings.bluetooth_permission_comment}
            enabled={bluetooth}
          />
          <PermissionRow
            onPress={requestLocationService}
            label={modalStrings.location_service}
            comment={modalStrings.location_service_comment}
            enabled={locationService}
          />
        </View>
        <PermissionChecker checkPermissions={checkPermissions} enabled={locationService} />
      </PaperModalContainer>
    </>
  );
};

const localStyles = StyleSheet.create({
  cancelContainer: { padding: 5, width: '100%' },
  container: {
    justifyContent: 'flex-start',
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 20,
  },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  intro: { marginBottom: 15 },
  permissionRowComment: {},
  permissionRowContainer: { marginBottom: 15, marginLeft: 30 },
  permissionRowText: { fontSize: 16, fontWeight: 'bold' },
});

const stateToProps = state => {
  const usingVaccines = selectUsingVaccines(state);
  const bluetooth = PermissionSelectors.bluetooth(state);
  const writeStorage = PermissionSelectors.writeStorage(state);
  const location = PermissionSelectors.location(state);
  const locationService = PermissionSelectors.locationService(state);
  return { bluetooth, location, locationService, usingVaccines, writeStorage };
};

const dispatchToProps = dispatch => {
  const checkPermissions = () => dispatch(PermissionActions.checkPermissions());
  const requestWriteStorage = () => dispatch(PermissionActions.requestWriteStorage());
  const requestLocation = () => dispatch(PermissionActions.requestLocation());
  const requestLocationService = () => dispatch(PermissionActions.requestLocationService());
  const requestBluetooth = () => dispatch(PermissionActions.requestBluetooth());

  return {
    checkPermissions,
    requestBluetooth,
    requestLocation,
    requestLocationService,
    requestWriteStorage,
  };
};

SettingsIconComponent.propTypes = {
  bluetooth: PropTypes.bool.isRequired,
  checkPermissions: PropTypes.func.isRequired,
  location: PropTypes.bool.isRequired,
  locationService: PropTypes.bool.isRequired,
  requestBluetooth: PropTypes.func.isRequired,
  requestLocation: PropTypes.func.isRequired,
  requestLocationService: PropTypes.func.isRequired,
  requestWriteStorage: PropTypes.func.isRequired,
  usingVaccines: PropTypes.bool.isRequired,
  writeStorage: PropTypes.bool.isRequired,
};
export const SettingsIcon = connect(stateToProps, dispatchToProps)(SettingsIconComponent);
