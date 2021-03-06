/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { WIZARD_ACTIONS } from '../actions/WizardActions';

const initialState = () => ({
  currentTab: 0,
  isComplete: false,
});

export const WizardReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'GO_BACK': {
      return initialState();
    }

    case WIZARD_ACTIONS.COMPLETE: {
      return { ...state, isComplete: true };
    }

    case WIZARD_ACTIONS.SWITCH_TAB: {
      const { payload } = action;
      const { tab } = payload;
      return { ...state, currentTab: tab };
    }

    case WIZARD_ACTIONS.NEXT_TAB: {
      const { currentTab } = state;
      return { ...state, currentTab: currentTab + 1 };
    }

    case WIZARD_ACTIONS.PREVIOUS_TAB: {
      const { currentTab } = state;

      const nextTab = Math.max(currentTab - 1, 0);

      return { ...state, currentTab: nextTab };
    }

    default:
      return state;
  }
};
