function addToQueue(queue, item) {
    // item: { teamId, name, timestamp, clientTimestamp }
    queue.push(item);
    // Sort by server timestamp (ascending - earliest first)
    queue.sort((a, b) => a.timestamp - b.timestamp);
}

function getSortedQueue(queue) {
    return [...queue].sort((a, b) => a.timestamp - b.timestamp);
}

module.exports = { addToQueue, getSortedQueue };
