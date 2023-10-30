"use strict";

const MinHeap = require("./min-heap");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  return new Promise((resolve, reject) => {
    const minHeap = new MinHeap();

    // Initial population of the min heap
    Promise.all(logSources.map((source) => source.popAsync())).then(logs => {
      logs.forEach(log => minHeap.add({ entry: log, source }));
    })
      .catch(reject);

    function processNextEntry() {
      if (minHeap.isEmpty()) {
        printer.done();
        resolve(console.log("Async sort complete."));
        return;
      }

      const { log, source } = minHeap.remove();

      // Print the earliest log entry
      printer.print(log);

      // Fetch and insert the next log entry from the same source
      source
        .popAsync()
        .then(log => {
          if (log !== false) {
            minHeap.add({ log, source });
          }
          processNextEntry();
        })
        .catch(reject);
    }

    // Start processing the log entries
    processNextEntry();
  });
};
