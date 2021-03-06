/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { SimpleLabel } from './SimpleLabel';

/**
 * Simple layout component render sequential SimpleLabel components
 * in a row.
 *
 * Each SimpleLabel has a label and some other text.
 *
 * @prop {Array} details Array of objects in the form {label, text}
 */
export const DetailRow = ({ details }) => {
  const Details = React.useCallback(
    () =>
      details.map(({ label, text }) => (
        <SimpleLabel key={`${label}${text}`} label={label} size="small" text={text} />
      )),
    [details]
  );
  return <Details />;
};

DetailRow.propTypes = { details: PropTypes.array.isRequired };
