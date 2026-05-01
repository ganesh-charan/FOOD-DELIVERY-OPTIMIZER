# Food Delivery Optimizer

A web-based food delivery management system that handles customer orders using a queue data structure and assigns deliveries to the nearest available delivery agent using Dijkstra's shortest path algorithm.

## Overview

Customers place orders through a user-friendly interface. Orders are queued and sent to the restaurant. Once prepared, the system calculates the shortest path from the delivery agent's current position to the customer and assigns the nearest available agent.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS (Embedded JavaScript Templates), CSS
- **Algorithm:** Dijkstra's shortest path in C++ (greedy algorithm)
- **Architecture:** MVC pattern with server-side rendering

## Project Structure
food-delivery-optimizer/
├── src/
│   ├── app.js              # Express server and route handlers
│   ├── DELIVERY.js         # Delivery agent state management
│   └── delivery.cpp        # Dijkstra algorithm implementation
├── views/
│   └── operations/
│       ├── customer.ejs    # Customer order interface
│       └── delivery.ejs    # Delivery dashboard
├── public/                 # Static assets (CSS, client-side JS)
├── package.json
└── .gitignore
## How It Works

1. Customer places an order via the web interface.
2. Order is queued and sent to the restaurant.
3. Restaurant prepares the order and marks it ready.
4. System checks availability of delivery agents.
5. Dijkstra's algorithm calculates the shortest path from each available agent's current position to the customer.
6. Nearest available agent is assigned the delivery.
7. Agent's position updates after each successful delivery.

## Features

- Order queue management
- Real-time delivery agent status tracking (idle / in delivery)
- Shortest path calculation using Dijkstra's algorithm (C++ backend)
- Auto-queuing when all agents are busy, with auto-assignment on availability
- Live delivery dashboard with status updates
- Order status tracking: Placed, Waiting, Assigned, Ready, Delivered

## Prerequisites

- Node.js (v18 or above)
- A C++ compiler (g++) to compile `delivery.cpp`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ganesh-charan/FOOD-DELIVERY-OPTIMIZER-ccc-2026.git
cd FOOD-DELIVERY-OPTIMIZER-ccc-2026
```

### 2. Install dependencies

```bash
npm install
```

### 3. Compile the C++ Dijkstra module

On Linux or macOS:

```bash
g++ -o src/delivery src/delivery.cpp
```

On Windows:

```bash
g++ -o src/delivery.exe src/delivery.cpp
```

### 4. Start the server

```bash
node src/app.js
```

The application will be available at http://localhost:3000

## API Endpoints

| Method | Endpoint         | Description                         |
|--------|------------------|-------------------------------------|
| GET    | /                | Home / customer order page          |
| POST   | /order           | Place a new order                   |
| POST   | /deliver         | Mark an order as delivered          |
| GET    | /delivery/status | Get real-time delivery agent status |

### Sample response for /delivery/status

```json
{
  "guy1": {
    "position": 5,
    "status": "in_delivery",
    "currentOrderId": "order-uuid"
  },
  "guy2": {
    "position": 0,
    "status": "idle",
    "currentOrderId": null
  }
}
```

## Algorithm

The C++ program receives the customer's location and the current positions of delivery agents. It runs Dijkstra's algorithm on a weighted graph to determine the shortest distance from each available agent to the customer. Agents marked unavailable are passed as -1 and skipped. The agent with the shortest path is selected for assignment.

## Order Flow
Order placed
└── Agent available?
├── Yes: Run Dijkstra, assign nearest agent
└── No (both busy): Set status to "Waiting"
Auto-assign when agent becomes idle
Order delivered
└── Update agent position to delivery location
└── Set agent status to "idle"
└── Check order queue and auto-assign if pending
## Team

| Roll Number    | Name                      |
|----------------|---------------------------|
| AP24110011704  | V N S Ganesh Charan Paturu |
| AP24110011685  | Yashwanth Dogga           |
| AP24110011724  | Kishor Gunithi            |
| AP24110011729  | Anand Gokul Kota          |
| AP24110011721  | Likhita Reddy R           |
| AP24110011717  | Divya B                   |

## License

ISC
