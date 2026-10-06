"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
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
 * @return {Promise} Resolves when set up.
 */


function init() {
  if (global.mx_rage_initPromise) {
    return global.mx_rage_initPromise;
  }

  global.mx_rage_logger = new ConsoleLogger();
  global.mx_rage_logger.monkeyPatch(window.console); // just *accessing* indexedDB throws an exception in firefox with
  // indexeddb disabled.

  let indexedDB;

  try {
    indexedDB = window.indexedDB;
  } catch (e) {}

  if (indexedDB) {
    global.mx_rage_store = new IndexedDBLogStore(indexedDB, global.mx_rage_logger);
    global.mx_rage_initPromise = global.mx_rage_store.connect();
    return global.mx_rage_initPromise;
  }

  global.mx_rage_initPromise = Promise.resolve();
  return global.mx_rage_initPromise;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yYWdlc2hha2UvcmFnZXNoYWtlLmpzIl0sIm5hbWVzIjpbIkZMVVNIX1JBVEVfTVMiLCJNQVhfTE9HX1NJWkUiLCJDb25zb2xlTG9nZ2VyIiwiY29uc3RydWN0b3IiLCJsb2dzIiwibW9ua2V5UGF0Y2giLCJjb25zb2xlT2JqIiwiY29uc29sZUZ1bmN0aW9uc1RvTGV2ZWxzIiwibG9nIiwiaW5mbyIsIndhcm4iLCJlcnJvciIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiZm5OYW1lIiwibGV2ZWwiLCJvcmlnaW5hbEZuIiwiYmluZCIsImFyZ3MiLCJ0cyIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsIm1hcCIsImFyZyIsIkVycm9yIiwibWVzc2FnZSIsInN0YWNrIiwiSlNPTiIsInN0cmluZ2lmeSIsImUiLCJrZXkiLCJ2YWx1ZSIsImxpbmUiLCJqb2luIiwicmVwbGFjZSIsImZsdXNoIiwia2VlcExvZ3MiLCJsb2dzVG9GbHVzaCIsIkluZGV4ZWREQkxvZ1N0b3JlIiwiaW5kZXhlZERCIiwibG9nZ2VyIiwiaWQiLCJNYXRoIiwicmFuZG9tIiwibm93IiwiaW5kZXgiLCJkYiIsImZsdXNoUHJvbWlzZSIsImZsdXNoQWdhaW5Qcm9taXNlIiwiY29ubmVjdCIsInJlcSIsIm9wZW4iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uc3VjY2VzcyIsImV2ZW50IiwidGFyZ2V0IiwicmVzdWx0Iiwic2V0SW50ZXJ2YWwiLCJvbmVycm9yIiwiZXJyIiwibmFtZSIsImNvbnNvbGUiLCJvbnVwZ3JhZGVuZWVkZWQiLCJsb2dPYmpTdG9yZSIsImNyZWF0ZU9iamVjdFN0b3JlIiwia2V5UGF0aCIsImNyZWF0ZUluZGV4IiwidW5pcXVlIiwiYWRkIiwiX2dlbmVyYXRlTG9nRW50cnkiLCJsYXN0TW9kaWZpZWRTdG9yZSIsIl9nZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUiLCJ0aGVuIiwibGluZXMiLCJsZW5ndGgiLCJ0eG4iLCJ0cmFuc2FjdGlvbiIsIm9ialN0b3JlIiwib2JqZWN0U3RvcmUiLCJvbmNvbXBsZXRlIiwiZXJyb3JDb2RlIiwibGFzdE1vZFN0b3JlIiwicHV0IiwiY29uc3VtZSIsImZldGNoTG9ncyIsIm1heFNpemUiLCJxdWVyeSIsIm9wZW5DdXJzb3IiLCJJREJLZXlSYW5nZSIsIm9ubHkiLCJjdXJzb3IiLCJjb250aW51ZSIsImZldGNoTG9nSWRzIiwibyIsInNlbGVjdFF1ZXJ5IiwidW5kZWZpbmVkIiwicmVzIiwic29ydCIsImEiLCJiIiwiZGVsZXRlTG9ncyIsIm9wZW5LZXlDdXJzb3IiLCJkZWxldGUiLCJwcmltYXJ5S2V5IiwiYWxsTG9nSWRzIiwicmVtb3ZlTG9nSWRzIiwic2l6ZSIsImkiLCJwdXNoIiwic2xpY2UiLCJhbGwiLCJzdG9yZSIsImtleVJhbmdlIiwicmVzdWx0TWFwcGVyIiwicmVzdWx0cyIsImluaXQiLCJnbG9iYWwiLCJteF9yYWdlX2luaXRQcm9taXNlIiwibXhfcmFnZV9sb2dnZXIiLCJ3aW5kb3ciLCJteF9yYWdlX3N0b3JlIiwiY2xlYW51cCIsImdldExvZ3NGb3JSZXBvcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsTUFBTUEsYUFBYSxHQUFHLEtBQUssSUFBM0IsQyxDQUVBOztBQUNBLE1BQU1DLFlBQVksR0FBRyxPQUFPLElBQVAsR0FBYyxDQUFuQyxDLENBQXNDO0FBRXRDOztBQUNBLE1BQU1DLGFBQU4sQ0FBb0I7QUFDaEJDLEVBQUFBLFdBQVcsR0FBRztBQUNWLFNBQUtDLElBQUwsR0FBWSxFQUFaO0FBQ0g7O0FBRURDLEVBQUFBLFdBQVcs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QUFNLENBQUNDLG1CQUFkO0FBQ0g7O0FBQ0RELEVBQUFBLE1BQU0sQ0FBQ0MsbUJBQVAsR0FBNkJuRSxPQUFPLENBQUNDLE9BQVIsRUFBN0I7QUFDQSxTQUFPaUUsTUFBTSxDQUFDQyxtQkFBZDtBQUNIOztBQUVNLFNBQVNwRixLQUFULEdBQWlCO0FBQ3BCLE1BQUksQ0FBQ21GLE1BQU0sQ0FBQ0ksYUFBWixFQUEyQjtBQUN2QjtBQUNIOztBQUNESixFQUFBQSxNQUFNLENBQUNJLGFBQVAsQ0FBcUJ2RixLQUFyQjtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLGVBQWV3RixPQUFmLEdBQXlCO0FBQzVCLE1BQUksQ0FBQ0wsTUFBTSxDQUFDSSxhQUFaLEVBQTJCO0FBQ3ZCO0FBQ0g7O0FBQ0QsUUFBTUosTUFBTSxDQUFDSSxhQUFQLENBQXFCckMsT0FBckIsRUFBTjtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sZUFBZXVDLGdCQUFmLEdBQWtDO0FBQ3JDLE1BQUksQ0FBQ04sTUFBTSxDQUFDRSxjQUFaLEVBQTRCO0FBQ3hCLFVBQU0sSUFBSWhHLEtBQUosQ0FDRixtREFERSxDQUFOO0FBR0gsR0FMb0MsQ0FNckM7QUFDQTs7O0FBQ0EsTUFBSThGLE1BQU0sQ0FBQ0ksYUFBWCxFQUEwQjtBQUN0QjtBQUNBLFVBQU1KLE1BQU0sQ0FBQ0ksYUFBUCxDQUFxQnZGLEtBQXJCLEVBQU47QUFDQSxXQUFPLE1BQU1tRixNQUFNLENBQUNJLGFBQVAsQ0FBcUJyQyxPQUFyQixFQUFiO0FBQ0gsR0FKRCxNQUlPO0FBQ0gsV0FBTyxDQUFDO0FBQ0pWLE1BQUFBLEtBQUssRUFBRTJDLE1BQU0sQ0FBQ0UsY0FBUCxDQUFzQnJGLEtBQXRCLENBQTRCLElBQTVCLENBREg7QUFFSk0sTUFBQUEsRUFBRSxFQUFFO0FBRkEsS0FBRCxDQUFQO0FBSUg7QUFDSiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gVGhpcyBtb2R1bGUgY29udGFpbnMgYWxsIHRoZSBjb2RlIG5lZWRlZCB0byBsb2cgdGhlIGNvbnNvbGUsIHBlcnNpc3QgaXQgdG9cbi8vIGRpc2sgYW5kIHN1Ym1pdCBidWcgcmVwb3J0cy4gUmF0aW9uYWxlIGlzIGFzIGZvbGxvd3M6XG4vLyAgLSBNb25rZXktcGF0Y2hpbmcgdGhlIGNvbnNvbGUgaXMgcHJlZmVyYWJsZSB0byBoYXZpbmcgYSBsb2cgbGlicmFyeSBiZWNhdXNlXG4vLyAgICB3ZSBjYW4gY2F0Y2ggbG9ncyBieSBvdGhlciBsaWJyYXJpZXMgbW9yZSBlYXNpbHksIHdpdGhvdXQgaGF2aW5nIHRvIGFsbFxuLy8gICAgZGVwZW5kIG9uIHRoZSBzYW1lIGxvZyBmcmFtZXdvcmsgLyBwYXNzIHRoZSBsb2dnZXIgYXJvdW5kLlxuLy8gIC0gV2UgdXNlIEluZGV4ZWREQiB0byBwZXJzaXN0cyBsb2dzIGJlY2F1c2UgaXQgaGFzIGdlbmVyb3VzIGRpc2sgc3BhY2Vcbi8vICAgIGxpbWl0cyBjb21wYXJlZCB0byBsb2NhbCBzdG9yYWdlLiBJbmRleGVkREIgZG9lcyBub3Qgd29yayBpbiBpbmNvZ25pdG9cbi8vICAgIG1vZGUsIGluIHdoaWNoIGNhc2UgdGhpcyBtb2R1bGUgd2lsbCBub3QgYmUgYWJsZSB0byB3cml0ZSBsb2dzIHRvIGRpc2suXG4vLyAgICBIb3dldmVyLCB0aGUgbG9ncyB3aWxsIHN0aWxsIGJlIHN0b3JlZCBpbi1tZW1vcnksIHNvIGNhbiBzdGlsbCBiZVxuLy8gICAgc3VibWl0dGVkIGluIGEgYnVnIHJlcG9ydCBzaG91bGQgdGhlIHVzZXIgd2lzaCB0bzogd2UgY2FuIGFsc28gc3RvcmUgbW9yZVxuLy8gICAgbG9ncyBpbi1tZW1vcnkgdGhhbiBpbiBsb2NhbCBzdG9yYWdlLCB3aGljaCBkb2VzIHdvcmsgaW4gaW5jb2duaXRvIG1vZGUuXG4vLyAgICBXZSBhbHNvIG5lZWQgdG8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZXJlIGFyZSAyKyB0YWJzLiBFYWNoIEpTIHJ1bnRpbWVcbi8vICAgIGdlbmVyYXRlcyBhIHJhbmRvbSBzdHJpbmcgd2hpY2ggc2VydmVzIGFzIHRoZSBcIklEXCIgZm9yIHRoYXQgdGFiL3Nlc3Npb24uXG4vLyAgICBUaGVzZSBJRHMgYXJlIHN0b3JlZCBhbG9uZyB3aXRoIHRoZSBsb2cgbGluZXMuXG4vLyAgLSBCdWcgcmVwb3J0cyBhcmUgc2VudCBhcyBhIFBPU1Qgb3ZlciBIVFRQUzogaXQgcHVycG9zZWZ1bGx5IGRvZXMgbm90IHVzZVxuLy8gICAgTWF0cml4IGFzIGJ1ZyByZXBvcnRzIG1heSBiZSBtYWRlIHdoZW4gTWF0cml4IGlzIG5vdCByZXNwb25zaXZlICh3aGljaCBtYXlcbi8vICAgIGJlIHRoZSBjYXVzZSBvZiB0aGUgYnVnKS4gV2Ugc2VuZCB0aGUgbW9zdCByZWNlbnQgTiBNQiBvZiBVVEYtOCBsb2cgZGF0YSxcbi8vICAgIHN0YXJ0aW5nIHdpdGggdGhlIG1vc3QgcmVjZW50LCB3aGljaCB3ZSBrbm93IGJlY2F1c2UgdGhlIFwiSURcInMgYXJlXG4vLyAgICBhY3R1YWxseSB0aW1lc3RhbXBzLiBXZSB0aGVuIHB1cmdlIHRoZSByZW1haW5pbmcgbG9ncy4gV2UgYWxzbyBkbyB0aGlzXG4vLyAgICBwdXJnZSBvbiBzdGFydHVwIHRvIHByZXZlbnQgbG9ncyBmcm9tIGFjY3VtdWxhdGluZy5cblxuLy8gdGhlIGZyZXF1ZW5jeSB3aXRoIHdoaWNoIHdlIGZsdXNoIHRvIGluZGV4ZWRkYlxuY29uc3QgRkxVU0hfUkFURV9NUyA9IDMwICogMTAwMDtcblxuLy8gdGhlIGxlbmd0aCBvZiBsb2cgZGF0YSB3ZSBrZWVwIGluIGluZGV4ZWRkYiAoYW5kIGluY2x1ZGUgaW4gdGhlIHJlcG9ydHMpXG5jb25zdCBNQVhfTE9HX1NJWkUgPSAxMDI0ICogMTAyNCAqIDU7IC8vIDUgTUJcblxuLy8gQSBjbGFzcyB3aGljaCBtb25rZXktcGF0Y2hlcyB0aGUgZ2xvYmFsIGNvbnNvbGUgYW5kIHN0b3JlcyBsb2cgbGluZXMuXG5jbGFzcyBDb25zb2xlTG9nZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5sb2dzID0gXCJcIjtcbiAgICB9XG5cbiAgICBtb25rZXlQYXRjaChjb25zb2xlT2JqKSB7XG4gICAgICAgIC8vIE1vbmtleS1wYXRjaCBjb25zb2xlIGxvZ2dpbmdcbiAgICAgICAgY29uc3QgY29uc29sZUZ1bmN0aW9uc1RvTGV2ZWxzID0ge1xuICAgICAgICAgICAgbG9nOiBcIklcIixcbiAgICAgICAgICAgIGluZm86IFwiSVwiLFxuICAgICAgICAgICAgd2FybjogXCJXXCIsXG4gICAgICAgICAgICBlcnJvcjogXCJFXCIsXG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5rZXlzKGNvbnNvbGVGdW5jdGlvbnNUb0xldmVscykuZm9yRWFjaCgoZm5OYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsZXZlbCA9IGNvbnNvbGVGdW5jdGlvbnNUb0xldmVsc1tmbk5hbWVdO1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxGbiA9IGNvbnNvbGVPYmpbZm5OYW1lXS5iaW5kKGNvbnNvbGVPYmopO1xuICAgICAgICAgICAgY29uc29sZU9ialtmbk5hbWVdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhsZXZlbCwgLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxGbiguLi5hcmdzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGxvZyhsZXZlbCwgLi4uYXJncykge1xuICAgICAgICAvLyBXZSBkb24ndCBrbm93IHdoYXQgbG9jYWxlIHRoZSB1c2VyIG1heSBiZSBydW5uaW5nIHNvIHVzZSBJU08gc3RyaW5nc1xuICAgICAgICBjb25zdCB0cyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAvLyBDb252ZXJ0IG9iamVjdHMgYW5kIGVycm9ycyB0byBoZWxwZnVsIHRoaW5nc1xuICAgICAgICBhcmdzID0gYXJncy5tYXAoKGFyZykgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZy5tZXNzYWdlICsgKGFyZy5zdGFjayA/IGBcXG4ke2FyZy5zdGFja31gIDogJycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgKGFyZykgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBkZXZlbG9wbWVudCwgaXQgY2FuIGJlIHVzZWZ1bCB0byBsb2cgY29tcGxleCBjeWNsaWNcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqZWN0cyB0byB0aGUgY29uc29sZSBmb3IgaW5zcGVjdGlvbi4gVGhpcyBpcyBmaW5lIGZvclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgY29uc29sZSwgYnV0IGRlZmF1bHQgYHN0cmluZ2lmeWAgY2FuJ3QgaGFuZGxlIHRoYXQuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHdvcmthcm91bmQgdGhpcyBieSB1c2luZyBhIHNwZWNpYWwgcmVwbGFjZXIgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gb25seSBsb2cgdmFsdWVzIG9mIHRoZSByb290IG9iamVjdCBhbmQgYXZvaWQgY3ljbGVzLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCI8b2JqZWN0PlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNvbWUgYnJvd3NlcnMgc3VwcG9ydCBzdHJpbmcgZm9ybWF0dGluZyB3aGljaCB3ZSdyZSBub3QgZG9pbmcgaGVyZVxuICAgICAgICAvLyBzbyB0aGUgbGluZXMgYXJlIGEgbGl0dGxlIG1vcmUgdWdseSBidXQgZWFzeSB0byBpbXBsZW1lbnQgLyBxdWljayB0b1xuICAgICAgICAvLyBydW4uXG4gICAgICAgIC8vIEV4YW1wbGUgbGluZTpcbiAgICAgICAgLy8gMjAxNy0wMS0xOFQxMToyMzo1My4yMTRaIFcgRmFpbGVkIHRvIHNldCBiYWRnZSBjb3VudFxuICAgICAgICBsZXQgbGluZSA9IGAke3RzfSAke2xldmVsfSAke2FyZ3Muam9pbignICcpfVxcbmA7XG4gICAgICAgIC8vIERvIHNvbWUgY2xlYW51cFxuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKC90b2tlbj1bYS16QS1aMC05LV0rL2dtLCAndG9rZW49eHh4eHgnKTtcbiAgICAgICAgLy8gVXNpbmcgKyByZWFsbHkgaXMgdGhlIHF1aWNrZXN0IHdheSBpbiBKU1xuICAgICAgICAvLyBodHRwOi8vanNwZXJmLmNvbS9jb25jYXQtdnMtcGx1cy12cy1qb2luXG4gICAgICAgIHRoaXMubG9ncyArPSBsaW5lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGxvZyBsaW5lcyB0byBmbHVzaCB0byBkaXNrLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0ga2VlcExvZ3MgVHJ1ZSB0byBub3QgZGVsZXRlIGxvZ3MgYWZ0ZXIgZmx1c2hpbmcuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBcXG4gZGVsaW1pdGVkIGxvZyBsaW5lcyB0byBmbHVzaC5cbiAgICAgKi9cbiAgICBmbHVzaChrZWVwTG9ncykge1xuICAgICAgICAvLyBUaGUgQ29uc29sZUxvZ2dlciBkb2Vzbid0IGNhcmUgaG93IHRoZXNlIGVuZCB1cCBvbiBkaXNrLCBpdCBqdXN0XG4gICAgICAgIC8vIGZsdXNoZXMgdGhlbSB0byB0aGUgY2FsbGVyLlxuICAgICAgICBpZiAoa2VlcExvZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvZ3M7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9nc1RvRmx1c2ggPSB0aGlzLmxvZ3M7XG4gICAgICAgIHRoaXMubG9ncyA9IFwiXCI7XG4gICAgICAgIHJldHVybiBsb2dzVG9GbHVzaDtcbiAgICB9XG59XG5cbi8vIEEgY2xhc3Mgd2hpY2ggc3RvcmVzIGxvZyBsaW5lcyBpbiBhbiBJbmRleGVkREIgaW5zdGFuY2UuXG5jbGFzcyBJbmRleGVkREJMb2dTdG9yZSB7XG4gICAgY29uc3RydWN0b3IoaW5kZXhlZERCLCBsb2dnZXIpIHtcbiAgICAgICAgdGhpcy5pbmRleGVkREIgPSBpbmRleGVkREI7XG4gICAgICAgIHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuICAgICAgICB0aGlzLmlkID0gXCJpbnN0YW5jZS1cIiArIE1hdGgucmFuZG9tKCkgKyBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5kYiA9IG51bGw7XG5cbiAgICAgICAgLy8gdGhlc2UgcHJvbWlzZXMgYXJlIGNsZWFyZWQgYXMgc29vbiBhcyBmdWxmaWxsZWRcbiAgICAgICAgdGhpcy5mbHVzaFByb21pc2UgPSBudWxsO1xuICAgICAgICAvLyBzZXQgaWYgZmx1c2goKSBpcyBjYWxsZWQgd2hpbHN0IG9uZSBpcyBvbmdvaW5nXG4gICAgICAgIHRoaXMuZmx1c2hBZ2FpblByb21pc2UgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIHN0b3JlIGlzIHJlYWR5LlxuICAgICAqL1xuICAgIGNvbm5lY3QoKSB7XG4gICAgICAgIGNvbnN0IHJlcSA9IHRoaXMuaW5kZXhlZERCLm9wZW4oXCJsb2dzXCIpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGIgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgIC8vIFBlcmlvZGljYWxseSBmbHVzaCBsb2dzIHRvIGxvY2FsIHN0b3JhZ2UgLyBpbmRleGVkZGJcbiAgICAgICAgICAgICAgICBzZXRJbnRlcnZhbCh0aGlzLmZsdXNoLmJpbmQodGhpcyksIEZMVVNIX1JBVEVfTVMpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlcS5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyID0gKFxuICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byBvcGVuIGxvZyBkYXRhYmFzZTogXCIgKyBldmVudC50YXJnZXQuZXJyb3IubmFtZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBGaXJzdCB0aW1lOiBTZXR1cCB0aGUgb2JqZWN0IHN0b3JlXG4gICAgICAgICAgICByZXEub251cGdyYWRlbmVlZGVkID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGIgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvZ09ialN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoXCJsb2dzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAga2V5UGF0aDogW1wiaWRcIiwgXCJpbmRleFwiXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBLZXlzIGluIHRoZSBkYXRhYmFzZSBsb29rIGxpa2U6IFsgXCJpbnN0YW5jZS0xNDg5Mzg0OTBcIiwgMCBdXG4gICAgICAgICAgICAgICAgLy8gTGF0ZXIgb24gd2UgbmVlZCB0byBxdWVyeSBldmVyeXRoaW5nIGJhc2VkIG9uIGFuIGluc3RhbmNlIGlkLlxuICAgICAgICAgICAgICAgIC8vIEluIG9yZGVyIHRvIGRvIHRoaXMsIHdlIG5lZWQgdG8gc2V0IHVwIGluZGV4ZXMgXCJpZFwiLlxuICAgICAgICAgICAgICAgIGxvZ09ialN0b3JlLmNyZWF0ZUluZGV4KFwiaWRcIiwgXCJpZFwiLCB7IHVuaXF1ZTogZmFsc2UgfSk7XG5cbiAgICAgICAgICAgICAgICBsb2dPYmpTdG9yZS5hZGQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlTG9nRW50cnkoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZSgpICsgXCIgOjo6IExvZyBkYXRhYmFzZSB3YXMgY3JlYXRlZC5cIixcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdE1vZGlmaWVkU3RvcmUgPSBkYi5jcmVhdGVPYmplY3RTdG9yZShcImxvZ3NsYXN0bW9kXCIsIHtcbiAgICAgICAgICAgICAgICAgICAga2V5UGF0aDogXCJpZFwiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZFN0b3JlLmFkZCh0aGlzLl9nZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUoKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGbHVzaCBsb2dzIHRvIGRpc2suXG4gICAgICpcbiAgICAgKiBUaGVyZSBhcmUgZ3VhcmRzIHRvIHByb3RlY3QgYWdhaW5zdCByYWNlIGNvbmRpdGlvbnMgaW4gb3JkZXIgdG8gZW5zdXJlXG4gICAgICogdGhhdCBhbGwgcHJldmlvdXMgZmx1c2hlcyBoYXZlIGNvbXBsZXRlZCBiZWZvcmUgdGhlIG1vc3QgcmVjZW50IGZsdXNoLlxuICAgICAqIENvbnNpZGVyIHdpdGhvdXQgZ3VhcmRzOlxuICAgICAqICAtIEEgY2FsbHMgZmx1c2goKSBwZXJpb2RpY2FsbHkuXG4gICAgICogIC0gQiBjYWxscyBmbHVzaCgpIGFuZCB3YW50cyB0byBzZW5kIGxvZ3MgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkcy5cbiAgICAgKiAgLSBJZiBCIGRvZXNuJ3Qgd2FpdCBmb3IgQSdzIGZsdXNoIHRvIGNvbXBsZXRlLCBCIHdpbGwgYmUgbWlzc2luZyB0aGVcbiAgICAgKiAgICBjb250ZW50cyBvZiBBJ3MgZmx1c2guXG4gICAgICogVG8gcHJvdGVjdCBhZ2FpbnN0IHRoaXMsIHdlIHNldCAnZmx1c2hQcm9taXNlJyB3aGVuIGEgZmx1c2ggaXMgb25nb2luZy5cbiAgICAgKiBTdWJzZXF1ZW50IGNhbGxzIHRvIGZsdXNoKCkgZHVyaW5nIHRoaXMgcGVyaW9kIHdpbGwgY2hhaW4gYW5vdGhlciBmbHVzaCxcbiAgICAgKiB0aGVuIGtlZXAgcmV0dXJuaW5nIHRoYXQgc2FtZSBjaGFpbmVkIGZsdXNoLlxuICAgICAqXG4gICAgICogVGhpcyBndWFyYW50ZWVzIHRoYXQgd2Ugd2lsbCBhbHdheXMgZXZlbnR1YWxseSBkbyBhIGZsdXNoIHdoZW4gZmx1c2goKSBpc1xuICAgICAqIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVkIHdoZW4gdGhlIGxvZ3MgaGF2ZSBiZWVuIGZsdXNoZWQuXG4gICAgICovXG4gICAgZmx1c2goKSB7XG4gICAgICAgIC8vIGNoZWNrIGlmIGEgZmx1c2goKSBvcGVyYXRpb24gaXMgb25nb2luZ1xuICAgICAgICBpZiAodGhpcy5mbHVzaFByb21pc2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmZsdXNoQWdhaW5Qcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyB0aGUgM3JkKyB0aW1lIHdlJ3ZlIGNhbGxlZCBmbHVzaCgpIDogcmV0dXJuIHRoZSBzYW1lIHByb21pc2UuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmx1c2hBZ2FpblByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBxdWV1ZSB1cCBhIGZsdXNoIHRvIG9jY3VyIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwZW5kaW5nIG9uZSBjb21wbGV0ZXMuXG4gICAgICAgICAgICB0aGlzLmZsdXNoQWdhaW5Qcm9taXNlID0gdGhpcy5mbHVzaFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmx1c2goKTtcbiAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZmx1c2hBZ2FpblByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mbHVzaEFnYWluUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGVyZSBpcyBubyBmbHVzaCBwcm9taXNlIG9yIHRoZXJlIHdhcyBidXQgaXQgaGFzIGZpbmlzaGVkLCBzbyBkb1xuICAgICAgICAvLyBhIGJyYW5kIG5ldyBvbmUsIGRlc3Ryb3lpbmcgdGhlIGNoYWluIHdoaWNoIG1heSBoYXZlIGJlZW4gYnVpbHQgdXAuXG4gICAgICAgIHRoaXMuZmx1c2hQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICAgICAgICAgICAgLy8gbm90IGNvbm5lY3RlZCB5ZXQgb3IgdXNlciByZWplY3RlZCBhY2Nlc3MgZm9yIHVzIHRvIHIvdyB0byB0aGUgZGIuXG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIk5vIGNvbm5lY3RlZCBkYXRhYmFzZVwiKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbGluZXMgPSB0aGlzLmxvZ2dlci5mbHVzaCgpO1xuICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0eG4gPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFtcImxvZ3NcIiwgXCJsb2dzbGFzdG1vZFwiXSwgXCJyZWFkd3JpdGVcIik7XG4gICAgICAgICAgICBjb25zdCBvYmpTdG9yZSA9IHR4bi5vYmplY3RTdG9yZShcImxvZ3NcIik7XG4gICAgICAgICAgICB0eG4ub25jb21wbGV0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0eG4ub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIGZsdXNoIGxvZ3MgOiBcIiwgZXZlbnQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihcIkZhaWxlZCB0byB3cml0ZSBsb2dzOiBcIiArIGV2ZW50LnRhcmdldC5lcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgb2JqU3RvcmUuYWRkKHRoaXMuX2dlbmVyYXRlTG9nRW50cnkobGluZXMpKTtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RNb2RTdG9yZSA9IHR4bi5vYmplY3RTdG9yZShcImxvZ3NsYXN0bW9kXCIpO1xuICAgICAgICAgICAgbGFzdE1vZFN0b3JlLnB1dCh0aGlzLl9nZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUoKSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mbHVzaFByb21pc2UgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmx1c2hQcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN1bWUgdGhlIG1vc3QgcmVjZW50IGxvZ3MgYW5kIHJldHVybiB0aGVtLiBPbGRlciBsb2dzIHdoaWNoIGFyZSBub3RcbiAgICAgKiByZXR1cm5lZCBhcmUgZGVsZXRlZCBhdCB0aGUgc2FtZSB0aW1lLCBzbyB0aGlzIGNhbiBiZSBjYWxsZWQgYXQgc3RhcnR1cFxuICAgICAqIHRvIGRvIGhvdXNlLWtlZXBpbmcgdG8ga2VlcCB0aGUgbG9ncyBmcm9tIGdyb3dpbmcgdG9vIGxhcmdlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxPYmplY3RbXT59IFJlc29sdmVzIHRvIGFuIGFycmF5IG9mIG9iamVjdHMuIFRoZSBhcnJheSBpc1xuICAgICAqIHNvcnRlZCBpbiB0aW1lIChvbGRlc3QgZmlyc3QpIGJhc2VkIG9uIHdoZW4gdGhlIGxvZyBmaWxlIHdhcyBjcmVhdGVkICh0aGVcbiAgICAgKiBsb2cgSUQpLiBUaGUgb2JqZWN0cyBoYXZlIHNhaWQgbG9nIElEIGluIGFuIFwiaWRcIiBmaWVsZCBhbmQgXCJsaW5lc1wiIHdoaWNoXG4gICAgICogaXMgYSBiaWcgc3RyaW5nIHdpdGggYWxsIHRoZSBuZXctbGluZSBkZWxpbWl0ZWQgbG9ncy5cbiAgICAgKi9cbiAgICBhc3luYyBjb25zdW1lKCkge1xuICAgICAgICBjb25zdCBkYiA9IHRoaXMuZGI7XG5cbiAgICAgICAgLy8gUmV0dXJuczogYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjb25jYXRlbmF0ZWQgbG9ncyBmb3IgdGhpcyBJRC5cbiAgICAgICAgLy8gU3RvcHMgYWRkaW5nIGxvZyBmcmFnbWVudHMgd2hlbiB0aGUgc2l6ZSBleGNlZWRzIG1heFNpemVcbiAgICAgICAgZnVuY3Rpb24gZmV0Y2hMb2dzKGlkLCBtYXhTaXplKSB7XG4gICAgICAgICAgICBjb25zdCBvYmplY3RTdG9yZSA9IGRiLnRyYW5zYWN0aW9uKFwibG9nc1wiLCBcInJlYWRvbmx5XCIpLm9iamVjdFN0b3JlKFwibG9nc1wiKTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IG9iamVjdFN0b3JlLmluZGV4KFwiaWRcIikub3BlbkN1cnNvcihJREJLZXlSYW5nZS5vbmx5KGlkKSwgJ3ByZXYnKTtcbiAgICAgICAgICAgICAgICBsZXQgbGluZXMgPSAnJztcbiAgICAgICAgICAgICAgICBxdWVyeS5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJRdWVyeSBmYWlsZWQ6IFwiICsgZXZlbnQudGFyZ2V0LmVycm9yQ29kZSkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcXVlcnkub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnNvciA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxpbmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZW5kIG9mIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IGN1cnNvci52YWx1ZS5saW5lcyArIGxpbmVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoID49IG1heFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobGluZXMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm5zOiBBIHNvcnRlZCBhcnJheSBvZiBsb2cgSURzLiAobmV3ZXN0IGZpcnN0KVxuICAgICAgICBmdW5jdGlvbiBmZXRjaExvZ0lkcygpIHtcbiAgICAgICAgICAgIC8vIFRvIGdhdGhlciBhbGwgdGhlIGxvZyBJRHMsIHF1ZXJ5IGZvciBhbGwgcmVjb3JkcyBpbiBsb2dzbGFzdG1vZC5cbiAgICAgICAgICAgIGNvbnN0IG8gPSBkYi50cmFuc2FjdGlvbihcImxvZ3NsYXN0bW9kXCIsIFwicmVhZG9ubHlcIikub2JqZWN0U3RvcmUoXG4gICAgICAgICAgICAgICAgXCJsb2dzbGFzdG1vZFwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3RRdWVyeShvLCB1bmRlZmluZWQsIChjdXJzb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpZDogY3Vyc29yLnZhbHVlLmlkLFxuICAgICAgICAgICAgICAgICAgICB0czogY3Vyc29yLnZhbHVlLnRzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTb3J0IElEcyBieSB0aW1lc3RhbXAgKG5ld2VzdCBmaXJzdClcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGIudHMgLSBhLnRzO1xuICAgICAgICAgICAgICAgIH0pLm1hcCgoYSkgPT4gYS5pZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZUxvZ3MoaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHhuID0gZGIudHJhbnNhY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgIFtcImxvZ3NcIiwgXCJsb2dzbGFzdG1vZFwiXSwgXCJyZWFkd3JpdGVcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG8gPSB0eG4ub2JqZWN0U3RvcmUoXCJsb2dzXCIpO1xuICAgICAgICAgICAgICAgIC8vIG9ubHkgbG9hZCB0aGUga2V5IHBhdGgsIG5vdCB0aGUgZGF0YSB3aGljaCBtYXkgYmUgaHVnZVxuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gby5pbmRleChcImlkXCIpLm9wZW5LZXlDdXJzb3IoSURCS2V5UmFuZ2Uub25seShpZCkpO1xuICAgICAgICAgICAgICAgIHF1ZXJ5Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJzb3IgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG8uZGVsZXRlKGN1cnNvci5wcmltYXJ5S2V5KTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0eG4ub25jb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdHhuLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIGRlbGV0ZSBsb2dzIGZvciBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCcke2lkfScgOiAke2V2ZW50LnRhcmdldC5lcnJvckNvZGV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBkZWxldGUgbGFzdCBtb2RpZmllZCBlbnRyaWVzXG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdE1vZFN0b3JlID0gdHhuLm9iamVjdFN0b3JlKFwibG9nc2xhc3Rtb2RcIik7XG4gICAgICAgICAgICAgICAgbGFzdE1vZFN0b3JlLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFsbExvZ0lkcyA9IGF3YWl0IGZldGNoTG9nSWRzKCk7XG4gICAgICAgIGxldCByZW1vdmVMb2dJZHMgPSBbXTtcbiAgICAgICAgY29uc3QgbG9ncyA9IFtdO1xuICAgICAgICBsZXQgc2l6ZSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsTG9nSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IGF3YWl0IGZldGNoTG9ncyhhbGxMb2dJZHNbaV0sIE1BWF9MT0dfU0laRSAtIHNpemUpO1xuXG4gICAgICAgICAgICAvLyBhbHdheXMgYWRkIHRoZSBsb2cgZmlsZTogZmV0Y2hMb2dzIHdpbGwgdHJ1bmNhdGUgb25jZSB0aGUgbWF4U2l6ZSB3ZSBnaXZlIGl0IGlzXG4gICAgICAgICAgICAvLyBleGNlZWRlZCwgc28gd2UnbGwgZ28gb3ZlciB0aGUgbWF4IGJ1dCBvbmx5IGJ5IG9uZSBmcmFnbWVudCdzIHdvcnRoLlxuICAgICAgICAgICAgbG9ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBsaW5lczogbGluZXMsXG4gICAgICAgICAgICAgICAgaWQ6IGFsbExvZ0lkc1tpXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2l6ZSArPSBsaW5lcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIElmIGZldGNoTG9ncyB0cnVuY2F0ZWQgd2UnbGwgbm93IGJlIGF0IG9yIG92ZXIgdGhlIHNpemUgbGltaXQsXG4gICAgICAgICAgICAvLyBpbiB3aGljaCBjYXNlIHdlIHNob3VsZCBzdG9wIGFuZCByZW1vdmUgdGhlIHJlc3Qgb2YgdGhlIGxvZyBmaWxlcy5cbiAgICAgICAgICAgIGlmIChzaXplID49IE1BWF9MT0dfU0laRSkge1xuICAgICAgICAgICAgICAgIC8vIHRoZSByZW1haW5pbmcgbG9nIElEcyBzaG91bGQgYmUgcmVtb3ZlZC4gSWYgd2UgZ28gb3V0IG9mXG4gICAgICAgICAgICAgICAgLy8gYm91bmRzIHRoaXMgaXMganVzdCBbXVxuICAgICAgICAgICAgICAgIHJlbW92ZUxvZ0lkcyA9IGFsbExvZ0lkcy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbW92ZUxvZ0lkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbW92aW5nIGxvZ3M6IFwiLCByZW1vdmVMb2dJZHMpO1xuICAgICAgICAgICAgLy8gRG9uJ3QgYXdhaXQgdGhpcyBiZWNhdXNlIGl0J3Mgbm9uLWZhdGFsIGlmIHdlIGNhbid0IGNsZWFuIHVwXG4gICAgICAgICAgICAvLyBsb2dzLlxuICAgICAgICAgICAgUHJvbWlzZS5hbGwocmVtb3ZlTG9nSWRzLm1hcCgoaWQpID0+IGRlbGV0ZUxvZ3MoaWQpKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlbW92ZWQgJHtyZW1vdmVMb2dJZHMubGVuZ3RofSBvbGQgbG9ncy5gKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG9ncztcbiAgICB9XG5cbiAgICBfZ2VuZXJhdGVMb2dFbnRyeShsaW5lcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICBsaW5lczogbGluZXMsXG4gICAgICAgICAgICBpbmRleDogdGhpcy5pbmRleCsrLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9nZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgICAgIHRzOiBEYXRlLm5vdygpLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgbWV0aG9kIHRvIGNvbGxlY3QgcmVzdWx0cyBmcm9tIGEgQ3Vyc29yIGFuZCBwcm9taXNlaWZ5IGl0LlxuICogQHBhcmFtIHtPYmplY3RTdG9yZXxJbmRleH0gc3RvcmUgVGhlIHN0b3JlIHRvIHBlcmZvcm0gb3BlbkN1cnNvciBvbi5cbiAqIEBwYXJhbSB7SURCS2V5UmFuZ2U9fSBrZXlSYW5nZSBPcHRpb25hbCBrZXkgcmFuZ2UgdG8gYXBwbHkgb24gdGhlIGN1cnNvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc3VsdE1hcHBlciBBIGZ1bmN0aW9uIHdoaWNoIGlzIHJlcGVhdGVkbHkgY2FsbGVkIHdpdGggYVxuICogQ3Vyc29yLlxuICogUmV0dXJuIHRoZSBkYXRhIHlvdSB3YW50IHRvIGtlZXAuXG4gKiBAcmV0dXJuIHtQcm9taXNlPFRbXT59IFJlc29sdmVzIHRvIGFuIGFycmF5IG9mIHdoYXRldmVyIHlvdSByZXR1cm5lZCBmcm9tXG4gKiByZXN1bHRNYXBwZXIuXG4gKi9cbmZ1bmN0aW9uIHNlbGVjdFF1ZXJ5KHN0b3JlLCBrZXlSYW5nZSwgcmVzdWx0TWFwcGVyKSB7XG4gICAgY29uc3QgcXVlcnkgPSBzdG9yZS5vcGVuQ3Vyc29yKGtleVJhbmdlKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIHF1ZXJ5Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJRdWVyeSBmYWlsZWQ6IFwiICsgZXZlbnQudGFyZ2V0LmVycm9yQ29kZSkpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBjb2xsZWN0IHJlc3VsdHNcbiAgICAgICAgcXVlcnkub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJzb3IgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZW5kIG9mIHJlc3VsdHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHRNYXBwZXIoY3Vyc29yKSk7XG4gICAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmUgcmFnZSBzaGFraW5nIHN1cHBvcnQgZm9yIHNlbmRpbmcgYnVnIHJlcG9ydHMuXG4gKiBNb2RpZmllcyBnbG9iYWxzLlxuICogQHJldHVybiB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBzZXQgdXAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xuICAgIGlmIChnbG9iYWwubXhfcmFnZV9pbml0UHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gZ2xvYmFsLm14X3JhZ2VfaW5pdFByb21pc2U7XG4gICAgfVxuICAgIGdsb2JhbC5teF9yYWdlX2xvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKCk7XG4gICAgZ2xvYmFsLm14X3JhZ2VfbG9nZ2VyLm1vbmtleVBhdGNoKHdpbmRvdy5jb25zb2xlKTtcblxuICAgIC8vIGp1c3QgKmFjY2Vzc2luZyogaW5kZXhlZERCIHRocm93cyBhbiBleGNlcHRpb24gaW4gZmlyZWZveCB3aXRoXG4gICAgLy8gaW5kZXhlZGRiIGRpc2FibGVkLlxuICAgIGxldCBpbmRleGVkREI7XG4gICAgdHJ5IHtcbiAgICAgICAgaW5kZXhlZERCID0gd2luZG93LmluZGV4ZWREQjtcbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgaWYgKGluZGV4ZWREQikge1xuICAgICAgICBnbG9iYWwubXhfcmFnZV9zdG9yZSA9IG5ldyBJbmRleGVkREJMb2dTdG9yZShpbmRleGVkREIsIGdsb2JhbC5teF9yYWdlX2xvZ2dlcik7XG4gICAgICAgIGdsb2JhbC5teF9yYWdlX2luaXRQcm9taXNlID0gZ2xvYmFsLm14X3JhZ2Vfc3RvcmUuY29ubmVjdCgpO1xuICAgICAgICByZXR1cm4gZ2xvYmFsLm14X3JhZ2VfaW5pdFByb21pc2U7XG4gICAgfVxuICAgIGdsb2JhbC5teF9yYWdlX2luaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGdsb2JhbC5teF9yYWdlX2luaXRQcm9taXNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgaWYgKCFnbG9iYWwubXhfcmFnZV9zdG9yZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdsb2JhbC5teF9yYWdlX3N0b3JlLmZsdXNoKCk7XG59XG5cbi8qKlxuICogQ2xlYW4gdXAgb2xkIGxvZ3MuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyBpZiBjbGVhbmVkIGxvZ3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgIGlmICghZ2xvYmFsLm14X3JhZ2Vfc3RvcmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBnbG9iYWwubXhfcmFnZV9zdG9yZS5jb25zdW1lKCk7XG59XG5cbi8qKlxuICogR2V0IGEgcmVjZW50IHNuYXBzaG90IG9mIHRoZSBsb2dzLCByZWFkeSBmb3IgYXR0YWNoaW5nIHRvIGEgYnVnIHJlcG9ydFxuICpcbiAqIEByZXR1cm4ge0FycmF5PHtsaW5lczogc3RyaW5nLCBpZCwgc3RyaW5nfT59ICBsaXN0IG9mIGxvZyBkYXRhXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRMb2dzRm9yUmVwb3J0KCkge1xuICAgIGlmICghZ2xvYmFsLm14X3JhZ2VfbG9nZ2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIFwiTm8gY29uc29sZSBsb2dnZXIsIGRpZCB5b3UgZm9yZ2V0IHRvIGNhbGwgaW5pdCgpP1wiLFxuICAgICAgICApO1xuICAgIH1cbiAgICAvLyBJZiBpbiBpbmNvZ25pdG8gbW9kZSwgc3RvcmUgaXMgbnVsbCwgYnV0IHdlIHN0aWxsIHdhbnQgYnVnIHJlcG9ydFxuICAgIC8vIHNlbmRpbmcgdG8gd29yayBnb2luZyBvZmYgdGhlIGluLW1lbW9yeSBjb25zb2xlIGxvZ3MuXG4gICAgaWYgKGdsb2JhbC5teF9yYWdlX3N0b3JlKSB7XG4gICAgICAgIC8vIGZsdXNoIG1vc3QgcmVjZW50IGxvZ3NcbiAgICAgICAgYXdhaXQgZ2xvYmFsLm14X3JhZ2Vfc3RvcmUuZmx1c2goKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGdsb2JhbC5teF9yYWdlX3N0b3JlLmNvbnN1bWUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIGxpbmVzOiBnbG9iYWwubXhfcmFnZV9sb2dnZXIuZmx1c2godHJ1ZSksXG4gICAgICAgICAgICBpZDogXCItXCIsXG4gICAgICAgIH1dO1xuICAgIH1cbn1cbiJdfQ==