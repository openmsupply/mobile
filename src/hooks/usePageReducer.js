/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useRef, useState, useCallback, useMemo } from 'react';

import {
  DataTablePageReducer,
  getPageActions,
  getColumns,
  getPageInfoColumns,
} from '../pages/dataTableUtilities';

import { debounce } from '../utilities/index';

/**
 * Wrapper around useState, reimplementing useReducer with
 * thunks. For pages within the app - creates a
 * composed reducer through getReducer for a particular
 * page as well as fetching the required data table columns
 * and page info columns and inserting them into the initial
 * state of the component.
 *
 * Dispatch returned from useReducer is wrapped allowing the use
 * of thunks. Actions can return either a plain object or a function.
 * If a function is returned, it is called, rather than dispatched,
 * allowing actions to perform side-effects.
 *
 * Returns the current state as well as three dispatchers for
 * actions to the reducer - a regular dispatch and two debounced
 * dispatchers - which group sequential calls within the timeout
 * period, call either the last invocation or the first within
 * the timeout period.
 * @param {String} page                   routeName for the current page.
 * @param {Object} initialState           Initial state of the reducer
 * @param {Number} debounceTimeout        Timeout period for a regular debounce
 * @param {Number} instantDebounceTimeout Timeout period for an instant debounce
 */
export const usePageReducer = (
  page,
  initialState,
  initializer,
  pageObject,
  debounceTimeout = 250,
  instantDebounceTimeout = 250
) => {
  const columns = useMemo(() => getColumns(page), [page]);
  const pageInfoColumns = useMemo(() => getPageInfoColumns(page), [page]);
  const PageActions = useMemo(() => getPageActions(page), [page]);

  const [pageState, setPageState] = useState({
    ...(initializer ? initializer(pageObject) : initialState),
    columns,
    getPageInfoColumns: pageInfoColumns,
    PageActions,
  });

  // Reference to the current state object, independent of closures.
  const stateRef = useRef(pageState);
  const getState = () => stateRef.current;

  // Basic dispatch function.
  const dispatch = action => {
    const newState = DataTablePageReducer(getState(), action);
    setPageState(newState);
    stateRef.current = newState;
  };

  const thunkDispatcher = action =>
    typeof action === 'function' ? action(thunkDispatcher, getState) : dispatch(action);

  const debouncedDispatch = useCallback(debounce(thunkDispatcher, debounceTimeout), []);
  const instantDebouncedDispatch = useCallback(
    debounce(thunkDispatcher, instantDebounceTimeout, true),
    []
  );

  return [pageState, thunkDispatcher, instantDebouncedDispatch, debouncedDispatch];
};

export default usePageReducer;
