/* eslint-disable no-console */
import React from 'react';
import { Text, View } from 'react-native';

export const Description = props => {
  console.log('-------------------------------------------');
  console.log('Description - props', props);
  console.log('-------------------------------------------');
  return (
    <View style={{ borderWidth: 1, marginLeft: 10 }}>
      <Text>DescriptionField</Text>
    </View>
  );
};
