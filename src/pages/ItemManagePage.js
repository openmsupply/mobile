/* eslint-disable prefer-destructuring */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { generateUUID } from 'react-native-database';

import { GenericPage } from './GenericPage';
import {
  FinaliseButton,
  MiniToggleBar,
  AutocompleteSelector,
  TextEditor,
  ExpiryTextInput,
  GenericChoiceList,
} from '../widgets/index';
import { PageContentModal } from '../widgets/modals/index';
import { IconCell } from '../widgets/IconCell';
import { DARK_GREY, FINALISED_RED, SUSSOL_ORANGE, SOFT_RED } from '../globalStyles/index';

/**
 * CONSTANTS
 */

// Titles for each modal
const MODAL_TITLES = {
  location: 'Place this batch of vaccines in a fridge',
  vvmStatus: 'How many vials have a failed VVM status?',
};

// Columns available for this component
const COLUMNS = {
  batch: { key: 'batch', title: 'BATCH', sortable: false, width: 1.5, alignText: 'center' },
  expiry: { key: 'expiryDate', title: 'EXPIRY', sortable: false, width: 1.5, alignText: 'center' },
  arrived: { key: 'arrived', title: 'ARRIVED', sortable: false, width: 1, alignText: 'center' },
  fridge: { key: 'location', title: 'FRIDGE', sortable: false, width: 1.5, alignText: 'center' },
  breach: { key: 'breach', title: 'BREACH', sortable: false, width: 1, alignText: 'center' },
  vvm: { key: 'vvmStatus', title: 'VVM STATUS', sortable: false, width: 2, alignText: 'center' },
  dispose: { key: 'dispose', title: 'DISPOSE', sortable: false, width: 1.5, alignText: 'center' },
  quantity: {
    key: 'totalQuantity',
    title: 'QUANTITY',
    sortable: false,
    width: 1,
    alignText: 'center',
  },
};

// Columns usable for a certain module or item
const VACCINE_COLUMN_KEYS = ['batch', 'expiry', 'quantity', 'fridge', 'breach', 'vvm', 'dispose'];

/**
 * HELPER METHODS
 */

const getColumns = columnKeys => columnKeys.map(columnKey => COLUMNS[columnKey]);

// Creates a row object for use within this component.
const createRowObject = (itemBatch, extraData) => ({
  ...itemBatch,
  totalQuantity: itemBatch.totalQuantity,
  ...extraData,
});

/**
 * Component used for displaying all ItemBatches for a particular
 * item. No changes are made internally until the apply changes
 * button is pressed.
 */
export class ItemManagePage extends React.Component {
  constructor(props) {
    super(props);

    this.FRIDGES = null;
    this.REASONS = null;
    this.VVMREASON = null;

    this.state = {
      data: null,
      isModalOpen: false,
      modalKey: null,
      currentBatch: null,
      hasFridges: false,
    };
  }

  /**
   * COMPONENT METHODS
   */
  componentDidMount = () => {
    const { database, item } = this.props;
    this.FRIDGES = database.objects('Location').filter(({ isFridge }) => isFridge);
    this.REASONS = database
      .objects('Options')
      .filtered(
        'type = $0 && isActive = $1 && NOT title CONTAINS[c] $2',
        'vaccineDisposalReason',
        true,
        'vvm'
      );
    this.VVMREASON = database
      .objects('Options')
      .filtered(
        'type = $0 && isActive = $1 && title CONTAINS[c] $2',
        'vaccineDisposalReason',
        true,
        'vvm'
      )[0];

    const hasFridges = this.FRIDGES && this.FRIDGES.length > 0;
    this.setState({
      data: item.batches.map(itemBatch =>
        createRowObject(itemBatch, { vvmStatus: null, reason: null })
      ),
      hasFridges,
    });
  };

  /**
   * HELPER METHODS
   */
  getModalTitle = () => {
    const { modalKey } = this.state;
    return MODAL_TITLES[modalKey];
  };

  getFridgeDescription = ({ location, vvmStatus, reason }) => {
    const { hasFridges } = this.state;
    if (hasFridges && vvmStatus !== false && !reason) {
      return (location && location.description) || 'Unnasigned';
    }
    return (!hasFridges && 'No fridges') || (!vvmStatus && 'Discarded');
  };

  // Updates the currentBatch object held within state with new
  // values. Optional second parameter of fields to be used within
  // the setState call.
  updateObject = (extraObjectValues = {}, extraStateValues = {}) => {
    const { data, currentBatch } = this.state;
    const batchIndex = data.findIndex(({ id = 0 }) => currentBatch.id === id);
    // If something has gone wrong finding the batch, don't try to update
    if (batchIndex >= 0) data[batchIndex] = { ...currentBatch, ...extraObjectValues };
    this.setState({ data: [...data], ...extraStateValues });
  };

  /**
   * EVENT HANDLERS
   */

  // Called after entering the doses after toggling the VVM status to FAIL.
  // Will create a new row in the table with a quantity equal to the amount
  // entered and a VVM status of FAIL. Also updates the currentBatch objects
  // quantity.
  onSplitBatch = (splitValue = 0) => {
    const { currentBatch, data } = this.state;
    const { totalQuantity } = currentBatch;

    const parsedSplitValue = parseInt(splitValue, 10);
    let newObjectValues = {};

    if (parsedSplitValue > totalQuantity) {
      newObjectValues = { vvmStatus: false, reason: this.VVMREASON || null };
      // Account for 0 & NaN (From entering a non-numeric character)
    } else if (parsedSplitValue) {
      const newBatchValues = {
        id: generateUUID(),
        totalQuantity: parsedSplitValue,
        vvmStatus: false,
        reason: this.VVMREASON || null,
      };
      data.push(createRowObject(currentBatch, newBatchValues));
      newObjectValues = { vvmStatus: true, totalQuantity: totalQuantity - parsedSplitValue };
    }
    this.updateObject(newObjectValues, { isModalOpen: false });
  };

  onApplyChanges = () => {
    // TODO:
    // Confirmation dialog
    // Create inventory adjustments for any failed vvm status'
    // Create repacks for any location changes
    // Pop this page off the navigation stack.
    // If more data is needed to create these repacks and inventory
    // adjustments, they can easily be added to the row object with
    // no side-effects. e.g. the ItemBatch itself or just
    // some extra fields.
  };

  onDispose = ({ itemBatch } = {}) => ({ item: reason }) => {
    if (reason) return this.updateObject({ reason }, { isModalOpen: false });
    return this.setState({ currentBatch: itemBatch }, () =>
      this.updateObject({ reason: null, vvmStatus: true }, { isModalOpen: false })
    );
  };

  // Called on selecting a fridge in the fridge selection modal,
  // just update the location of the currentBatch and close the modal.
  onFridgeSelection = location => {
    this.updateObject({ location }, { isModalOpen: false });
  };

  // Called on toggle the vvm toggle bar. If being set to PASS, will just update
  // the object held in the closure to a PASS VVM status. Otherwise, opens a
  // modal for a user to enter the doses affected and set the currentBatch.
  onVvmToggle = ({ modalKey, currentBatch }) => ({ newState }) => {
    if (!newState) return this.onModalUpdate({ modalKey, currentBatch })();
    return this.setState({ currentBatch }, () =>
      this.updateObject({ vvmStatus: true, reason: null })
    );
  };

  // Method which controls all modals. Will open a modal corresponding to the
  // modal key in renderModal and set the passed itemBatch as the current
  // itemBatch. If called with no parameters, will clear the currentBatch
  // and close the modal.
  onModalUpdate = ({ modalKey, currentBatch } = {}) => () => {
    if (modalKey) this.setState({ modalKey, isModalOpen: true, currentBatch });
    else this.setState({ isModalOpen: false, currentBatch: null });
  };

  /**
   * RENDER HELPERS
   */
  renderCell = (key, itemBatch) => {
    const { hasFridges } = this.state;
    const { vvmStatus, reason } = itemBatch;
    const modalUpdateProps = { modalKey: key, currentBatch: itemBatch };
    const usingFridge = vvmStatus !== false && hasFridges && !reason;
    switch (key) {
      default:
        return { type: 'text', cellContents: itemBatch[key] };
      case 'expiryDate':
        return <ExpiryTextInput text={itemBatch[key]} />;
      case 'location':
        return (
          <IconCell
            text={this.getFridgeDescription(itemBatch)}
            disabled={!usingFridge}
            icon={usingFridge ? 'caret-up' : 'times'}
            iconColour={usingFridge ? SUSSOL_ORANGE : SOFT_RED}
            onPress={this.onModalUpdate(modalUpdateProps)}
          />
        );
      case 'breach':
        return (
          <IconCell icon="warning" iconSize={30} onPress={() => {}} iconColour={FINALISED_RED} />
        );
      case 'dispose':
        console.log(reason && reason.title);
        return (
          <IconCell
            text={reason && reason.title}
            icon={reason ? 'times' : 'trash'}
            iconSize={reason ? 20 : 30}
            onPress={reason ? this.onDispose({ itemBatch }) : this.onModalUpdate(modalUpdateProps)}
            iconColour={reason ? 'red' : DARK_GREY}
          />
        );
      case 'vvmStatus':
        return (
          <MiniToggleBar
            leftText="PASS"
            rightText="FAIL"
            currentState={vvmStatus}
            onPress={this.onVvmToggle(modalUpdateProps)}
          />
        );
    }
  };

  renderModal = () => {
    const { modalKey, currentBatch } = this.state;
    let splitValue;
    const modals = {
      location: (
        <AutocompleteSelector
          options={this.FRIDGES}
          queryString="description BEGINSWITH[c] $0"
          sortByString="description"
          onSelect={this.onFridgeSelection}
          renderLeftText={({ description } = { description: 'Unnamed Fridge' }) => description}
        />
      ),
      dispose: (
        <GenericChoiceList
          data={this.REASONS}
          keyToDisplay="title"
          onPress={this.onDispose()}
          highlightValue={currentBatch && currentBatch.reason ? currentBatch.reason.title : null}
        />
      ),
      vvmStatus: <TextEditor text={splitValue} onEndEditing={this.onSplitBatch} />,
    };
    return modals[modalKey];
  };

  renderTopRightComponent = () => (
    <FinaliseButton
      text="Apply Changes"
      onPress={() => {}}
      isFinalised={false}
      fontStyle={{ fontSize: 18 }}
    />
  );

  render() {
    const { database, genericTablePageStyles, topRoute } = this.props;
    const { data, isModalOpen } = this.state;
    return (
      <GenericPage
        data={data || []}
        renderCell={this.renderCell}
        renderTopRightComponent={this.renderTopRightComponent}
        onEndEditing={this.onEndEditing}
        columns={getColumns(VACCINE_COLUMN_KEYS)}
        database={database}
        topRoute={topRoute}
        isDataCircular={true}
        {...genericTablePageStyles}
      >
        <PageContentModal
          isOpen={isModalOpen}
          onClose={this.onModalUpdate()}
          title={this.getModalTitle()}
        >
          {this.renderModal()}
        </PageContentModal>
      </GenericPage>
    );
  }
}

ItemManagePage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  topRoute: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
};

export default ItemManagePage;
