import express from "express";
import { MENU } from "./menu.js";
import crypto from "crypto";
import { enqueueOrder, dequeueOrder, getQueue } from "./queue.js";
import { spawn } from "child_process";
import { 
    guy1, 
    guy2, 
    updatePositions,
    setDeliveryInProgress,
    isDeliveryGuyAvailable,
    getDeliveryGuyPosition
} from "./DELIVERY.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

const port = 3000;

// NAV BAR ROUTES
app.get("/", (req, res) => res.render("home"));
app.get("/home", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("nav-bar/about"));
app.get("/contact", (req, res) => res.render("nav-bar/contact"));
app.get("/team", (req, res) => res.render("nav-bar/team"));

// OPERATIONS ROUTES
app.get("/restaurant", (req, res) => res.render("operations/restaurant", {
    menu: MENU,
    queue: getQueue()
}));
app.get("/delivery", (req, res) => res.render("operations/delivery", {
    queue: getQueue(),
    menu: MENU,
    guy1Status: guy1.status,
    guy2Status: guy2.status
}));

app.get("/customer", (req, res) => {
    res.render("operations/customer", {
        menu: MENU,
        queue: getQueue()
    });
});

// ORDER SUBMISSION - WITH DELIVERY GUY AVAILABILITY CHECK
app.post("/customer/add", (req, res) => {
    const order = req.body;
    order.status = "Placed";
    order.id = crypto.randomUUID();
    const customerLocation = parseInt(order.location);
    order.estimatedDeliveryTime = Date.now() + customerLocation * 1000 * 60; // in ms
    
    // ✅ FIX: Get current positions from delivery guy objects
    const guy1Position = getDeliveryGuyPosition("guy1");
    const guy2Position = getDeliveryGuyPosition("guy2");
    const guy1Available = isDeliveryGuyAvailable("guy1");
    const guy2Available = isDeliveryGuyAvailable("guy2");
    
    console.log(`📍 Current Status - Guy1: pos=${guy1Position}, available=${guy1Available} | Guy2: pos=${guy2Position}, available=${guy2Available}`);
    
    // If both are busy, queue the order without calculating route yet
    if (!guy1Available && !guy2Available) {
        order.status = "Waiting";
        order.routing = { assigned: "pending", distance: 0, path: [] };
        enqueueOrder(order);
        return res.status(202).send({ 
            message: "Both delivery guys are busy. Order queued and will be assigned when available.", 
            status: "waiting" 
        });
    }
    
    // Get positions for C++ program
    const guy1Args = guy1Available ? guy1Position.toString() : "-1";  // -1 means unavailable
    const guy2Args = guy2Available ? guy2Position.toString() : "-1";
    
    const child = spawn(path.join(__dirname, "delivery.exe"), [
        customerLocation.toString(),
        guy1Args,
        guy2Args
    ]);
    
    let output = "";

    child.stdout.on("data", (chunk) => {
        output += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
        console.error("❌ C++ Error:", chunk.toString());
    });

    child.on("close", (code) => {
        try {
            const routing = JSON.parse(output);
            routing.assigned = routing.assigned.toLowerCase();  // ✅ Convert to lowercase
            
            // ✅ Check if assignment is valid
            if (routing.assigned === "pending" || !isDeliveryGuyAvailable(routing.assigned)) {
                order.status = "Waiting";
                order.routing = { assigned: "pending", distance: routing.distance, path: routing.path };
                enqueueOrder(order);
                return res.status(202).send({ 
                    message: "Delivery guys became busy. Order queued.", 
                    status: "waiting" 
                });
            }
            
            order.routing = routing;
            order.status = "Assigned";
            
            // ✅ Mark delivery guy as in_delivery
            setDeliveryInProgress(routing.assigned, order.id, customerLocation);
            
            enqueueOrder(order);
            
            console.log(`✅ Order ${order.id} assigned to ${routing.assigned}, Distance: ${routing.distance}`);
            res.status(200).send({ message: "Order placed successfully!", orderId: order.id });
        } catch (err) {
            console.error("❌ Parse error:", err);
            res.status(500).send({ message: "Error processing order" });
        }
    });
});

//restaurant updating order status
app.post("/restaurant/update", (req, res) => {
    const { id, newStatus } = req.body;

    const order = getQueue().find(o => o.id === id);

    if (!order) {
        return res.json({ success: false, message: "Order not found" });
    }

    order.status = newStatus;
    console.log(`📦 Order ${id} status updated to: ${newStatus}`);

    res.json({ success: true, message: "Updated" });
});

// ✅ NEW: Check if delivery guy can take new assignment
app.get("/delivery/status", (req, res) => {
    res.json({
        guy1: {
            position: guy1.position,
            status: guy1.status,
            currentOrderId: guy1.currentOrderId
        },
        guy2: {
            position: guy2.position,
            status: guy2.status,
            currentOrderId: guy2.currentOrderId
        }
    });
});

// ✅ NEW: Get all waiting orders (not yet assigned)
app.get("/delivery/waiting-orders", (req, res) => {
    const waitingOrders = getQueue().filter(order => 
        order.status === "Waiting" && order.routing.assigned === "pending"
    );
    res.json(waitingOrders);
});

// Delivery completing order - GET FIRST UNDELIVERED ORDER FOR GUY
app.get("/delivery/orders", (req, res) => {
    const guy = req.query.guy;
    
    // ✅ FIX: Filter by assignment AND ensure guy is marked as in_delivery
    const result = getQueue().filter(order =>
        order.routing.assigned === guy &&
        (order.status === "Assigned" || order.status === "Ready")
    );

    // Give only the first order so the rest wait
    if (result.length > 0) {
        console.log(`📋 Fetching order for ${guy}: ${result[0].id}`);
        res.json([result[0]]);
    } else {
        console.log(`📋 No orders ready for ${guy}`);
        res.json([]);
    }
});

// ✅ IMPROVED: Delivery marks order as delivered with position update
app.post("/delivery/delivered", (req, res) => {
    const { id } = req.body;
    const order = getQueue().find(o => o.id === id);
    
    if (!order) {
        return res.json({ success: false, message: "Order not found" });
    }
    
    if (!order.routing.assigned) {
        return res.json({ success: false, message: "Order not assigned to any delivery guy" });
    }
    
    // ✅ Update delivery guy position AND mark as idle
    const deliveryLocation = parseInt(order.location);
    updatePositions(order.routing.assigned, deliveryLocation);
    
    order.status = "Delivered";
    order.deliveredAt = new Date();
    
    console.log(`✅ Order ${id} marked as delivered by ${order.routing.assigned} at location ${deliveryLocation}`);
    
    res.json({ success: true, message: "Order delivered successfully" });
});


// SERVER
app.listen(port, () => {
    console.log(`🚀 http://localhost:${port}`);
});
