# Delivery Route Optimizer

A production-quality, full-stack web application designed to solve the **Travelling Salesman Problem (TSP)** using the **Nearest Neighbor** heuristic. This tool helps businesses optimize delivery routes by finding the shortest path between multiple geographic coordinates.

## 🚀 Features

- **Modern Glassmorphism UI**: A clean, dark-themed dashboard built with vanilla CSS (Flexbox & Grid).
- **Interactive Map**: Powered by **Leaflet.js** and **OpenStreetMap** (CARTO Dark tiles).
- **Real-world Distance**: Uses the **Haversine formula** to calculate accurate great-circle distances between coordinates.
- **Efficient Optimization**: Implements the Nearest Neighbor algorithm for fast and reliable route planning.
- **Dynamic Route Visualization**: Animated, progressive segment-by-segment route drawing on the map.
- **Responsive Design**: Optimized for modern laptop and desktop screens.
- **State Management**: Robust frontend state handling for marker selection and route updates.

## 🛠️ Tech Stack

- **Backend**: Python 3.x, Flask (Modular Architecture)
- **Frontend**: HTML5, CSS3 (Advanced transitions/animations), Vanilla JavaScript (ES6+)
- **Map Engine**: Leaflet.js
- **Numerical Processing**: NumPy (for distance calculations)

## 📐 Architecture & Logic

### 1. Problem Statement: Travelling Salesman Problem (TSP)
The TSP asks: "Given a list of locations and the distances between each pair, what is the shortest possible route that visits each location exactly once and returns to the origin?" This is an NP-hard problem, meaning finding the absolute optimal solution becomes computationally expensive as the number of locations grows.

### 2. Algorithm: Nearest Neighbor
To provide a fast and scalable solution, this application uses the **Nearest Neighbor** heuristic:
1. Start at the "Warehouse" (the first selected location).
2. Find the nearest unvisited location from the current position.
3. Visit that location and mark it as visited.
4. Repeat until all selected locations are visited.
5. Return to the starting warehouse to complete the cycle.

### 3. Distance Calculation: Haversine Formula
Unlike Euclidean distance (which assumes a flat surface), the Haversine formula calculates the shortest distance between two points on the surface of a sphere (Earth), given their longitudes and latitudes.

## 📦 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/delivery-route-optimizer.git
   cd delivery-route-optimizer
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask application:**
   ```bash
   python app.py
   ```

4. **Open in browser:**
   Navigate to `http://127.0.0.1:5000`

## 🖥️ Usage

1. **Select Locations**: Click on the custom-styled markers in the Chandigarh/Punjab region.
2. **Review Selection**: The side panel will update dynamically with your selected stops.
3. **Optimize**: Click the "Optimize Route" button in the floating control panel.
4. **Visualize**: Watch the route animate progressively on the map and view the total distance in the details panel.
5. **Reset**: Use the "Reset" button to clear all selections and start over.

---
*Built with ❤️ for efficient logistics.*
