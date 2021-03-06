/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { SimpleLabel } from './SimpleLabel';
import { FlexRow } from './FlexRow';
import { FlexView } from './FlexView';

/**
 * Layout and display component rendering some text and a number
 * in a row.
 *
 * Simple wrapper around `SimpleLabel` component. See for further
 * detail.
 *
 * @prop {String} size         The font size - see SimpleLabel for details.
 * @prop {String} text         Left hand side text value.
 * @prop {Number} number       Right hand side number value.
 * @prop {Number} total        Total value - displays text / total rather than just total.
 * @prop {Bool}   isPercentage Indicator whether to append `%` to each number value.
 */
export const NumberLabelRow = ({ size, text, number, total, isPercentage, bold }) => {
  const withTotalText = total ? `${number} / ${total}` : number;
  const withPercentage = isPercentage ? `${withTotalText}%` : `${withTotalText}`;

  return (
    <FlexRow flex={1}>
      <FlexView flex={1}>
        <SimpleLabel text={text} size={size} bold={bold} />
      </FlexView>
      <FlexView flex={1}>
        <SimpleLabel text={withPercentage} size={size} textAlign="right" bold={bold} />
      </FlexView>
    </FlexRow>
  );
};

NumberLabelRow.defaultProps = {
  total: 0,
  isPercentage: false,
  size: 'small',
  bold: false,
};

NumberLabelRow.propTypes = {
  size: PropTypes.string,
  text: PropTypes.string.isRequired,
  number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  total: PropTypes.number,
  isPercentage: PropTypes.bool,
  bold: PropTypes.bool,
};
