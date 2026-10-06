"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.tryInitStorage = tryInitStorage;
exports.flush = flush;
exports.cleanup = cleanup;
exports.getLogsForReport = getLogsForReport;

/*
Copyright 2017 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
// This module contains all the code needed to log the console, persist it to
// disk and submit bug reports. Rationale is as follows:
//  - Monkey-patching the console is preferable to having a log library because
//    we can catch logs by other libraries more easily, without having to all
//    depend on the same log framework / pass the logger around.
//  - We use IndexedDB to persists logs because it has generous disk space
//    limits compared to local storage. IndexedDB does not work in incognito
//    mode, in which case this module will not be able to write logs to disk.
//    However, the logs will still be stored in-memory, so can still be
//    submitted in a bug report should the user wish to: we can also store more
//    logs in-memory than in local storage, which does work in incognito mode.
//    We also need to handle the case where there are 2+ tabs. Each JS runtime
//    generates a random string which serves as the "ID" for that tab/session.
//    These IDs are stored along with the log lines.
//  - Bug reports are sent as a POST over HTTPS: it purposefully does not use
//    Matrix as bug reports may be made when Matrix is not responsive (which may
//    be the cause of the bug). We send the most recent N MB of UTF-8 log data,
//    starting with the most recent, which we know because the "ID"s are
//    actually timestamps. We then purge the remaining logs. We also do this
//    purge on startup to prevent logs from accumulating.
// the frequency with which we flush to indexeddb
const FLUSH_RATE_MS = 30 * 1000; // the length of log data we keep in indexeddb (and include in the reports)

const MAX_LOG_SIZE = 1024 * 1024 * 5; // 5 MB
// A class which monkey-patches the global console and stores log lines.

class ConsoleLogger {
  constructor() {
    this.logs = "";
  }

  monkeyPatch(consoleObj) {
    // Monkey-patch console logging
    const consoleFunctionsToLevels = {
      log: "I",
      info: "I",
      warn: "W",
      error: "E"
    };
    Object.keys(consoleFunctionsToLevels).forEach(fnName => {
      const level = consoleFunctionsToLevels[fnName];
      const originalFn = consoleObj[fnName].bind(consoleObj);

      consoleObj[fnName] = (...args) => {
        this.log(level, ...args);
        originalFn(...args);
      };
    });
  }

  log(level, ...args) {
    // We don't know what locale the user may be running so use ISO strings
    const ts = new Date().toISOString(); // Convert objects and errors to helpful things

    args = args.map(arg => {
      if (arg instanceof Error) {
        return arg.message + (arg.stack ? `\n${arg.stack}` : '');
      } else if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          // In development, it can be useful to log complex cyclic
          // objects to the console for inspection. This is fine for
          // the console, but default `stringify` can't handle that.
          // We workaround this by using a special replacer function
          // to only log values of the root object and avoid cycles.
          return JSON.stringify(arg, (key, value) => {
            if (key && typeof value === "object") {
              return "<object>";
            }

            return value;
          });
        }
      } else {
        return arg;
      }
    }); // Some browsers support string formatting which we're not doing here
    // so the lines are a little more ugly but easy to implement / quick to
    // run.
    // Example line:
    // 2017-01-18T11:23:53.214Z W Failed to set badge count

    let line = `${ts} ${level} ${args.join(' ')}\n`; // Do some cleanup

    line = line.replace(/token=[a-zA-Z0-9-]+/gm, 'token=xxxxx'); // Using + really is the quickest way in JS
    // http://jsperf.com/concat-vs-plus-vs-join

    this.logs += line;
  }
  /**
   * Retrieve log lines to flush to disk.
   * @param {boolean} keepLogs True to not delete logs after flushing.
   * @return {string} \n delimited log lines to flush.
   */


  flush(keepLogs) {
    // The ConsoleLogger doesn't care how these end up on disk, it just
    // flushes them to the caller.
    if (keepLogs) {
      return this.logs;
    }

    const logsToFlush = this.logs;
    this.logs = "";
    return logsToFlush;
  }

} // A class which stores log lines in an IndexedDB instance.


class IndexedDBLogStore {
  constructor(indexedDB, logger) {
    this.indexedDB = indexedDB;
    this.logger = logger;
    this.id = "instance-" + Math.random() + Date.now();
    this.index = 0;
    this.db = null; // these promises are cleared as soon as fulfilled

    this.flushPromise = null; // set if flush() is called whilst one is ongoing

    this.flushAgainPromise = null;
  }
  /**
   * @return {Promise} Resolves when the store is ready.
   */


  connect() {
    const req = this.indexedDB.open("logs");
    return new Promise((resolve, reject) => {
      req.onsuccess = event => {
        this.db = event.target.result; // Periodically flush logs to local storage / indexeddb

        setInterval(this.flush.bind(this), FLUSH_RATE_MS);
        resolve();
      };

      req.onerror = event => {
        const err = "Failed to open log database: " + event.target.error.name;
        console.error(err);
        reject(new Error(err));
      }; // First time: Setup the object store


      req.onupgradeneeded = event => {
        const db = event.target.result;
        const logObjStore = db.createObjectStore("logs", {
          keyPath: ["id", "index"]
        }); // Keys in the database look like: [ "instance-148938490", 0 ]
        // Later on we need to query everything based on an instance id.
        // In order to do this, we need to set up indexes "id".

        logObjStore.createIndex("id", "id", {
          unique: false
        });
        logObjStore.add(this._generateLogEntry(new Date() + " ::: Log database was created."));
        const lastModifiedStore = db.createObjectStore("logslastmod", {
          keyPath: "id"
        });
        lastModifiedStore.add(this._generateLastModifiedTime());
      };
    });
  }
  /**
   * Flush logs to disk.
   *
   * There are guards to protect against race conditions in order to ensure
   * that all previous flushes have completed before the most recent flush.
   * Consider without guards:
   *  - A calls flush() periodically.
   *  - B calls flush() and wants to send logs immediately afterwards.
   *  - If B doesn't wait for A's flush to complete, B will be missing the
   *    contents of A's flush.
   * To protect against this, we set 'flushPromise' when a flush is ongoing.
   * Subsequent calls to flush() during this period will chain another flush,
   * then keep returning that same chained flush.
   *
   * This guarantees that we will always eventually do a flush when flush() is
   * called.
   *
   * @return {Promise} Resolved when the logs have been flushed.
   */


  flush() {
    // check if a flush() operation is ongoing
    if (this.flushPromise) {
      if (this.flushAgainPromise) {
        // this is the 3rd+ time we've called flush() : return the same promise.
        return this.flushAgainPromise;
      } // queue up a flush to occur immediately after the pending one completes.


      this.flushAgainPromise = this.flushPromise.then(() => {
        return this.flush();
      }).then(() => {
        this.flushAgainPromise = null;
      });
      return this.flushAgainPromise;
    } // there is no flush promise or there was but it has finished, so do
    // a brand new one, destroying the chain which may have been built up.


    this.flushPromise = new Promise((resolve, reject) => {
      if (!this.db) {
        // not connected yet or user rejected access for us to r/w to the db.
        reject(new Error("No connected database"));
        return;
      }

      const lines = this.logger.flush();

      if (lines.length === 0) {
        resolve();
        return;
      }

      const txn = this.db.transaction(["logs", "logslastmod"], "readwrite");
      const objStore = txn.objectStore("logs");

      txn.oncomplete = event => {
        resolve();
      };

      txn.onerror = event => {
        console.error("Failed to flush logs : ", event);
        reject(new Error("Failed to write logs: " + event.target.errorCode));
      };

      objStore.add(this._generateLogEntry(lines));
      const lastModStore = txn.objectStore("logslastmod");
      lastModStore.put(this._generateLastModifiedTime());
    }).then(() => {
      this.flushPromise = null;
    });
    return this.flushPromise;
  }
  /**
   * Consume the most recent logs and return them. Older logs which are not
   * returned are deleted at the same time, so this can be called at startup
   * to do house-keeping to keep the logs from growing too large.
   *
   * @return {Promise<Object[]>} Resolves to an array of objects. The array is
   * sorted in time (oldest first) based on when the log file was created (the
   * log ID). The objects have said log ID in an "id" field and "lines" which
   * is a big string with all the new-line delimited logs.
   */


  async consume() {
    const db = this.db; // Returns: a string representing the concatenated logs for this ID.
    // Stops adding log fragments when the size exceeds maxSize

    function fetchLogs(id, maxSize) {
      const objectStore = db.transaction("logs", "readonly").objectStore("logs");
      return new Promise((resolve, reject) => {
        const query = objectStore.index("id").openCursor(IDBKeyRange.only(id), 'prev');
        let lines = '';

        query.onerror = event => {
          reject(new Error("Query failed: " + event.target.errorCode));
        };

        query.onsuccess = event => {
          const cursor = event.target.result;

          if (!cursor) {
            resolve(lines);
            return; // end of results
          }

          lines = cursor.value.lines + lines;

          if (lines.length >= maxSize) {
            resolve(lines);
          } else {
            cursor.continue();
          }
        };
      });
    } // Returns: A sorted array of log IDs. (newest first)


    function fetchLogIds() {
      // To gather all the log IDs, query for all records in logslastmod.
      const o = db.transaction("logslastmod", "readonly").objectStore("logslastmod");
      return selectQuery(o, undefined, cursor => {
        return {
          id: cursor.value.id,
          ts: cursor.value.ts
        };
      }).then(res => {
        // Sort IDs by timestamp (newest first)
        return res.sort((a, b) => {
          return b.ts - a.ts;
        }).map(a => a.id);
      });
    }

    function deleteLogs(id) {
      return new Promise((resolve, reject) => {
        const txn = db.transaction(["logs", "logslastmod"], "readwrite");
        const o = txn.objectStore("logs"); // only load the key path, not the data which may be huge

        const query = o.index("id").openKeyCursor(IDBKeyRange.only(id));

        query.onsuccess = event => {
          const cursor = event.target.result;

          if (!cursor) {
            return;
          }

          o.delete(cursor.primaryKey);
          cursor.continue();
        };

        txn.oncomplete = () => {
          resolve();
        };

        txn.onerror = event => {
          reject(new Error("Failed to delete logs for " + `'${id}' : ${event.target.errorCode}`));
        }; // delete last modified entries


        const lastModStore = txn.objectStore("logslastmod");
        lastModStore.delete(id);
      });
    }

    const allLogIds = await fetchLogIds();
    let removeLogIds = [];
    const logs = [];
    let size = 0;

    for (let i = 0; i < allLogIds.length; i++) {
      const lines = await fetchLogs(allLogIds[i], MAX_LOG_SIZE - size); // always add the log file: fetchLogs will truncate once the maxSize we give it is
      // exceeded, so we'll go over the max but only by one fragment's worth.

      logs.push({
        lines: lines,
        id: allLogIds[i]
      });
      size += lines.length; // If fetchLogs truncated we'll now be at or over the size limit,
      // in which case we should stop and remove the rest of the log files.

      if (size >= MAX_LOG_SIZE) {
        // the remaining log IDs should be removed. If we go out of
        // bounds this is just []
        removeLogIds = allLogIds.slice(i + 1);
        break;
      }
    }

    if (removeLogIds.length > 0) {
      console.log("Removing logs: ", removeLogIds); // Don't await this because it's non-fatal if we can't clean up
      // logs.

      Promise.all(removeLogIds.map(id => deleteLogs(id))).then(() => {
        console.log(`Removed ${removeLogIds.length} old logs.`);
      }, err => {
        console.error(err);
      });
    }

    return logs;
  }

  _generateLogEntry(lines) {
    return {
      id: this.id,
      lines: lines,
      index: this.index++
    };
  }

  _generateLastModifiedTime() {
    return {
      id: this.id,
      ts: Date.now()
    };
  }

}
/**
 * Helper method to collect results from a Cursor and promiseify it.
 * @param {ObjectStore|Index} store The store to perform openCursor on.
 * @param {IDBKeyRange=} keyRange Optional key range to apply on the cursor.
 * @param {Function} resultMapper A function which is repeatedly called with a
 * Cursor.
 * Return the data you want to keep.
 * @return {Promise<T[]>} Resolves to an array of whatever you returned from
 * resultMapper.
 */


function selectQuery(store, keyRange, resultMapper) {
  const query = store.openCursor(keyRange);
  return new Promise((resolve, reject) => {
    const results = [];

    query.onerror = event => {
      reject(new Error("Query failed: " + event.target.errorCode));
    }; // collect results


    query.onsuccess = event => {
      const cursor = event.target.result;

      if (!cursor) {
        resolve(results);
        return; // end of results
      }

      results.push(resultMapper(cursor));
      cursor.continue();
    };
  });
}
/**
 * Configure rage shaking support for sending bug reports.
 * Modifies globals.
 * @param {boolean} setUpPersistence When true (default), the persistence will
 * be set up immediately for the logs.
 * @return {Promise} Resolves when set up.
 */


function init(setUpPersistence = true) {
  if (global.mx_rage_initPromise) {
    return global.mx_rage_initPromise;
  }

  global.mx_rage_logger = new ConsoleLogger();
  global.mx_rage_logger.monkeyPatch(window.console);

  if (setUpPersistence) {
    return tryInitStorage();
  }

  global.mx_rage_initPromise = Promise.resolve();
  return global.mx_rage_initPromise;
}
/**
 * Try to start up the rageshake storage for logs. If not possible (client unsupported)
 * then this no-ops.
 * @return {Promise} Resolves when complete.
 */


function tryInitStorage() {
  if (global.mx_rage_initStoragePromise) {
    return global.mx_rage_initStoragePromise;
  }

  console.log("Configuring rageshake persistence..."); // just *accessing* indexedDB throws an exception in firefox with
  // indexeddb disabled.

  let indexedDB;

  try {
    indexedDB = window.indexedDB;
  } catch (e) {}

  if (indexedDB) {
    global.mx_rage_store = new IndexedDBLogStore(indexedDB, global.mx_rage_logger);
    global.mx_rage_initStoragePromise = global.mx_rage_store.connect();
    return global.mx_rage_initStoragePromise;
  }

  global.mx_rage_initStoragePromise = Promise.resolve();
  return global.mx_rage_initStoragePromise;
}

function flush() {
  if (!global.mx_rage_store) {
    return;
  }

  global.mx_rage_store.flush();
}
/**
 * Clean up old logs.
 * @return {Promise} Resolves if cleaned logs.
 */


async function cleanup() {
  if (!global.mx_rage_store) {
    return;
  }

  await global.mx_rage_store.consume();
}
/**
 * Get a recent snapshot of the logs, ready for attaching to a bug report
 *
 * @return {Array<{lines: string, id, string}>}  list of log data
 */


async function getLogsForReport() {
  if (!global.mx_rage_logger) {
    throw new Error("No console logger, did you forget to call init()?");
  } // If in incognito mode, store is null, but we still want bug report
  // sending to work going off the in-memory console logs.


  if (global.mx_rage_store) {
    // flush most recent logs
    await global.mx_rage_store.flush();
    return await global.mx_rage_store.consume();
  } else {
    return [{
      lines: global.mx_rage_logger.flush(true),
      id: "-"
    }];
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yYWdlc2hha2UvcmFnZXNoYWtlLmpzIl0sIm5hbWVzIjpbIkZMVVNIX1JBVEVfTVMiLCJNQVhfTE9HX1NJWkUiLCJDb25zb2xlTG9nZ2VyIiwiY29uc3RydWN0b3IiLCJsb2dzIiwibW9ua2V5UGF0Y2giLCJjb25zb2xlT2JqIiwiY29uc29sZUZ1bmN0aW9uc1RvTGV2ZWxzIiwibG9nIiwiaW5mbyIsIndhcm4iLCJlcnJvciIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiZm5OYW1lIiwibGV2ZWwiLCJvcmlnaW5hbEZuIiwiYmluZCIsImFyZ3MiLCJ0cyIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsIm1hcCIsImFyZyIsIkVycm9yIiwibWVzc2FnZSIsInN0YWNrIiwiSlNPTiIsInN0cmluZ2lmeSIsImUiLCJrZXkiLCJ2YWx1ZSIsImxpbmUiLCJqb2luIiwicmVwbGFjZSIsImZsdXNoIiwia2VlcExvZ3MiLCJsb2dzVG9GbHVzaCIsIkluZGV4ZWREQkxvZ1N0b3JlIiwiaW5kZXhlZERCIiwibG9nZ2VyIiwiaWQiLCJNYXRoIiwicmFuZG9tIiwibm93IiwiaW5kZXgiLCJkYiIsImZsdXNoUHJvbWlzZSIsImZsdXNoQWdhaW5Qcm9taXNlIiwiY29ubmVjdCIsInJlcSIsIm9wZW4iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uc3VjY2VzcyIsImV2ZW50IiwidGFyZ2V0IiwicmVzdWx0Iiwic2V0SW50ZXJ2YWwiLCJvbmVycm9yIiwiZXJyIiwibmFtZSIsImNvbnNvbGUiLCJvbnVwZ3JhZGVuZWVkZWQiLCJsb2dPYmpTdG9yZSIsImNyZWF0ZU9iamVjdFN0b3JlIiwia2V5UGF0aCIsImNyZWF0ZUluZGV4IiwidW5pcXVlIiwiYWRkIiwiX2dlbmVyYXRlTG9nRW50cnkiLCJsYXN0TW9kaWZpZWRTdG9yZSIsIl9nZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUiLCJ0aGVuIiwibGluZXMiLCJsZW5ndGgiLCJ0eG4iLCJ0cmFuc2FjdGlvbiIsIm9ialN0b3JlIiwib2JqZWN0U3RvcmUiLCJvbmNvbXBsZXRlIiwiZXJyb3JDb2RlIiwibGFzdE1vZFN0b3JlIiwicHV0IiwiY29uc3VtZSIsImZldGNoTG9ncyIsIm1heFNpemUiLCJxdWVyeSIsIm9wZW5DdXJzb3IiLCJJREJLZXlSYW5nZSIsIm9ubHkiLCJjdXJzb3IiLCJjb250aW51ZSIsImZldGNoTG9nSWRzIiwibyIsInNlbGVjdFF1ZXJ5IiwidW5kZWZpbmVkIiwicmVzIiwic29ydCIsImEiLCJiIiwiZGVsZXRlTG9ncyIsIm9wZW5LZXlDdXJzb3IiLCJkZWxldGUiLCJwcmltYXJ5S2V5IiwiYWxsTG9nSWRzIiwicmVtb3ZlTG9nSWRzIiwic2l6ZSIsImkiLCJwdXNoIiwic2xpY2UiLCJhbGwiLCJzdG9yZSIsImtleVJhbmdlIiwicmVzdWx0TWFwcGVyIiwicmVzdWx0cyIsImluaXQiLCJzZXRVcFBlcnNpc3RlbmNlIiwiZ2xvYmFsIiwibXhfcmFnZV9pbml0UHJvbWlzZSIsIm14X3JhZ2VfbG9nZ2VyIiwid2luZG93IiwidHJ5SW5pdFN0b3JhZ2UiLCJteF9yYWdlX2luaXRTdG9yYWdlUHJvbWlzZSIsIm14X3JhZ2Vfc3RvcmUiLCJjbGVhbnVwIiwiZ2V0TG9nc0ZvclJlcG9ydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsTUFBTUEsYUFBYSxHQUFHLEtBQUssSUFBM0IsQyxDQUVBOztBQUNBLE1BQU1DLFlBQVksR0FBRyxPQUFPLElBQVAsR0FBYyxDQUFuQyxDLENBQXNDO0FBRXRDOztBQUNBLE1BQU1DLGFBQU4sQ0FBb0I7QUFDaEJD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S0FBSixDQUNGLG1EQURFLENBQU47QUFHSCxHQUxvQyxDQU1yQztBQUNBOzs7QUFDQSxNQUFJK0YsTUFBTSxDQUFDTSxhQUFYLEVBQTBCO0FBQ3RCO0FBQ0EsVUFBTU4sTUFBTSxDQUFDTSxhQUFQLENBQXFCMUYsS0FBckIsRUFBTjtBQUNBLFdBQU8sTUFBTW9GLE1BQU0sQ0FBQ00sYUFBUCxDQUFxQnhDLE9BQXJCLEVBQWI7QUFDSCxHQUpELE1BSU87QUFDSCxXQUFPLENBQUM7QUFDSlYsTUFBQUEsS0FBSyxFQUFFNEMsTUFBTSxDQUFDRSxjQUFQLENBQXNCdEYsS0FBdEIsQ0FBNEIsSUFBNUIsQ0FESDtBQUVKTSxNQUFBQSxFQUFFLEVBQUU7QUFGQSxLQUFELENBQVA7QUFJSDtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vLyBUaGlzIG1vZHVsZSBjb250YWlucyBhbGwgdGhlIGNvZGUgbmVlZGVkIHRvIGxvZyB0aGUgY29uc29sZSwgcGVyc2lzdCBpdCB0b1xuLy8gZGlzayBhbmQgc3VibWl0IGJ1ZyByZXBvcnRzLiBSYXRpb25hbGUgaXMgYXMgZm9sbG93czpcbi8vICAtIE1vbmtleS1wYXRjaGluZyB0aGUgY29uc29sZSBpcyBwcmVmZXJhYmxlIHRvIGhhdmluZyBhIGxvZyBsaWJyYXJ5IGJlY2F1c2Vcbi8vICAgIHdlIGNhbiBjYXRjaCBsb2dzIGJ5IG90aGVyIGxpYnJhcmllcyBtb3JlIGVhc2lseSwgd2l0aG91dCBoYXZpbmcgdG8gYWxsXG4vLyAgICBkZXBlbmQgb24gdGhlIHNhbWUgbG9nIGZyYW1ld29yayAvIHBhc3MgdGhlIGxvZ2dlciBhcm91bmQuXG4vLyAgLSBXZSB1c2UgSW5kZXhlZERCIHRvIHBlcnNpc3RzIGxvZ3MgYmVjYXVzZSBpdCBoYXMgZ2VuZXJvdXMgZGlzayBzcGFjZVxuLy8gICAgbGltaXRzIGNvbXBhcmVkIHRvIGxvY2FsIHN0b3JhZ2UuIEluZGV4ZWREQiBkb2VzIG5vdCB3b3JrIGluIGluY29nbml0b1xuLy8gICAgbW9kZSwgaW4gd2hpY2ggY2FzZSB0aGlzIG1vZHVsZSB3aWxsIG5vdCBiZSBhYmxlIHRvIHdyaXRlIGxvZ3MgdG8gZGlzay5cbi8vICAgIEhvd2V2ZXIsIHRoZSBsb2dzIHdpbGwgc3RpbGwgYmUgc3RvcmVkIGluLW1lbW9yeSwgc28gY2FuIHN0aWxsIGJlXG4vLyAgICBzdWJtaXR0ZWQgaW4gYSBidWcgcmVwb3J0IHNob3VsZCB0aGUgdXNlciB3aXNoIHRvOiB3ZSBjYW4gYWxzbyBzdG9yZSBtb3JlXG4vLyAgICBsb2dzIGluLW1lbW9yeSB0aGFuIGluIGxvY2FsIHN0b3JhZ2UsIHdoaWNoIGRvZXMgd29yayBpbiBpbmNvZ25pdG8gbW9kZS5cbi8vICAgIFdlIGFsc28gbmVlZCB0byBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlcmUgYXJlIDIrIHRhYnMuIEVhY2ggSlMgcnVudGltZVxuLy8gICAgZ2VuZXJhdGVzIGEgcmFuZG9tIHN0cmluZyB3aGljaCBzZXJ2ZXMgYXMgdGhlIFwiSURcIiBmb3IgdGhhdCB0YWIvc2Vzc2lvbi5cbi8vICAgIFRoZXNlIElEcyBhcmUgc3RvcmVkIGFsb25nIHdpdGggdGhlIGxvZyBsaW5lcy5cbi8vICAtIEJ1ZyByZXBvcnRzIGFyZSBzZW50IGFzIGEgUE9TVCBvdmVyIEhUVFBTOiBpdCBwdXJwb3NlZnVsbHkgZG9lcyBub3QgdXNlXG4vLyAgICBNYXRyaXggYXMgYnVnIHJlcG9ydHMgbWF5IGJlIG1hZGUgd2hlbiBNYXRyaXggaXMgbm90IHJlc3BvbnNpdmUgKHdoaWNoIG1heVxuLy8gICAgYmUgdGhlIGNhdXNlIG9mIHRoZSBidWcpLiBXZSBzZW5kIHRoZSBtb3N0IHJlY2VudCBOIE1CIG9mIFVURi04IGxvZyBkYXRhLFxuLy8gICAgc3RhcnRpbmcgd2l0aCB0aGUgbW9zdCByZWNlbnQsIHdoaWNoIHdlIGtub3cgYmVjYXVzZSB0aGUgXCJJRFwicyBhcmVcbi8vICAgIGFjdHVhbGx5IHRpbWVzdGFtcHMuIFdlIHRoZW4gcHVyZ2UgdGhlIHJlbWFpbmluZyBsb2dzLiBXZSBhbHNvIGRvIHRoaXNcbi8vICAgIHB1cmdlIG9uIHN0YXJ0dXAgdG8gcHJldmVudCBsb2dzIGZyb20gYWNjdW11bGF0aW5nLlxuXG4vLyB0aGUgZnJlcXVlbmN5IHdpdGggd2hpY2ggd2UgZmx1c2ggdG8gaW5kZXhlZGRiXG5jb25zdCBGTFVTSF9SQVRFX01TID0gMzAgKiAxMDAwO1xuXG4vLyB0aGUgbGVuZ3RoIG9mIGxvZyBkYXRhIHdlIGtlZXAgaW4gaW5kZXhlZGRiIChhbmQgaW5jbHVkZSBpbiB0aGUgcmVwb3J0cylcbmNvbnN0IE1BWF9MT0dfU0laRSA9IDEwMjQgKiAxMDI0ICogNTsgLy8gNSBNQlxuXG4vLyBBIGNsYXNzIHdoaWNoIG1vbmtleS1wYXRjaGVzIHRoZSBnbG9iYWwgY29uc29sZSBhbmQgc3RvcmVzIGxvZyBsaW5lcy5cbmNsYXNzIENvbnNvbGVMb2dnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmxvZ3MgPSBcIlwiO1xuICAgIH1cblxuICAgIG1vbmtleVBhdGNoKGNvbnNvbGVPYmopIHtcbiAgICAgICAgLy8gTW9ua2V5LXBhdGNoIGNvbnNvbGUgbG9nZ2luZ1xuICAgICAgICBjb25zdCBjb25zb2xlRnVuY3Rpb25zVG9MZXZlbHMgPSB7XG4gICAgICAgICAgICBsb2c6IFwiSVwiLFxuICAgICAgICAgICAgaW5mbzogXCJJXCIsXG4gICAgICAgICAgICB3YXJuOiBcIldcIixcbiAgICAgICAgICAgIGVycm9yOiBcIkVcIixcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmtleXMoY29uc29sZUZ1bmN0aW9uc1RvTGV2ZWxzKS5mb3JFYWNoKChmbk5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxldmVsID0gY29uc29sZUZ1bmN0aW9uc1RvTGV2ZWxzW2ZuTmFtZV07XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbEZuID0gY29uc29sZU9ialtmbk5hbWVdLmJpbmQoY29uc29sZU9iaik7XG4gICAgICAgICAgICBjb25zb2xlT2JqW2ZuTmFtZV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGxldmVsLCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEZuKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9nKGxldmVsLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIFdlIGRvbid0IGtub3cgd2hhdCBsb2NhbGUgdGhlIHVzZXIgbWF5IGJlIHJ1bm5pbmcgc28gdXNlIElTTyBzdHJpbmdzXG4gICAgICAgIGNvbnN0IHRzID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIC8vIENvbnZlcnQgb2JqZWN0cyBhbmQgZXJyb3JzIHRvIGhlbHBmdWwgdGhpbmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLm1hcCgoYXJnKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJnIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnLm1lc3NhZ2UgKyAoYXJnLnN0YWNrID8gYFxcbiR7YXJnLnN0YWNrfWAgOiAnJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiAoYXJnKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluIGRldmVsb3BtZW50LCBpdCBjYW4gYmUgdXNlZnVsIHRvIGxvZyBjb21wbGV4IGN5Y2xpY1xuICAgICAgICAgICAgICAgICAgICAvLyBvYmplY3RzIHRvIHRoZSBjb25zb2xlIGZvciBpbnNwZWN0aW9uLiBUaGlzIGlzIGZpbmUgZm9yXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBjb25zb2xlLCBidXQgZGVmYXVsdCBgc3RyaW5naWZ5YCBjYW4ndCBoYW5kbGUgdGhhdC5cbiAgICAgICAgICAgICAgICAgICAgLy8gV2Ugd29ya2Fyb3VuZCB0aGlzIGJ5IHVzaW5nIGEgc3BlY2lhbCByZXBsYWNlciBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyB0byBvbmx5IGxvZyB2YWx1ZXMgb2YgdGhlIHJvb3Qgb2JqZWN0IGFuZCBhdm9pZCBjeWNsZXMuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmcsIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIjxvYmplY3Q+XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU29tZSBicm93c2VycyBzdXBwb3J0IHN0cmluZyBmb3JtYXR0aW5nIHdoaWNoIHdlJ3JlIG5vdCBkb2luZyBoZXJlXG4gICAgICAgIC8vIHNvIHRoZSBsaW5lcyBhcmUgYSBsaXR0bGUgbW9yZSB1Z2x5IGJ1dCBlYXN5IHRvIGltcGxlbWVudCAvIHF1aWNrIHRvXG4gICAgICAgIC8vIHJ1bi5cbiAgICAgICAgLy8gRXhhbXBsZSBsaW5lOlxuICAgICAgICAvLyAyMDE3LTAxLTE4VDExOjIzOjUzLjIxNFogVyBGYWlsZWQgdG8gc2V0IGJhZGdlIGNvdW50XG4gICAgICAgIGxldCBsaW5lID0gYCR7dHN9ICR7bGV2ZWx9ICR7YXJncy5qb2luKCcgJyl9XFxuYDtcbiAgICAgICAgLy8gRG8gc29tZSBjbGVhbnVwXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoL3Rva2VuPVthLXpBLVowLTktXSsvZ20sICd0b2tlbj14eHh4eCcpO1xuICAgICAgICAvLyBVc2luZyArIHJlYWxseSBpcyB0aGUgcXVpY2tlc3Qgd2F5IGluIEpTXG4gICAgICAgIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2NvbmNhdC12cy1wbHVzLXZzLWpvaW5cbiAgICAgICAgdGhpcy5sb2dzICs9IGxpbmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgbG9nIGxpbmVzIHRvIGZsdXNoIHRvIGRpc2suXG4gICAgICogQHBhcmFtIHtib29sZWFufSBrZWVwTG9ncyBUcnVlIHRvIG5vdCBkZWxldGUgbG9ncyBhZnRlciBmbHVzaGluZy5cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFxcbiBkZWxpbWl0ZWQgbG9nIGxpbmVzIHRvIGZsdXNoLlxuICAgICAqL1xuICAgIGZsdXNoKGtlZXBMb2dzKSB7XG4gICAgICAgIC8vIFRoZSBDb25zb2xlTG9nZ2VyIGRvZXNuJ3QgY2FyZSBob3cgdGhlc2UgZW5kIHVwIG9uIGRpc2ssIGl0IGp1c3RcbiAgICAgICAgLy8gZmx1c2hlcyB0aGVtIHRvIHRoZSBjYWxsZXIuXG4gICAgICAgIGlmIChrZWVwTG9ncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9ncztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2dzVG9GbHVzaCA9IHRoaXMubG9ncztcbiAgICAgICAgdGhpcy5sb2dzID0gXCJcIjtcbiAgICAgICAgcmV0dXJuIGxvZ3NUb0ZsdXNoO1xuICAgIH1cbn1cblxuLy8gQSBjbGFzcyB3aGljaCBzdG9yZXMgbG9nIGxpbmVzIGluIGFuIEluZGV4ZWREQiBpbnN0YW5jZS5cbmNsYXNzIEluZGV4ZWREQkxvZ1N0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcihpbmRleGVkREIsIGxvZ2dlcikge1xuICAgICAgICB0aGlzLmluZGV4ZWREQiA9IGluZGV4ZWREQjtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBsb2dnZXI7XG4gICAgICAgIHRoaXMuaWQgPSBcImluc3RhbmNlLVwiICsgTWF0aC5yYW5kb20oKSArIERhdGUubm93KCk7XG4gICAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgICAgICB0aGlzLmRiID0gbnVsbDtcblxuICAgICAgICAvLyB0aGVzZSBwcm9taXNlcyBhcmUgY2xlYXJlZCBhcyBzb29uIGFzIGZ1bGZpbGxlZFxuICAgICAgICB0aGlzLmZsdXNoUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIC8vIHNldCBpZiBmbHVzaCgpIGlzIGNhbGxlZCB3aGlsc3Qgb25lIGlzIG9uZ29pbmdcbiAgICAgICAgdGhpcy5mbHVzaEFnYWluUHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiB0aGUgc3RvcmUgaXMgcmVhZHkuXG4gICAgICovXG4gICAgY29ubmVjdCgpIHtcbiAgICAgICAgY29uc3QgcmVxID0gdGhpcy5pbmRleGVkREIub3BlbihcImxvZ3NcIik7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXEub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYiA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgLy8gUGVyaW9kaWNhbGx5IGZsdXNoIGxvZ3MgdG8gbG9jYWwgc3RvcmFnZSAvIGluZGV4ZWRkYlxuICAgICAgICAgICAgICAgIHNldEludGVydmFsKHRoaXMuZmx1c2guYmluZCh0aGlzKSwgRkxVU0hfUkFURV9NUyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnIgPSAoXG4gICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIG9wZW4gbG9nIGRhdGFiYXNlOiBcIiArIGV2ZW50LnRhcmdldC5lcnJvci5uYW1lXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEZpcnN0IHRpbWU6IFNldHVwIHRoZSBvYmplY3Qgc3RvcmVcbiAgICAgICAgICAgIHJlcS5vbnVwZ3JhZGVuZWVkZWQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYiA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9nT2JqU3RvcmUgPSBkYi5jcmVhdGVPYmplY3RTdG9yZShcImxvZ3NcIiwge1xuICAgICAgICAgICAgICAgICAgICBrZXlQYXRoOiBbXCJpZFwiLCBcImluZGV4XCJdLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIEtleXMgaW4gdGhlIGRhdGFiYXNlIGxvb2sgbGlrZTogWyBcImluc3RhbmNlLTE0ODkzODQ5MFwiLCAwIF1cbiAgICAgICAgICAgICAgICAvLyBMYXRlciBvbiB3ZSBuZWVkIHRvIHF1ZXJ5IGV2ZXJ5dGhpbmcgYmFzZWQgb24gYW4gaW5zdGFuY2UgaWQuXG4gICAgICAgICAgICAgICAgLy8gSW4gb3JkZXIgdG8gZG8gdGhpcywgd2UgbmVlZCB0byBzZXQgdXAgaW5kZXhlcyBcImlkXCIuXG4gICAgICAgICAgICAgICAgbG9nT2JqU3RvcmUuY3JlYXRlSW5kZXgoXCJpZFwiLCBcImlkXCIsIHsgdW5pcXVlOiBmYWxzZSB9KTtcblxuICAgICAgICAgICAgICAgIGxvZ09ialN0b3JlLmFkZChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVMb2dFbnRyeShcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKCkgKyBcIiA6OjogTG9nIGRhdGFiYXNlIHdhcyBjcmVhdGVkLlwiLFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0TW9kaWZpZWRTdG9yZSA9IGRiLmNyZWF0ZU9iamVjdFN0b3JlKFwibG9nc2xhc3Rtb2RcIiwge1xuICAgICAgICAgICAgICAgICAgICBrZXlQYXRoOiBcImlkXCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGFzdE1vZGlmaWVkU3RvcmUuYWRkKHRoaXMuX2dlbmVyYXRlTGFzdE1vZGlmaWVkVGltZSgpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZsdXNoIGxvZ3MgdG8gZGlzay5cbiAgICAgKlxuICAgICAqIFRoZXJlIGFyZSBndWFyZHMgdG8gcHJvdGVjdCBhZ2FpbnN0IHJhY2UgY29uZGl0aW9ucyBpbiBvcmRlciB0byBlbnN1cmVcbiAgICAgKiB0aGF0IGFsbCBwcmV2aW91cyBmbHVzaGVzIGhhdmUgY29tcGxldGVkIGJlZm9yZSB0aGUgbW9zdCByZWNlbnQgZmx1c2guXG4gICAgICogQ29uc2lkZXIgd2l0aG91dCBndWFyZHM6XG4gICAgICogIC0gQSBjYWxscyBmbHVzaCgpIHBlcmlvZGljYWxseS5cbiAgICAgKiAgLSBCIGNhbGxzIGZsdXNoKCkgYW5kIHdhbnRzIHRvIHNlbmQgbG9ncyBpbW1lZGlhdGVseSBhZnRlcndhcmRzLlxuICAgICAqICAtIElmIEIgZG9lc24ndCB3YWl0IGZvciBBJ3MgZmx1c2ggdG8gY29tcGxldGUsIEIgd2lsbCBiZSBtaXNzaW5nIHRoZVxuICAgICAqICAgIGNvbnRlbnRzIG9mIEEncyBmbHVzaC5cbiAgICAgKiBUbyBwcm90ZWN0IGFnYWluc3QgdGhpcywgd2Ugc2V0ICdmbHVzaFByb21pc2UnIHdoZW4gYSBmbHVzaCBpcyBvbmdvaW5nLlxuICAgICAqIFN1YnNlcXVlbnQgY2FsbHMgdG8gZmx1c2goKSBkdXJpbmcgdGhpcyBwZXJpb2Qgd2lsbCBjaGFpbiBhbm90aGVyIGZsdXNoLFxuICAgICAqIHRoZW4ga2VlcCByZXR1cm5pbmcgdGhhdCBzYW1lIGNoYWluZWQgZmx1c2guXG4gICAgICpcbiAgICAgKiBUaGlzIGd1YXJhbnRlZXMgdGhhdCB3ZSB3aWxsIGFsd2F5cyBldmVudHVhbGx5IGRvIGEgZmx1c2ggd2hlbiBmbHVzaCgpIGlzXG4gICAgICogY2FsbGVkLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gUmVzb2x2ZWQgd2hlbiB0aGUgbG9ncyBoYXZlIGJlZW4gZmx1c2hlZC5cbiAgICAgKi9cbiAgICBmbHVzaCgpIHtcbiAgICAgICAgLy8gY2hlY2sgaWYgYSBmbHVzaCgpIG9wZXJhdGlvbiBpcyBvbmdvaW5nXG4gICAgICAgIGlmICh0aGlzLmZsdXNoUHJvbWlzZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZmx1c2hBZ2FpblByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIHRoZSAzcmQrIHRpbWUgd2UndmUgY2FsbGVkIGZsdXNoKCkgOiByZXR1cm4gdGhlIHNhbWUgcHJvbWlzZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbHVzaEFnYWluUHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHF1ZXVlIHVwIGEgZmx1c2ggdG8gb2NjdXIgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHBlbmRpbmcgb25lIGNvbXBsZXRlcy5cbiAgICAgICAgICAgIHRoaXMuZmx1c2hBZ2FpblByb21pc2UgPSB0aGlzLmZsdXNoUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbHVzaCgpO1xuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5mbHVzaEFnYWluUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZsdXNoQWdhaW5Qcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIGZsdXNoIHByb21pc2Ugb3IgdGhlcmUgd2FzIGJ1dCBpdCBoYXMgZmluaXNoZWQsIHNvIGRvXG4gICAgICAgIC8vIGEgYnJhbmQgbmV3IG9uZSwgZGVzdHJveWluZyB0aGUgY2hhaW4gd2hpY2ggbWF5IGhhdmUgYmVlbiBidWlsdCB1cC5cbiAgICAgICAgdGhpcy5mbHVzaFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgICAgICAgICAgICAvLyBub3QgY29ubmVjdGVkIHlldCBvciB1c2VyIHJlamVjdGVkIGFjY2VzcyBmb3IgdXMgdG8gci93IHRvIHRoZSBkYi5cbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiTm8gY29ubmVjdGVkIGRhdGFiYXNlXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IHRoaXMubG9nZ2VyLmZsdXNoKCk7XG4gICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHR4biA9IHRoaXMuZGIudHJhbnNhY3Rpb24oW1wibG9nc1wiLCBcImxvZ3NsYXN0bW9kXCJdLCBcInJlYWR3cml0ZVwiKTtcbiAgICAgICAgICAgIGNvbnN0IG9ialN0b3JlID0gdHhuLm9iamVjdFN0b3JlKFwibG9nc1wiKTtcbiAgICAgICAgICAgIHR4bi5vbmNvbXBsZXRlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHR4bi5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgXCJGYWlsZWQgdG8gZmx1c2ggbG9ncyA6IFwiLCBldmVudCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJlamVjdChcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHdyaXRlIGxvZ3M6IFwiICsgZXZlbnQudGFyZ2V0LmVycm9yQ29kZSksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvYmpTdG9yZS5hZGQodGhpcy5fZ2VuZXJhdGVMb2dFbnRyeShsaW5lcykpO1xuICAgICAgICAgICAgY29uc3QgbGFzdE1vZFN0b3JlID0gdHhuLm9iamVjdFN0b3JlKFwibG9nc2xhc3Rtb2RcIik7XG4gICAgICAgICAgICBsYXN0TW9kU3RvcmUucHV0KHRoaXMuX2dlbmVyYXRlTGFzdE1vZGlmaWVkVGltZSgpKTtcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZsdXNoUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5mbHVzaFByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc3VtZSB0aGUgbW9zdCByZWNlbnQgbG9ncyBhbmQgcmV0dXJuIHRoZW0uIE9sZGVyIGxvZ3Mgd2hpY2ggYXJlIG5vdFxuICAgICAqIHJldHVybmVkIGFyZSBkZWxldGVkIGF0IHRoZSBzYW1lIHRpbWUsIHNvIHRoaXMgY2FuIGJlIGNhbGxlZCBhdCBzdGFydHVwXG4gICAgICogdG8gZG8gaG91c2Uta2VlcGluZyB0byBrZWVwIHRoZSBsb2dzIGZyb20gZ3Jvd2luZyB0b28gbGFyZ2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPE9iamVjdFtdPn0gUmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2Ygb2JqZWN0cy4gVGhlIGFycmF5IGlzXG4gICAgICogc29ydGVkIGluIHRpbWUgKG9sZGVzdCBmaXJzdCkgYmFzZWQgb24gd2hlbiB0aGUgbG9nIGZpbGUgd2FzIGNyZWF0ZWQgKHRoZVxuICAgICAqIGxvZyBJRCkuIFRoZSBvYmplY3RzIGhhdmUgc2FpZCBsb2cgSUQgaW4gYW4gXCJpZFwiIGZpZWxkIGFuZCBcImxpbmVzXCIgd2hpY2hcbiAgICAgKiBpcyBhIGJpZyBzdHJpbmcgd2l0aCBhbGwgdGhlIG5ldy1saW5lIGRlbGltaXRlZCBsb2dzLlxuICAgICAqL1xuICAgIGFzeW5jIGNvbnN1bWUoKSB7XG4gICAgICAgIGNvbnN0IGRiID0gdGhpcy5kYjtcblxuICAgICAgICAvLyBSZXR1cm5zOiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGNvbmNhdGVuYXRlZCBsb2dzIGZvciB0aGlzIElELlxuICAgICAgICAvLyBTdG9wcyBhZGRpbmcgbG9nIGZyYWdtZW50cyB3aGVuIHRoZSBzaXplIGV4Y2VlZHMgbWF4U2l6ZVxuICAgICAgICBmdW5jdGlvbiBmZXRjaExvZ3MoaWQsIG1heFNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFN0b3JlID0gZGIudHJhbnNhY3Rpb24oXCJsb2dzXCIsIFwicmVhZG9ubHlcIikub2JqZWN0U3RvcmUoXCJsb2dzXCIpO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gb2JqZWN0U3RvcmUuaW5kZXgoXCJpZFwiKS5vcGVuQ3Vyc29yKElEQktleVJhbmdlLm9ubHkoaWQpLCAncHJldicpO1xuICAgICAgICAgICAgICAgIGxldCBsaW5lcyA9ICcnO1xuICAgICAgICAgICAgICAgIHF1ZXJ5Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlF1ZXJ5IGZhaWxlZDogXCIgKyBldmVudC50YXJnZXQuZXJyb3JDb2RlKSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBxdWVyeS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3Vyc29yID0gZXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobGluZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBlbmQgb2YgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gY3Vyc29yLnZhbHVlLmxpbmVzICsgbGluZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5lcy5sZW5ndGggPj0gbWF4U2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShsaW5lcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldHVybnM6IEEgc29ydGVkIGFycmF5IG9mIGxvZyBJRHMuIChuZXdlc3QgZmlyc3QpXG4gICAgICAgIGZ1bmN0aW9uIGZldGNoTG9nSWRzKCkge1xuICAgICAgICAgICAgLy8gVG8gZ2F0aGVyIGFsbCB0aGUgbG9nIElEcywgcXVlcnkgZm9yIGFsbCByZWNvcmRzIGluIGxvZ3NsYXN0bW9kLlxuICAgICAgICAgICAgY29uc3QgbyA9IGRiLnRyYW5zYWN0aW9uKFwibG9nc2xhc3Rtb2RcIiwgXCJyZWFkb25seVwiKS5vYmplY3RTdG9yZShcbiAgICAgICAgICAgICAgICBcImxvZ3NsYXN0bW9kXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdFF1ZXJ5KG8sIHVuZGVmaW5lZCwgKGN1cnNvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBjdXJzb3IudmFsdWUuaWQsXG4gICAgICAgICAgICAgICAgICAgIHRzOiBjdXJzb3IudmFsdWUudHMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFNvcnQgSURzIGJ5IHRpbWVzdGFtcCAobmV3ZXN0IGZpcnN0KVxuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYi50cyAtIGEudHM7XG4gICAgICAgICAgICAgICAgfSkubWFwKChhKSA9PiBhLmlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlTG9ncyhpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eG4gPSBkYi50cmFuc2FjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgW1wibG9nc1wiLCBcImxvZ3NsYXN0bW9kXCJdLCBcInJlYWR3cml0ZVwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgbyA9IHR4bi5vYmplY3RTdG9yZShcImxvZ3NcIik7XG4gICAgICAgICAgICAgICAgLy8gb25seSBsb2FkIHRoZSBrZXkgcGF0aCwgbm90IHRoZSBkYXRhIHdoaWNoIG1heSBiZSBodWdlXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBvLmluZGV4KFwiaWRcIikub3BlbktleUN1cnNvcihJREJLZXlSYW5nZS5vbmx5KGlkKSk7XG4gICAgICAgICAgICAgICAgcXVlcnkub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnNvciA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgby5kZWxldGUoY3Vyc29yLnByaW1hcnlLZXkpO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHR4bi5vbmNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0eG4ub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGYWlsZWQgdG8gZGVsZXRlIGxvZ3MgZm9yIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJyR7aWR9JyA6ICR7ZXZlbnQudGFyZ2V0LmVycm9yQ29kZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBsYXN0IG1vZGlmaWVkIGVudHJpZXNcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0TW9kU3RvcmUgPSB0eG4ub2JqZWN0U3RvcmUoXCJsb2dzbGFzdG1vZFwiKTtcbiAgICAgICAgICAgICAgICBsYXN0TW9kU3RvcmUuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsTG9nSWRzID0gYXdhaXQgZmV0Y2hMb2dJZHMoKTtcbiAgICAgICAgbGV0IHJlbW92ZUxvZ0lkcyA9IFtdO1xuICAgICAgICBjb25zdCBsb2dzID0gW107XG4gICAgICAgIGxldCBzaXplID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxMb2dJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gYXdhaXQgZmV0Y2hMb2dzKGFsbExvZ0lkc1tpXSwgTUFYX0xPR19TSVpFIC0gc2l6ZSk7XG5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBhZGQgdGhlIGxvZyBmaWxlOiBmZXRjaExvZ3Mgd2lsbCB0cnVuY2F0ZSBvbmNlIHRoZSBtYXhTaXplIHdlIGdpdmUgaXQgaXNcbiAgICAgICAgICAgIC8vIGV4Y2VlZGVkLCBzbyB3ZSdsbCBnbyBvdmVyIHRoZSBtYXggYnV0IG9ubHkgYnkgb25lIGZyYWdtZW50J3Mgd29ydGguXG4gICAgICAgICAgICBsb2dzLnB1c2goe1xuICAgICAgICAgICAgICAgIGxpbmVzOiBsaW5lcyxcbiAgICAgICAgICAgICAgICBpZDogYWxsTG9nSWRzW2ldLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzaXplICs9IGxpbmVzLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gSWYgZmV0Y2hMb2dzIHRydW5jYXRlZCB3ZSdsbCBub3cgYmUgYXQgb3Igb3ZlciB0aGUgc2l6ZSBsaW1pdCxcbiAgICAgICAgICAgIC8vIGluIHdoaWNoIGNhc2Ugd2Ugc2hvdWxkIHN0b3AgYW5kIHJlbW92ZSB0aGUgcmVzdCBvZiB0aGUgbG9nIGZpbGVzLlxuICAgICAgICAgICAgaWYgKHNpemUgPj0gTUFYX0xPR19TSVpFKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIHJlbWFpbmluZyBsb2cgSURzIHNob3VsZCBiZSByZW1vdmVkLiBJZiB3ZSBnbyBvdXQgb2ZcbiAgICAgICAgICAgICAgICAvLyBib3VuZHMgdGhpcyBpcyBqdXN0IFtdXG4gICAgICAgICAgICAgICAgcmVtb3ZlTG9nSWRzID0gYWxsTG9nSWRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVtb3ZlTG9nSWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZpbmcgbG9nczogXCIsIHJlbW92ZUxvZ0lkcyk7XG4gICAgICAgICAgICAvLyBEb24ndCBhd2FpdCB0aGlzIGJlY2F1c2UgaXQncyBub24tZmF0YWwgaWYgd2UgY2FuJ3QgY2xlYW4gdXBcbiAgICAgICAgICAgIC8vIGxvZ3MuXG4gICAgICAgICAgICBQcm9taXNlLmFsbChyZW1vdmVMb2dJZHMubWFwKChpZCkgPT4gZGVsZXRlTG9ncyhpZCkpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVtb3ZlZCAke3JlbW92ZUxvZ0lkcy5sZW5ndGh9IG9sZCBsb2dzLmApO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2dzO1xuICAgIH1cblxuICAgIF9nZW5lcmF0ZUxvZ0VudHJ5KGxpbmVzKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgICAgIGxpbmVzOiBsaW5lcyxcbiAgICAgICAgICAgIGluZGV4OiB0aGlzLmluZGV4KyssXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2dlbmVyYXRlTGFzdE1vZGlmaWVkVGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICAgICAgdHM6IERhdGUubm93KCksXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gY29sbGVjdCByZXN1bHRzIGZyb20gYSBDdXJzb3IgYW5kIHByb21pc2VpZnkgaXQuXG4gKiBAcGFyYW0ge09iamVjdFN0b3JlfEluZGV4fSBzdG9yZSBUaGUgc3RvcmUgdG8gcGVyZm9ybSBvcGVuQ3Vyc29yIG9uLlxuICogQHBhcmFtIHtJREJLZXlSYW5nZT19IGtleVJhbmdlIE9wdGlvbmFsIGtleSByYW5nZSB0byBhcHBseSBvbiB0aGUgY3Vyc29yLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzdWx0TWFwcGVyIEEgZnVuY3Rpb24gd2hpY2ggaXMgcmVwZWF0ZWRseSBjYWxsZWQgd2l0aCBhXG4gKiBDdXJzb3IuXG4gKiBSZXR1cm4gdGhlIGRhdGEgeW91IHdhbnQgdG8ga2VlcC5cbiAqIEByZXR1cm4ge1Byb21pc2U8VFtdPn0gUmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2Ygd2hhdGV2ZXIgeW91IHJldHVybmVkIGZyb21cbiAqIHJlc3VsdE1hcHBlci5cbiAqL1xuZnVuY3Rpb24gc2VsZWN0UXVlcnkoc3RvcmUsIGtleVJhbmdlLCByZXN1bHRNYXBwZXIpIHtcbiAgICBjb25zdCBxdWVyeSA9IHN0b3JlLm9wZW5DdXJzb3Ioa2V5UmFuZ2UpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgcXVlcnkub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlF1ZXJ5IGZhaWxlZDogXCIgKyBldmVudC50YXJnZXQuZXJyb3JDb2RlKSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGNvbGxlY3QgcmVzdWx0c1xuICAgICAgICBxdWVyeS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnNvciA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICBpZiAoIWN1cnNvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBlbmQgb2YgcmVzdWx0c1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdE1hcHBlcihjdXJzb3IpKTtcbiAgICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgICB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZSByYWdlIHNoYWtpbmcgc3VwcG9ydCBmb3Igc2VuZGluZyBidWcgcmVwb3J0cy5cbiAqIE1vZGlmaWVzIGdsb2JhbHMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNldFVwUGVyc2lzdGVuY2UgV2hlbiB0cnVlIChkZWZhdWx0KSwgdGhlIHBlcnNpc3RlbmNlIHdpbGxcbiAqIGJlIHNldCB1cCBpbW1lZGlhdGVseSBmb3IgdGhlIGxvZ3MuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNldCB1cC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXQoc2V0VXBQZXJzaXN0ZW5jZSA9IHRydWUpIHtcbiAgICBpZiAoZ2xvYmFsLm14X3JhZ2VfaW5pdFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5teF9yYWdlX2luaXRQcm9taXNlO1xuICAgIH1cbiAgICBnbG9iYWwubXhfcmFnZV9sb2dnZXIgPSBuZXcgQ29uc29sZUxvZ2dlcigpO1xuICAgIGdsb2JhbC5teF9yYWdlX2xvZ2dlci5tb25rZXlQYXRjaCh3aW5kb3cuY29uc29sZSk7XG5cbiAgICBpZiAoc2V0VXBQZXJzaXN0ZW5jZSkge1xuICAgICAgICByZXR1cm4gdHJ5SW5pdFN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBnbG9iYWwubXhfcmFnZV9pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIHJldHVybiBnbG9iYWwubXhfcmFnZV9pbml0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBUcnkgdG8gc3RhcnQgdXAgdGhlIHJhZ2VzaGFrZSBzdG9yYWdlIGZvciBsb2dzLiBJZiBub3QgcG9zc2libGUgKGNsaWVudCB1bnN1cHBvcnRlZClcbiAqIHRoZW4gdGhpcyBuby1vcHMuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5SW5pdFN0b3JhZ2UoKSB7XG4gICAgaWYgKGdsb2JhbC5teF9yYWdlX2luaXRTdG9yYWdlUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gZ2xvYmFsLm14X3JhZ2VfaW5pdFN0b3JhZ2VQcm9taXNlO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiQ29uZmlndXJpbmcgcmFnZXNoYWtlIHBlcnNpc3RlbmNlLi4uXCIpO1xuXG4gICAgLy8ganVzdCAqYWNjZXNzaW5nKiBpbmRleGVkREIgdGhyb3dzIGFuIGV4Y2VwdGlvbiBpbiBmaXJlZm94IHdpdGhcbiAgICAvLyBpbmRleGVkZGIgZGlzYWJsZWQuXG4gICAgbGV0IGluZGV4ZWREQjtcbiAgICB0cnkge1xuICAgICAgICBpbmRleGVkREIgPSB3aW5kb3cuaW5kZXhlZERCO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAoaW5kZXhlZERCKSB7XG4gICAgICAgIGdsb2JhbC5teF9yYWdlX3N0b3JlID0gbmV3IEluZGV4ZWREQkxvZ1N0b3JlKGluZGV4ZWREQiwgZ2xvYmFsLm14X3JhZ2VfbG9nZ2VyKTtcbiAgICAgICAgZ2xvYmFsLm14X3JhZ2VfaW5pdFN0b3JhZ2VQcm9taXNlID0gZ2xvYmFsLm14X3JhZ2Vfc3RvcmUuY29ubmVjdCgpO1xuICAgICAgICByZXR1cm4gZ2xvYmFsLm14X3JhZ2VfaW5pdFN0b3JhZ2VQcm9taXNlO1xuICAgIH1cbiAgICBnbG9iYWwubXhfcmFnZV9pbml0U3RvcmFnZVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICByZXR1cm4gZ2xvYmFsLm14X3JhZ2VfaW5pdFN0b3JhZ2VQcm9taXNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgaWYgKCFnbG9iYWwubXhfcmFnZV9zdG9yZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdsb2JhbC5teF9yYWdlX3N0b3JlLmZsdXNoKCk7XG59XG5cbi8qKlxuICogQ2xlYW4gdXAgb2xkIGxvZ3MuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyBpZiBjbGVhbmVkIGxvZ3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgIGlmICghZ2xvYmFsLm14X3JhZ2Vfc3RvcmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBnbG9iYWwubXhfcmFnZV9zdG9yZS5jb25zdW1lKCk7XG59XG5cbi8qKlxuICogR2V0IGEgcmVjZW50IHNuYXBzaG90IG9mIHRoZSBsb2dzLCByZWFkeSBmb3IgYXR0YWNoaW5nIHRvIGEgYnVnIHJlcG9ydFxuICpcbiAqIEByZXR1cm4ge0FycmF5PHtsaW5lczogc3RyaW5nLCBpZCwgc3RyaW5nfT59ICBsaXN0IG9mIGxvZyBkYXRhXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRMb2dzRm9yUmVwb3J0KCkge1xuICAgIGlmICghZ2xvYmFsLm14X3JhZ2VfbG9nZ2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIFwiTm8gY29uc29sZSBsb2dnZXIsIGRpZCB5b3UgZm9yZ2V0IHRvIGNhbGwgaW5pdCgpP1wiLFxuICAgICAgICApO1xuICAgIH1cbiAgICAvLyBJZiBpbiBpbmNvZ25pdG8gbW9kZSwgc3RvcmUgaXMgbnVsbCwgYnV0IHdlIHN0aWxsIHdhbnQgYnVnIHJlcG9ydFxuICAgIC8vIHNlbmRpbmcgdG8gd29yayBnb2luZyBvZmYgdGhlIGluLW1lbW9yeSBjb25zb2xlIGxvZ3MuXG4gICAgaWYgKGdsb2JhbC5teF9yYWdlX3N0b3JlKSB7XG4gICAgICAgIC8vIGZsdXNoIG1vc3QgcmVjZW50IGxvZ3NcbiAgICAgICAgYXdhaXQgZ2xvYmFsLm14X3JhZ2Vfc3RvcmUuZmx1c2goKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGdsb2JhbC5teF9yYWdlX3N0b3JlLmNvbnN1bWUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIGxpbmVzOiBnbG9iYWwubXhfcmFnZV9sb2dnZXIuZmx1c2godHJ1ZSksXG4gICAgICAgICAgICBpZDogXCItXCIsXG4gICAgICAgIH1dO1xuICAgIH1cbn1cbiJdfQ==