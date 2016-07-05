import Realm from 'realm';

import { getTotal } from '../utilities';

export class StocktakeItem extends Realm.Object {
  get snapshotTotalQuantity() {
    return getTotal(this.lines, 'snapshotTotalQuantity');
  }

  get countedTotalQuantity() {
    return getTotal(this.lines, 'countedTotalQuantity');
  }

  /**
   * Sets the counted quantity for the current item by applying the difference to the
   * shortest expiry batches possible, i.e. increase => all to shortest expiry,
   * decrease => spread over shortest to expire batches until it is all accounted for.
   * @param {double} quantity The total quantity to set across all lines
   */
  set countedNumberOfPacks(quantity) {
    let subtractQuantity = this.countedTotalQuantity - quantity;
    const lines = this.lines.sorted('expiryDate');
    const index = 0;
    while (subtractQuantity !== 0 && index < lines.length) {
      const lineSubtractQuantity = Math.min(subtractQuantity, lines[index].countedTotalQuantity);
      lines[index].countedTotalQuantity = lines[index].countedTotalQuantity - lineSubtractQuantity;
      subtractQuantity = subtractQuantity - lineSubtractQuantity;
    }
  }
}
