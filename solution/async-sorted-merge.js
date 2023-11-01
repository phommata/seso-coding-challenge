"use strict";

const MinHeap = require("./min-heap");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = async (logSources, printer) => {
  const minHeap = new MinHeap();
  const concurrencyLimit = 10; // Adjust the concurrency limit as needed.

  // Create an array to track active promises
  const activePromises = [];

  // Function to pop log entries from a source and add to the minHeap
  async function popAndAddToHeap(source) {
    while (true) {
      const log = await source.popAsync();
      if (log === false) {
        return;
      }
      minHeap.add({ entry: log, source });
    }
  }

  // Start pop operations for log sources
  for (const source of logSources) {
    for (let i = 0; i < concurrencyLimit; i++) {
      const promise = popAndAddToHeap(source);
      activePromises.push(promise);
    }
  }

  try {
    // Wait for all pop operations to complete
    await Promise.all(activePromises);

    // Function to process the next entry
    function processNextEntry() {
      if (minHeap.isEmpty()) {
        printer.done();
        console.log("Async sort complete.");
        return;
      }

      const { log, source } = minHeap.remove();

      // Print the earliest log entry
      printer.print(log);

      // Fetch and insert the next log entry from the same source
      popAndAddToHeap(source)
        .then(processNextEntry)
        .catch(console.error); // Handle errors as needed
    }

    // Start processing the log entries
    processNextEntry();
  } catch (error) {
    console.error("Error while popping log entries:", error);
  }
};
