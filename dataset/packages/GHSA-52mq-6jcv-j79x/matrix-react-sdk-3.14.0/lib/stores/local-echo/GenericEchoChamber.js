"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.implicitlyReverted = implicitlyReverted;
exports.GenericEchoChamber = exports.PROPERTY_UPDATED = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _EchoTransaction = require("./EchoTransaction");

var _events = require("events");

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
async function implicitlyReverted() {// do nothing :D
}

const PROPERTY_UPDATED = "property_updated";
exports.PROPERTY_UPDATED = PROPERTY_UPDATED;

class GenericEchoChamber
/*:: <C extends EchoContext, K, V>*/
extends _events.EventEmitter {
  constructor(context
  /*: C*/
  , lookupFn
  /*: (key: K) => V*/
  ) {
    super();
    this.context
    /*:: */
    = context
    /*:: */
    ;
    this.lookupFn
    /*:: */
    = lookupFn
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "cache", new Map());
    (0, _defineProperty2.default)(this, "matrixClient", void 0);
  }

  setClient(client
  /*: MatrixClient*/
  ) {
    const oldClient = this.matrixClient;
    this.matrixClient = client;
    this.onClientChanged(oldClient, client);
  }

  /**
   * Gets a value. If the key is in flight, the cached value will be returned. If
   * the key is not in flight then the lookupFn provided to this class will be
   * called instead.
   * @param key The key to look up.
   * @returns The value for the key.
   */
  getValue(key
  /*: K*/
  )
  /*: V*/
  {
    return this.cache.has(key) ? this.cache.get(key).val : this.lookupFn(key);
  }

  cacheVal(key
  /*: K*/
  , val
  /*: V*/
  , txn
  /*: EchoTransaction*/
  ) {
    this.cache.set(key, {
      txn,
      val
    });
    this.emit(PROPERTY_UPDATED, key);
  }

  decacheKey(key
  /*: K*/
  ) {
    if (this.cache.has(key)) {
      this.context.disownTransaction(this.cache.get(key).txn);
      this.cache.delete(key);
      this.emit(PROPERTY_UPDATED, key);
    }
  }

  markEchoReceived(key
  /*: K*/
  ) {
    if (this.cache.has(key)) {
      const txn = this.cache.get(key).txn;
      this.context.disownTransaction(txn);
      txn.cancel();
    }

    this.decacheKey(key);
  }

  setValue(auditName
  /*: string*/
  , key
  /*: K*/
  , targetVal
  /*: V*/
  , runFn
  /*: RunFn*/
  , revertFn
  /*: RunFn*/
  ) {
    // Cancel any pending transactions for the same key
    if (this.cache.has(key)) {
      this.cache.get(key).txn.cancel();
    }

    const ctxn = this.context.beginTransaction(auditName, runFn);
    this.cacheVal(key, targetVal, ctxn); // set the cache now as it won't be updated by the .when() ladder below.

    ctxn.when(_EchoTransaction.TransactionStatus.Pending, () => this.cacheVal(key, targetVal, ctxn)).when(_EchoTransaction.TransactionStatus.Error, () => revertFn());
    ctxn.run();
  }

}

exports.GenericEchoChamber = GenericEchoChamber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvbG9jYWwtZWNoby9HZW5lcmljRWNob0NoYW1iZXIudHMiXSwibmFtZXMiOlsiaW1wbGljaXRseVJldmVydGVkIiwiUFJPUEVSVFlfVVBEQVRFRCIsIkdlbmVyaWNFY2hvQ2hhbWJlciIsIkV2ZW50RW1pdHRlciIsImNvbnN0cnVjdG9yIiwiY29udGV4dCIsImxvb2t1cEZuIiwiTWFwIiwic2V0Q2xpZW50IiwiY2xpZW50Iiwib2xkQ2xpZW50IiwibWF0cml4Q2xpZW50Iiwib25DbGllbnRDaGFuZ2VkIiwiZ2V0VmFsdWUiLCJrZXkiLCJjYWNoZSIsImhhcyIsImdldCIsInZhbCIsImNhY2hlVmFsIiwidHhuIiwic2V0IiwiZW1pdCIsImRlY2FjaGVLZXkiLCJkaXNvd25UcmFuc2FjdGlvbiIsImRlbGV0ZSIsIm1hcmtFY2hvUmVjZWl2ZWQiLCJjYW5jZWwiLCJzZXRWYWx1ZSIsImF1ZGl0TmFtZSIsInRhcmdldFZhbCIsInJ1bkZuIiwicmV2ZXJ0Rm4iLCJjdHhuIiwiYmVnaW5UcmFuc2FjdGlvbiIsIndoZW4iLCJUcmFuc2FjdGlvblN0YXR1cyIsIlBlbmRpbmciLCJFcnJvciIsInJ1biJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPTyxlQUFlQSxrQkFBZixHQUFvQyxDQUN2QztBQUNIOztBQUVNLE1BQU1DLGdCQUFnQixHQUFHLGtCQUF6Qjs7O0FBRUEsTUFBZUM7QUFBZjtBQUFBLFFBQXVFQyxvQkFBdkUsQ0FBb0Y7QUFJN0VDLEVBQUFBLFdBQVYsQ0FBc0NDO0FBQXRDO0FBQUEsSUFBMERDO0FBQTFEO0FBQUEsSUFBbUY7QUFDL0U7QUFEK0UsU0FBN0NEO0FBQTZDO0FBQUEsTUFBN0NBO0FBQTZDO0FBQUE7QUFBQSxTQUF6QkM7QUFBeUI7QUFBQSxN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dCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IEVjaG9Db250ZXh0IH0gZnJvbSBcIi4vRWNob0NvbnRleHRcIjtcbmltcG9ydCB7IEVjaG9UcmFuc2FjdGlvbiwgUnVuRm4sIFRyYW5zYWN0aW9uU3RhdHVzIH0gZnJvbSBcIi4vRWNob1RyYW5zYWN0aW9uXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiZXZlbnRzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBsaWNpdGx5UmV2ZXJ0ZWQoKSB7XG4gICAgLy8gZG8gbm90aGluZyA6RFxufVxuXG5leHBvcnQgY29uc3QgUFJPUEVSVFlfVVBEQVRFRCA9IFwicHJvcGVydHlfdXBkYXRlZFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgR2VuZXJpY0VjaG9DaGFtYmVyPEMgZXh0ZW5kcyBFY2hvQ29udGV4dCwgSywgVj4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPEssIHt0eG46IEVjaG9UcmFuc2FjdGlvbiwgdmFsOiBWfT4oKTtcbiAgICBwcm90ZWN0ZWQgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG5cbiAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGNvbnRleHQ6IEMsIHByaXZhdGUgbG9va3VwRm46IChrZXk6IEspID0+IFYpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0Q2xpZW50KGNsaWVudDogTWF0cml4Q2xpZW50KSB7XG4gICAgICAgIGNvbnN0IG9sZENsaWVudCA9IHRoaXMubWF0cml4Q2xpZW50O1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudCA9IGNsaWVudDtcbiAgICAgICAgdGhpcy5vbkNsaWVudENoYW5nZWQob2xkQ2xpZW50LCBjbGllbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbkNsaWVudENoYW5nZWQob2xkQ2xpZW50OiBNYXRyaXhDbGllbnQsIG5ld0NsaWVudDogTWF0cml4Q2xpZW50KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgYSB2YWx1ZS4gSWYgdGhlIGtleSBpcyBpbiBmbGlnaHQsIHRoZSBjYWNoZWQgdmFsdWUgd2lsbCBiZSByZXR1cm5lZC4gSWZcbiAgICAgKiB0aGUga2V5IGlzIG5vdCBpbiBmbGlnaHQgdGhlbiB0aGUgbG9va3VwRm4gcHJvdmlkZWQgdG8gdGhpcyBjbGFzcyB3aWxsIGJlXG4gICAgICogY2FsbGVkIGluc3RlYWQuXG4gICAgICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGxvb2sgdXAuXG4gICAgICogQHJldHVybnMgVGhlIHZhbHVlIGZvciB0aGUga2V5LlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRWYWx1ZShrZXk6IEspOiBWIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuaGFzKGtleSkgPyB0aGlzLmNhY2hlLmdldChrZXkpLnZhbCA6IHRoaXMubG9va3VwRm4oa2V5KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhY2hlVmFsKGtleTogSywgdmFsOiBWLCB0eG46IEVjaG9UcmFuc2FjdGlvbikge1xuICAgICAgICB0aGlzLmNhY2hlLnNldChrZXksIHt0eG4sIHZhbH0pO1xuICAgICAgICB0aGlzLmVtaXQoUFJPUEVSVFlfVVBEQVRFRCwga2V5KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlY2FjaGVLZXkoa2V5OiBLKSB7XG4gICAgICAgIGlmICh0aGlzLmNhY2hlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuZGlzb3duVHJhbnNhY3Rpb24odGhpcy5jYWNoZS5nZXQoa2V5KS50eG4pO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChQUk9QRVJUWV9VUERBVEVELCBrZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG1hcmtFY2hvUmVjZWl2ZWQoa2V5OiBLKSB7XG4gICAgICAgIGlmICh0aGlzLmNhY2hlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICBjb25zdCB0eG4gPSB0aGlzLmNhY2hlLmdldChrZXkpLnR4bjtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5kaXNvd25UcmFuc2FjdGlvbih0eG4pO1xuICAgICAgICAgICAgdHhuLmNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVjYWNoZUtleShrZXkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRWYWx1ZShhdWRpdE5hbWU6IHN0cmluZywga2V5OiBLLCB0YXJnZXRWYWw6IFYsIHJ1bkZuOiBSdW5GbiwgcmV2ZXJ0Rm46IFJ1bkZuKSB7XG4gICAgICAgIC8vIENhbmNlbCBhbnkgcGVuZGluZyB0cmFuc2FjdGlvbnMgZm9yIHRoZSBzYW1lIGtleVxuICAgICAgICBpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5nZXQoa2V5KS50eG4uY2FuY2VsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdHhuID0gdGhpcy5jb250ZXh0LmJlZ2luVHJhbnNhY3Rpb24oYXVkaXROYW1lLCBydW5Gbik7XG4gICAgICAgIHRoaXMuY2FjaGVWYWwoa2V5LCB0YXJnZXRWYWwsIGN0eG4pOyAvLyBzZXQgdGhlIGNhY2hlIG5vdyBhcyBpdCB3b24ndCBiZSB1cGRhdGVkIGJ5IHRoZSAud2hlbigpIGxhZGRlciBiZWxvdy5cblxuICAgICAgICBjdHhuLndoZW4oVHJhbnNhY3Rpb25TdGF0dXMuUGVuZGluZywgKCkgPT4gdGhpcy5jYWNoZVZhbChrZXksIHRhcmdldFZhbCwgY3R4bikpXG4gICAgICAgICAgICAud2hlbihUcmFuc2FjdGlvblN0YXR1cy5FcnJvciwgKCkgPT4gcmV2ZXJ0Rm4oKSk7XG5cbiAgICAgICAgY3R4bi5ydW4oKTtcbiAgICB9XG59XG4iXX0=