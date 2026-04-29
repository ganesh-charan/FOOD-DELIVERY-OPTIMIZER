#include <iostream>
#include <vector>
#include <queue>
#include <climits>
#include <string>
#include <algorithm>
using namespace std;

// ----------------------------------------------
// Basic structure for Dijkstra result
// ----------------------------------------------
struct DijkstraResult {
    vector<int> distance;   // shortest distance from start to each place
    vector<int> parent;     // to reconstruct path
};

// ----------------------------------------------
// Create YOUR city graph with 10 places
// ----------------------------------------------
vector<vector<pair<int,int>>> buildCityGraph() {
    vector<vector<pair<int,int>>> graph(10);

    // Helper function to add a bidirectional road
    auto addRoad = [&](int a, int b, int w) {
        graph[a].push_back({b, w});
        graph[b].push_back({a, w});
    };

    // Using your default road map:
    addRoad(0, 1, 5);   // Restaurant - Mall
    addRoad(1, 2, 7);   // Mall - IT Park
    addRoad(0, 3, 9);   // Restaurant - Railway Station
    addRoad(3, 9, 6);   // Railway Station - Bus Stand
    addRoad(9, 8, 4);   // Bus Stand - Stadium
    addRoad(8, 4, 10);  // Stadium - Airport
    addRoad(0, 6, 3);   // Restaurant - Hospital
    addRoad(6, 5, 4);   // Hospital - University
    addRoad(5, 7, 8);   // University - Old Town

    return graph;
}

// ----------------------------------------------
// Dijkstra’s Algorithm 
// ----------------------------------------------
DijkstraResult dijkstra(const vector<vector<pair<int,int>>>& graph, int start) {

    int n = graph.size();

    vector<int> distance(n, INT_MAX);
    vector<int> parent(n, -1);

    distance[start] = 0;

    // Min-heap (priority queue) to pick the shortest distance place
    priority_queue<
        pair<int,int>,
        vector<pair<int,int>>,
        greater<pair<int,int>>
    > pq;

    pq.push({0, start}); // {distance, node}

    while (!pq.empty()) {
        int dist = pq.top().first;
        int node = pq.top().second;
        pq.pop();

        if (dist > distance[node])
            continue;

        // Check all neighbours (connected places)
        for (auto neighbour : graph[node]) {
            int nextNode = neighbour.first;
            int roadWeight = neighbour.second;

            // Relaxation step
            if (distance[node] + roadWeight < distance[nextNode]) {
                distance[nextNode] = distance[node] + roadWeight;
                parent[nextNode] = node;
                pq.push({distance[nextNode], nextNode});
            }
        }
    }

    return { distance, parent };
}

// ----------------------------------------------
// Reconstruct path from parent array
// ----------------------------------------------
vector<int> buildPath(int target, const vector<int>& parent) {

    vector<int> path;

    int current = target;
    while (current != -1) {
        path.push_back(current);
        current = parent[current];
    }

    reverse(path.begin(), path.end());
    return path;
}

// ----------------------------------------------
// MAIN PROGRAM
// ----------------------------------------------
int main(int argc, char* argv[]) {

    if (argc < 4) {
        cerr << "You must pass 3 arguments: customerPlace guy1Place guy2Place\n";
        return 1;
    }

    int customerPlace = stoi(argv[1]);
    int guy1Place     = stoi(argv[2]);
    int guy2Place     = stoi(argv[3]);

    vector<vector<pair<int,int>>> graph = buildCityGraph();

    // ✅ Check availability: -1 means delivery guy is busy/unavailable
    bool guy1Available = guy1Place != -1;
    bool guy2Available = guy2Place != -1;
    
    // If both are unavailable, return pending
    if (!guy1Available && !guy2Available) {
        cout << "{";
        cout << "\"assigned\":\"pending\",";
        cout << "\"distance\":999999,";
        cout << "\"path\":[]";
        cout << "}";
        return 0;
    }
    
    // If only one is available, assign to that one
    if (!guy1Available) {
        // Only Guy 2 available
        DijkstraResult d2ToRest = dijkstra(graph, guy2Place);
        DijkstraResult restToCust = dijkstra(graph, 0);
        
        int dist2 = d2ToRest.distance[0] + restToCust.distance[customerPlace];
        vector<int> p1 = buildPath(0, d2ToRest.parent);
        vector<int> p2 = buildPath(customerPlace, restToCust.parent);
        
        vector<int> finalPath = p1;
        for (int i = 1; i < p2.size(); i++) {
            finalPath.push_back(p2[i]);
        }
        
        cout << "{";
        cout << "\"assigned\":\"Guy2\",";
        cout << "\"distance\":" << dist2 << ",";
        cout << "\"path\":[";
        for (int i = 0; i < finalPath.size(); i++) {
            cout << finalPath[i];
            if (i < finalPath.size() - 1) cout << ",";
        }
        cout << "]";
        cout << "}";
        return 0;
    }
    
    if (!guy2Available) {
        // Only Guy 1 available
        DijkstraResult d1ToRest = dijkstra(graph, guy1Place);
        DijkstraResult restToCust = dijkstra(graph, 0);
        
        int dist1 = d1ToRest.distance[0] + restToCust.distance[customerPlace];
        vector<int> p1 = buildPath(0, d1ToRest.parent);
        vector<int> p2 = buildPath(customerPlace, restToCust.parent);
        
        vector<int> finalPath = p1;
        for (int i = 1; i < p2.size(); i++) {
            finalPath.push_back(p2[i]);
        }
        
        cout << "{";
        cout << "\"assigned\":\"Guy1\",";
        cout << "\"distance\":" << dist1 << ",";
        cout << "\"path\":[";
        for (int i = 0; i < finalPath.size(); i++) {
            cout << finalPath[i];
            if (i < finalPath.size() - 1) cout << ",";
        }
        cout << "]";
        cout << "}";
        return 0;
    }

    // ✅ Both available - choose nearest using Dijkstra
    DijkstraResult d1ToRest = dijkstra(graph, guy1Place);
    DijkstraResult d2ToRest = dijkstra(graph, guy2Place);
    DijkstraResult restToCust = dijkstra(graph, 0);

    // Total distances via restaurant
    int dist1 = d1ToRest.distance[0] + restToCust.distance[customerPlace];
    int dist2 = d2ToRest.distance[0] + restToCust.distance[customerPlace];

    string assignedGuy;
    vector<int> finalPath;
    int finalDistance;

    if (dist1 <= dist2) {
        assignedGuy = "Guy1";
        finalDistance = dist1;
        vector<int> p1 = buildPath(0, d1ToRest.parent);
        vector<int> p2 = buildPath(customerPlace, restToCust.parent);
        
        finalPath = p1;
        for (int i = 1; i < p2.size(); i++) {
            finalPath.push_back(p2[i]);
        }
    } else {
        assignedGuy = "Guy2";
        finalDistance = dist2;
        vector<int> p1 = buildPath(0, d2ToRest.parent);
        vector<int> p2 = buildPath(customerPlace, restToCust.parent);
        
        finalPath = p1;
        for (int i = 1; i < p2.size(); i++) {
            finalPath.push_back(p2[i]);
        }
    }

    // Output JSON for Node.js
    cout << "{";
    cout << "\"assigned\":\"" << assignedGuy << "\",";
    cout << "\"distance\":" << finalDistance << ",";
    cout << "\"path\":[";

    for (int i = 0; i < finalPath.size(); i++) {
        cout << finalPath[i];
        if (i < finalPath.size() - 1)
            cout << ",";
    }

    cout << "]";
    cout << "}";
}
