// src/queue.js
const orders = [];

export function enqueueOrder(orderObj) {
  orders.push(orderObj); // add at end (FIFO)
}

export function dequeueOrder() {
  return orders.shift(); // remove from front
}

export function getQueue() {
  return orders;
}
