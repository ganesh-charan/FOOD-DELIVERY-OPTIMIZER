// Delivery Guy State Management System
export let guy1 = {
    position: 0,           // Current location (restaurant)
    status: "idle",        // "idle" or "in_delivery"
    currentOrderId: null,  // Order being delivered
    lastDeliveryLocation: 0
};

export let guy2 = {
    position: 0,           // Current location (restaurant)
    status: "idle",        // "idle" or "in_delivery"
    currentOrderId: null,  // Order being delivered
    lastDeliveryLocation: 0
};

/**
 * Get delivery guy object by name
 */
export function getDeliveryGuy(assignedGuyName) {
    const name = assignedGuyName.toLowerCase();
    return name === "guy1" ? guy1 : guy2;
}

/**
 * Set delivery guy as "in_delivery" when order is assigned
 */
export function setDeliveryInProgress(assignedGuyName, orderId, customerLocation) {
    const guy = getDeliveryGuy(assignedGuyName);
    guy.status = "in_delivery";
    guy.currentOrderId = orderId;
    guy.position = 0;  // Start from restaurant (0)
    console.log(`✓ ${assignedGuyName} started delivery to location ${customerLocation} for order ${orderId}`);
}

/**
 * Mark delivery complete and update position
 */
export function updatePositions(assignedGuyName, customerLocation) {
    const name = assignedGuyName.toLowerCase();  // FIX: Convert to lowercase
    const guy = getDeliveryGuy(name);
    
    guy.position = customerLocation;              // Update position
    guy.lastDeliveryLocation = customerLocation;  // Track last delivery
    guy.status = "idle";                          // Mark as available
    guy.currentOrderId = null;                    // Clear order reference
    
    console.log(`✓ ${name} delivered to location ${customerLocation}. Now idle at location ${customerLocation}`);
}

/**
 * Check if delivery guy is available for new assignment
 */
export function isDeliveryGuyAvailable(assignedGuyName) {
    const guy = getDeliveryGuy(assignedGuyName);
    return guy.status === "idle";
}

/**
 * Get delivery guy's current position
 */
export function getDeliveryGuyPosition(assignedGuyName) {
    const guy = getDeliveryGuy(assignedGuyName);
    return guy.position;
}
