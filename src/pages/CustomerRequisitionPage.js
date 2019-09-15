/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';

import { DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageView, PageButton, PageInfo, SearchBar } from '../widgets';

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';

import { usePageReducer, useRecordListener } from '../hooks';

import globalStyles, { SUSSOL_ORANGE, newPageStyles } from '../globalStyles';
import { buttonStrings } from '../localization';

const stateInitialiser = pageObject => ({
  pageObject,
  backingData: pageObject.items,
  data: pageObject.item.sorted('item.name').slice(),
  keyExtractor: recordKeyExtractor,
  dataState: new Map(),
  searchTerm: '',
  filterDataKeys: ['item.name'],
  sortBy: 'itemName',
  isAscending: true,
  modalKey: '',
});

/**
 * Renders a mSupply mobile page with a customer requisition loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isDisabled },
 *
 * @prop {Object} requisition The realm transaction object for this invoice.
 * @prop {Func}   runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 */
export const CustomerRequisitionPage = ({ requisition, runWithLoadingIndicator, routeName }) => {
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(
    routeName,
    {},
    stateInitialiser,
    requisition
  );

  const {
    data,
    sortBy,
    isAscending,
    modalKey,
    pageObject,
    keyExtractor,
    modalValue,
    searchTerm,
    PageActions,
    columns,
    getPageInfoColumns,
  } = state;

  // Listen for changes to this pages requisition. Refreshing data on side effects i.e. finalizing.
  useRecordListener(() => dispatch(PageActions.refreshData()), requisition, 'Requisition');

  const { isFinalised, comment } = pageObject;

  // On click handlers
  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onAddItem = value => dispatch(PageActions.addRequisitionItem(value));
  const onEditComment = value => dispatch(PageActions.editComment(value, 'Requisition'));
  const onFilterData = value => dispatch(PageActions.filterData(value));

  const onSetSuppliedToRequested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setRequestedToSuggested()));
  const onSetSuppliedToSuggested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setRequestedToSuggested()));

  const renderPageInfo = useCallback(
    () => (
      <PageInfo
        columns={getPageInfoColumns(pageObject, dispatch, PageActions)}
        isEditingDisabled={isFinalised}
      />
    ),
    [comment, isFinalised]
  );

  const getAction = colKey => {
    switch (colKey) {
      case 'suppliedQuantity':
        return PageActions.editSuppliedQuantity;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddItem;
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
        return onEditComment;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowKey={rowKey}
          columns={columns}
          isFinalised={isFinalised}
          dispatch={dispatch}
          getAction={getAction}
          rowIndex={index}
        />
      );
    },
    [data]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        dispatch={instantDebouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const UseSuggestedQuantitiesButton = () => (
    <View>
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.use_suggested_quantities}
        onPress={onSetSuppliedToSuggested}
        isDisabled={isFinalised}
      />
    </View>
  );

  const UseRequestedQuantitiesButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.use_requested_quantities}
      onPress={onSetSuppliedToRequested}
      isDisabled={requisition.isFinalised}
    />
  );

  const PageButtons = useCallback(() => {
    const { verticalContainer } = globalStyles;

    return (
      <View style={verticalContainer}>
        <UseRequestedQuantitiesButton />
        <UseSuggestedQuantitiesButton />
      </View>
    );
  }, []);

  const {
    newPageTopSectionContainer,
    newPageTopLeftSectionContainer,
    newPageTopRightSectionContainer,
    searchBar,
  } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          {renderPageInfo()}
          <SearchBar
            onChangeText={onFilterData}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
            value={searchTerm}
          />
        </View>
        <View style={newPageTopRightSectionContainer}>
          <PageButtons />
        </View>
      </View>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

CustomerRequisitionPage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
};
