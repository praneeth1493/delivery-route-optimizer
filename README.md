# 🚚 Delivery Route Optimizer

A full-stack AI-powered logistics dashboard that solves the **Travelling Salesman Problem (TSP)** using the **Nearest Neighbor** heuristic with real-world geographic distances. Built with Flask, OpenAI, Leaflet.js, and a premium dark UI.

---

## 🌐 Live Demo

> Deploy on Render → [See Deployment Guide](#-deployment)

---

## ✨ Features

- 🗺️ **Interactive Dark Map** — Leaflet.js with CARTO dark tiles and animated route drawing
- 🤖 **AI Logistics Assistant** — Describe your delivery in plain English, AI selects locations and vehicle
- ✨ **AI Route Insights** — GPT-powered strategic analysis after every optimization
- 📍 **15 Predefined Delivery Nodes** — Chandigarh/Punjab region with warehouse, pickup, and drop points
- 🚗 **Vehicle Selection** — Bike, Van, Pickup, Truck with fuel cost calculation
- 📊 **Analytics Modal** — Distance comparison chart, efficiency score, fuel saved
- 🔴 **Live Traffic Simulation** — Animated traffic flow on key roads
- 📖 **Swagger / OpenAPI Docs** — Full API documentation at `/apidocs`
- 🔒 **Secure** — `.env` based API key management, never committed to git

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.x, Flask |
| AI | OpenAI GPT-4o-mini |
| API Docs | Flasgger (Swagger UI) |
| Frontend | HTML5, CSS3, Vanilla JS (ES6+) |
| Map | Leaflet.js + OpenStreetMap (CARTO Dark) |
| Charts | Chart.js |
| Distance | Haversine Formula |
| Algorithm | Nearest Neighbor (TSP Heuristic) |
| Deployment | Render + Gunicorn |

---

## 📁 Project Structure

```
delivery-route-optimizer/
├── app.py                  # Flask app — all routes and OpenAPI config
├── requirements.txt        # Python dependencies
├── Procfile                # Gunicorn start command for Render
├── render.yaml             # Render deployment config
├── .env                    # API keys (not committed)
├── .gitignore
├── src/
│   ├── optimizer.py        # Nearest Neighbor TSP algorithm
│   └── distance.py         # Haversine distance formula
├── templates/
│   └── index.html          # Main dashboard UI
└── static/
    ├── css/style.css        # Premium dark theme
    └── js/script.js         # Map, AI chat, charts, animations
```

---

## 🚀 Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/praneeth1493/delivery-route-optimizer.git
cd delivery-route-optimizer
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Add your OpenAI API key
Create a `.env` file in the project root:
```
OPENAI_API_KEY=sk-your-key-here
```

### 4. Run the app
```bash
python app.py
```

### 5. Open in browser
| URL | Description |
|-----|-------------|
| `http://127.0.0.1:5000` | Main dashboard |
| `http://127.0.0.1:5000/apidocs` | Swagger API docs |

---

## 📡 API Reference

All endpoints are documented interactively at `/apidocs`.

### `GET /api/health`
Returns service health status.
```json
{ "status": "ok", "version": "1.0.0" }
```

### `GET /api/locations`
Returns all 15 predefined delivery nodes. Supports query filters:
- `?type=warehouse|pickup|delivery`
- `?priority=High|Medium|Low`

```json
{
  "count": 15,
  "locations": [
    { "id": 1, "name": "Central Logistics Hub", "coords": [30.7333, 76.7794], "type": "warehouse", "priority": "High" }
  ]
}
```

### `POST /api/optimize`
Optimizes a delivery route using the Nearest Neighbor algorithm.

**Request:**
```json
{
  "locations": [
    [30.7333, 76.7794],
    [30.7400, 76.7800],
    [30.7421, 76.8188]
  ]
}
```

**Response:**
```json
{
  "route": [[30.7333, 76.7794], [30.7400, 76.7800], ...],
  "route_names": ["Location 1", "Location 2", ...],
  "distance": 11.90
}
```

### `POST /api/chat-route`
AI-powered natural language to route extraction.

**Request:**
```json
{
  "prompt": "Send a truck to Elante Mall and Rose Garden",
  "available_locations": [{ "name": "Elante Mall" }, ...]
}
```

**Response:**
```json
{
  "locations": ["Central Logistics Hub", "Elante Mall", "Rose Garden"],
  "vehicle": "truck"
}
```

### `POST /api/analyze-route`
Returns a GPT-generated strategic insight for a completed route.

**Request:**
```json
{ "distance": 18.5, "timeMins": 40, "vehicle": "Van", "stops": 5 }
```

**Response:**
```json
{ "insight": "The Van route covers 18.5 km across 5 stops efficiently..." }
```

---

## ☁️ Deployment

### Deploy on Render (Free)

1. Push code to GitHub (already done)
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo: `praneeth1493/delivery-route-optimizer`
4. Render auto-detects settings from `render.yaml`
5. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-your-key-here`
6. Click **Deploy**

Your app will be live at `https://delivery-route-optimizer.onrender.com`

---

## 🧠 Algorithm

### Nearest Neighbor (TSP Heuristic)
1. Start at the **warehouse** (first location)
2. Find the **nearest unvisited** node using Haversine distance
3. Move to it and mark as visited
4. Repeat until all nodes are visited
5. Return to warehouse to complete the cycle

While not guaranteed to find the absolute shortest path, it runs in **O(n²)** time and produces good results for practical logistics scenarios.

### Haversine Formula
Calculates the great-circle distance between two GPS coordinates on Earth's surface — far more accurate than Euclidean distance for real-world routing.

---

## 📄 License

MIT License — free to use, modify, and distribute.
