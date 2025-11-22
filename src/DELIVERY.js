export let guy1= 0;
export let guy2= 6;

export function updatePositions(assigned, customerLocation) {
    if (assigned === "Guy1") guy1 = customerLocation;
    else guy2 = customerLocation;
}
