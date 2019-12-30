/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import { ROUTES } from '../navigation/constants';

import { CustomerInvoicePage } from './CustomerInvoicePage';
import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { CustomerRequisitionPage } from './CustomerRequisitionPage';
import { CustomerRequisitionsPage } from './CustomerRequisitionsPage';
import { DashboardPage } from './DashboardPage';
import { MenuPage } from './MenuPage';
import { PageContainer } from './PageContainer';
import { RealmExplorer } from './RealmExplorer';
import { SettingsPage } from './SettingsPage';
import { StockPage } from './StockPage';
import { StocktakeEditPage } from './StocktakeEditPage';
import { StocktakeManagePage } from './StocktakeManagePage';
import { StocktakesPage } from './StocktakesPage';
import { SupplierInvoicePage } from './SupplierInvoicePage';
import { SupplierInvoicesPage } from './SupplierInvoicesPage';
import { SupplierRequisitionPage } from './SupplierRequisitionPage';
import { SupplierRequisitionsPage } from './SupplierRequisitionsPage';

import {
  checkForCustomerInvoiceError,
  checkForSupplierInvoiceError,
  checkForSupplierRequisitionError,
  checkForStocktakeError,
  checkForCustomerRequisitionError,
} from '../utilities';

export { FirstUsePage } from './FirstUsePage';

export const PAGES = {
  [ROUTES.ROOT]: props => <PageContainer page={MenuPage} {...props} />,

  [ROUTES.MENU]: props => <PageContainer page={MenuPage} {...props} />,

  [ROUTES.REALM_EXPLORER]: props => <PageContainer page={RealmExplorer} {...props} />,

  [ROUTES.CUSTOMER_REQUISITION]: props => (
    <PageContainer page={CustomerRequisitionPage} {...props} />
  ),
  [ROUTES.CUSTOMER_REQUISITIONS]: props => (
    <PageContainer page={CustomerRequisitionsPage} {...props} />
  ),

  [ROUTES.SUPPLIER_REQUISITION]: props => (
    <PageContainer page={SupplierRequisitionPage} {...props} />
  ),
  [ROUTES.SUPPLIER_REQUISITION_WITH_PROGRAM]: props => (
    <PageContainer page={SupplierRequisitionPage} {...props} />
  ),
  [ROUTES.SUPPLIER_REQUISITIONS]: props => (
    <PageContainer page={SupplierRequisitionsPage} {...props} />
  ),

  [ROUTES.CUSTOMER_INVOICE]: props => <PageContainer page={CustomerInvoicePage} {...props} />,
  [ROUTES.CUSTOMER_INVOICES]: props => <PageContainer page={CustomerInvoicesPage} {...props} />,

  [ROUTES.SUPPLIER_INVOICE]: props => <PageContainer page={SupplierInvoicePage} {...props} />,
  [ROUTES.SUPPLIER_INVOICES]: props => <PageContainer page={SupplierInvoicesPage} {...props} />,

  [ROUTES.STOCK]: props => <PageContainer page={StockPage} {...props} />,

  [ROUTES.STOCKTAKES]: props => <PageContainer page={StocktakesPage} {...props} />,
  [ROUTES.STOCKTAKE_MANAGER]: props => <PageContainer page={StocktakeManagePage} {...props} />,
  [ROUTES.STOCKTAKE_EDITOR]: props => <PageContainer page={StocktakeEditPage} {...props} />,
  [ROUTES.STOCKTAKE_EDITOR_WITH_REASONS]: props => (
    <PageContainer page={StocktakeEditPage} {...props} />
  ),
  [ROUTES.SETTINGS]: props => <PageContainer page={SettingsPage} {...props} />,
  [ROUTES.DASHBOARD]: props => <PageContainer page={DashboardPage} {...props} />,
};

export const FINALISABLE_PAGES = {
  [ROUTES.SUPPLIER_INVOICE]: {
    checkForError: checkForSupplierInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_supplier_invoice',
  },
  [ROUTES.CUSTOMER_INVOICE]: {
    checkForError: checkForCustomerInvoiceError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: 'finalise_customer_invoice',
  },
  [ROUTES.CUSTOMER_REQUISITION]: {
    checkForError: checkForCustomerRequisitionError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_customer_requisition',
  },
  [ROUTES.STOCKTAKE_EDITOR]: {
    checkForError: checkForStocktakeError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: 'finalise_stocktake',
  },
  [ROUTES.STOCKTAKE_EDITOR_WITH_REASONS]: {
    checkForError: checkForStocktakeError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: 'finalise_stocktake',
  },
  [ROUTES.SUPPLIER_REQUISITION]: {
    checkForError: checkForSupplierRequisitionError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_supplier_requisition',
  },
  [ROUTES.SUPPLIER_REQUISITION_WITH_PROGRAM]: {
    checkForError: checkForSupplierRequisitionError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: 'finalise_supplier_requisition',
  },
};
