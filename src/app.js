import express from "express";
import { MENU } from "./menu.js";
import crypto from "crypto";
import { enqueueOrder, dequeueOrder, getQueue } from "./queue.js";
import { spawn } from "child_process";
import { guy1, guy2, updatePositions } from "./DELIVERY.js";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

const port = 3000;

// NAV BAR ROUTES
app.get("/", (req, res) => res.render("home"));
app.get("/home", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("nav-bar/about"));
app.get("/contact", (req, res) => res.render("nav-bar/contact"));
app.get("/team", (req, res) => res.render("nav-bar/team"));

// OPERATIONS ROUTES
app.get("/restaurant", (req, res) => res.render("operations/restaurant",{
    menu: MENU,
    queue: getQueue()
}));
app.get("/delivery", (req, res) => res.render("operations/delivery",{
    queue: getQueue(),
    menu: MENU
}));

app.get("/customer", (req, res) => {
    res.render("operations/customer", {
        menu: MENU,
        queue: getQueue()
    });
});

// ORDER SUBMISSION
app.post("/customer/add", (req, res) => {
    const order = req.body; // FIXED
    order.status = "Placed";
    order.id = crypto.randomUUID();
    const customerLocation = parseInt(order.location);
    order.estimatedDeliveryTime = Date.now() + customerLocation * 1000 * 60; // in ms
    const child=spawn("./src/delivery.exe",
        [customerLocation.toString()
        ,guy1.toString(),
        guy2.toString()]
    );
    let output="";


    child.stdout.on("data",(chunk)=>{
         output+=chunk.toString();
    });


    child.stderr.on("data",(chunk)=>{
        console.error("Error:",chunk.toString());
    });


    child.on("close",(code)=>{

    const routing=JSON.parse(output);
    routing.assigned = routing.assigned.toLowerCase(); 

    updatePositions(routing.assigned, customerLocation);

    order.routing=routing;

    enqueueOrder(order);

    res.status(200).send({ message: "Order placed successfully!" });

        console.log(`Child process exited with code ${code}`);
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

    res.json({ success: true, message: "Updated" });
});
// Delivery completing order
app.get("/delivery/orders", (req, res) => {
    const guy = req.query.guy;

    const result = getQueue().filter(order => 
        order.routing.assigned === guy && 
        order.status === "Ready"
    );

    res.json(result);
});


// SERVER
app.listen(port, () => {
    console.log(`server is active at ${port}`);
});
