import Realm from 'realm';

export class InsuranceProvider extends Realm.Object {}

InsuranceProvider.schema = {
  name: 'InsuranceProvider',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    comment: 'string?',
    validityDays: 'int',
    isActive: 'bool',
  },
};

export default InsuranceProvider;
