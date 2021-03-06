/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import { View, StyleSheet, TextInput as RNTextInput, ViewPropTypes } from 'react-native';

/**
 * Renders a View containing a RN TextInput. For allowing changing underline
 * color of the TextInput in both Android and iOS, which is not supported in
 * the current RN TextInput (v0.27).
 * @param   {object}  props   Properties passed where component was created.
 * @return  {React.Component} View containing a TextInput
 */
export const TextInput = props => {
  const { style, textStyle, ...textInputProps } = props;
  return (
    <View style={[localStyles.container, style]}>
      <RNTextInput {...textInputProps} style={[textStyle, localStyles.textInput]} />
    </View>
  );
};

export default TextInput;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
TextInput.propTypes = {
  ...RNTextInput.propTypes,
  style: ViewPropTypes.style,
  textStyle: RNTextInput.propTypes.style,
};

const localStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderColor: 'white',
  },
  textInput: {
    alignSelf: 'stretch',
    height: 40,
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});
