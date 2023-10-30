"use strict";

const MinHeap = require("./min-heap");

module.exports = (logSources, printer) => {
  // Create a min heap to store log entries
  const minHeap = new MinHeap();

  // Initialize the min heap with the first log entry from each source
  for (const source of logSources) {
    const log = source.pop();
    if (log) {
      minHeap.add({ log, source });
    }
  }

  // Continue processing until the min heap is empty
  while (!minHeap.isEmpty()) {
    // Extract the earliest log entry from the min heap
    const { log, source } = minHeap.remove();

    // Print the earliest log entry
    printer.print(log);

    if (!source.drained) {
      const nextLog = source.pop();

      // Insert the next log entry into the min heap if it exists
      if (nextLog) {
        minHeap.add({ log: nextLog, source });
      }
    }
  }

  printer.done();

  console.log("Sync sort complete.");
};
