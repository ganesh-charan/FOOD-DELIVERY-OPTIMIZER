export let guy1= 0;
export let guy2= 6;

export function updatePositions(assigned, customerLocation) {
    if (assigned === "Guy1") guy1Pos = customerLocation;
    else guy2Pos = customerLocation;
}
