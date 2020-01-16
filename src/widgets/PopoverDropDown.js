/* eslint-disable react/forbid-prop-types */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withNavigation } from 'react-navigation';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Popover from 'react-native-popover-view';

import { usePopover } from '../hooks';

import {
  SUSSOL_ORANGE,
  BLUE_WHITE,
  APP_FONT_FAMILY,
  textStyles,
  DARKER_GREY,
  APP_GENERAL_FONT_SIZE,
} from '../globalStyles';

const DropDownOption = ({ text, onPress, isLast }) => {
  const {
    dropDownOptionText,
    dropDownOptionContainer,
    dropDownOptionInnerContainer,
    dropDownOptionInnerBorder,
  } = localStyles;

  const onPressCallback = React.useCallback(() => onPress(text), [text]);

  return (
    <View style={dropDownOptionContainer}>
      <View
        style={{ ...dropDownOptionInnerContainer, ...(isLast ? {} : dropDownOptionInnerBorder) }}
      >
        <TouchableOpacity onPress={onPressCallback}>
          <Text style={dropDownOptionText}>{text}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

DropDownOption.propTypes = {
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  isLast: PropTypes.bool.isRequired,
};

const DropDown = ({ anchorRef, isVisible, options, onSelection, onClose, title, isDisabled }) => {
  const {
    dropDownContainer,
    dropDownTitleContainer,
    dropDownTitleInnerContainer,
    popoverBackgroundStyle,
    arrowStyle,
  } = localStyles;

  return (
    <Popover
      isVisible={isVisible}
      fromView={anchorRef.current}
      onRequestClose={onClose}
      arrowStyle={arrowStyle}
      backgroundStyle={popoverBackgroundStyle}
      placement="auto"
      animationConfig={{ duration: 50 }}
    >
      <View style={dropDownContainer}>
        <View style={dropDownTitleContainer}>
          <View style={dropDownTitleInnerContainer}>
            <Text style={textStyles}>{title}</Text>
          </View>
        </View>
        {options.map((option, index) => (
          <DropDownOption
            key={option}
            text={option}
            onPress={isDisabled ? null : onSelection}
            isLast={options.length - 1 === index}
          />
        ))}
      </View>
    </Popover>
  );
};

/**
 * Component opening a popover list as a drop down menu. Opens
 * relative to the component passed in `BaseComponent`, at the
 * left/right/bottom/top position which has the most free space.
 *
 * Usage:
 * @prop {Object}      navigation The navigation object passed by withNavigation
 * @prop {React.Node}  BaseComponent Any component which will be wrapped in a Touchable.
 * @prop {Array}       options An array of strings, the options to choose.
 * @prop {Func}        onSelection The callback invoked when a selection is made.
 * @prop {String}      title A title for the drop down.
 */
export const PopoverDropDown = withNavigation(
  ({ navigation, BaseComponent, options, onSelection, title, isDisabled }) => {
    const [ref, visible, show, close] = usePopover(navigation);

    const selectionCallback = React.useCallback(
      arg => {
        close();
        onSelection(arg);
      },
      [onSelection]
    );

    const { length } = options;
    const Container = React.useMemo(() => (length ? TouchableOpacity : View), [length]);
    return (
      <>
        <Container onPress={show} ref={ref}>
          <BaseComponent />
        </Container>
        <DropDown
          isDisabled={isDisabled}
          anchorRef={ref}
          options={options}
          isVisible={visible}
          onSelection={selectionCallback}
          onClose={close}
          title={title}
        />
      </>
    );
  }
);

const localStyles = StyleSheet.create({
  dropDownContainer: { borderColor: DARKER_GREY, borderWidth: 1 },
  dropDownTitleContainer: {
    height: 40,
    justifyContent: 'center',
    borderBottomColor: BLUE_WHITE,
    borderBottomWidth: 1,
  },
  dropDownTitleInnerContainer: {
    height: 20,
    borderLeftColor: SUSSOL_ORANGE,
    borderLeftWidth: 3,
    justifyContent: 'center',
    paddingLeft: 25,
  },
  dropDownOptionContainer: {
    minWidth: 200,
    minHeight: 75,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingLeft: 30,
    paddingRight: 30,
  },
  dropDownOptionInnerContainer: {
    borderBottomColor: BLUE_WHITE,
    justifyContent: 'center',
    minHeight: 75,
    borderBottomWidth: 1,
  },
  dropDownOptionInnerBorder: {
    borderBottomColor: SUSSOL_ORANGE,
    borderBottomWidth: 1,
  },
  dropDownOptionText: {
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
  },
  arrowStyle: { backgroundColor: 'transparent' },
  popoverBackgroundStyle: { backgroundColor: 'transparent' },
});

DropDown.defaultProps = { isDisabled: false };

DropDown.propTypes = {
  anchorRef: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  options: PropTypes.array.isRequired,
  onSelection: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
};