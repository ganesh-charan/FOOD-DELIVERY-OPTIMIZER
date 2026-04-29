import crypto from "crypto";

const orders = [
  {
    id: crypto.randomUUID(),
    name: "Alice Smith",
    phone: "1234567890",
    location: "2",
    items: [{ id: "m1", qty: 2 }, { id: "m3", qty: 1 }],
    status: "Placed",
    estimatedDeliveryTime: Date.now() + 2 * 60000,
    routing: { assigned: "pending", distance: 0, path: [] }
  },
  {
    id: crypto.randomUUID(),
    name: "Bob Jones",
    phone: "0987654321",
    location: "4",
    items: [{ id: "m2", qty: 1 }, { id: "m5", qty: 3 }],
    status: "Accepted",
    estimatedDeliveryTime: Date.now() + 4 * 60000,
    routing: { assigned: "guy1", distance: 15, path: [0, 1, 2, 4] }
  },
  {
    id: crypto.randomUUID(),
    name: "Charlie Brown",
    phone: "5551234567",
    location: "7",
    items: [{ id: "m4", qty: 2 }],
    status: "Preparing",
    estimatedDeliveryTime: Date.now() + 7 * 60000,
    routing: { assigned: "guy2", distance: 12, path: [0, 6, 5, 7] }
  },
  {
    id: crypto.randomUUID(),
    name: "Diana Prince",
    phone: "4449876543",
    location: "9",
    items: [{ id: "m1", qty: 1 }, { id: "m2", qty: 1 }],
    status: "Ready",
    estimatedDeliveryTime: Date.now() + 9 * 60000,
    routing: { assigned: "guy1", distance: 10, path: [0, 3, 9] }
  },
  {
    id: crypto.randomUUID(),
    name: "Evan Wright",
    phone: "9998887777",
    location: "8",
    items: [{ id: "m3", qty: 2 }],
    status: "Waiting",
    estimatedDeliveryTime: Date.now() + 8 * 60000,
    routing: { assigned: "pending", distance: 0, path: [] }
  }
];
export function enqueueOrder(orderObj) {
  orders.push(orderObj); // add at end (FIFO)
}

export function dequeueOrder() {
  return orders.shift(); // remove from front
}

export function getQueue() {
  return orders;
}
