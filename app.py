from flask import Flask, render_template, request, jsonify
from flasgger import Swagger
import sys
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Add the src directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from optimizer import find_nearest_neighbor_route
from distance import haversine_distance

app = Flask(__name__)

# ─────────────────────────────────────────────
# OpenAPI / Swagger configuration
# ─────────────────────────────────────────────
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs",
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Delivery Route Optimizer API",
        "description": (
            "REST API for the Delivery Route Optimizer.\n\n"
            "Uses the **Nearest Neighbor** heuristic to solve the Travelling Salesman Problem (TSP) "
            "over real-world geographic coordinates using the **Haversine** distance formula.\n\n"
            "### Quick start\n"
            "1. `GET /api/locations` — fetch all available delivery nodes\n"
            "2. `POST /api/optimize` — submit selected coordinates and receive the optimised route\n"
            "3. `GET /api/health` — service health check"
        ),
        "version": "1.0.0",
        "contact": {
            "name": "Route Optimizer",
        },
        "license": {
            "name": "MIT",
        },
    },
    "basePath": "/",
    "schemes": ["http", "https"],
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "tags": [
        {"name": "Route", "description": "Route optimisation operations"},
        {"name": "Locations", "description": "Predefined delivery node catalogue"},
        {"name": "System", "description": "Health and status checks"},
    ],
    "definitions": {
        "Coordinate": {
            "type": "array",
            "items": {"type": "number", "format": "float"},
            "minItems": 2,
            "maxItems": 2,
            "example": [30.7333, 76.7794],
            "description": "[latitude, longitude]",
        },
        "OptimizeRequest": {
            "type": "object",
            "required": ["locations"],
            "properties": {
                "locations": {
                    "type": "array",
                    "items": {"$ref": "#/definitions/Coordinate"},
                    "minItems": 2,
                    "description": "Ordered list of [lat, lng] pairs. First item is treated as the warehouse.",
                    "example": [
                        [30.7333, 76.7794],
                        [30.7400, 76.7800],
                        [30.7421, 76.8188],
                    ],
                }
            },
        },
        "OptimizeResponse": {
            "type": "object",
            "properties": {
                "route": {
                    "type": "array",
                    "items": {"$ref": "#/definitions/Coordinate"},
                    "description": "Optimised sequence of coordinates (returns to start).",
                },
                "route_names": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Human-readable label for each stop.",
                },
                "distance": {
                    "type": "number",
                    "format": "float",
                    "description": "Total route distance in kilometres.",
                    "example": 18.43,
                },
            },
        },
        "Location": {
            "type": "object",
            "properties": {
                "id":       {"type": "integer", "example": 1},
                "name":     {"type": "string",  "example": "Central Logistics Hub"},
                "coords":   {"$ref": "#/definitions/Coordinate"},
                "type":     {"type": "string",  "enum": ["warehouse", "pickup", "delivery"], "example": "warehouse"},
                "priority": {"type": "string",  "enum": ["High", "Medium", "Low"], "example": "High"},
            },
        },
        "HealthResponse": {
            "type": "object",
            "properties": {
                "status":  {"type": "string", "example": "ok"},
                "version": {"type": "string", "example": "1.0.0"},
            },
        },
        "ErrorResponse": {
            "type": "object",
            "properties": {
                "error": {"type": "string", "example": "Please select at least two locations for optimization."}
            },
        },
    },
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

# ─────────────────────────────────────────────
# Predefined delivery nodes (mirrors frontend)
# ─────────────────────────────────────────────
PREDEFINED_LOCATIONS = [
    {"id": 1,  "name": "Central Logistics Hub",   "coords": [30.7333, 76.7794], "priority": "High",   "type": "warehouse"},
    {"id": 2,  "name": "Sector 17 Market",         "coords": [30.7400, 76.7800], "priority": "Medium", "type": "delivery"},
    {"id": 3,  "name": "Sukhna Lake",              "coords": [30.7421, 76.8188], "priority": "High",   "type": "pickup"},
    {"id": 4,  "name": "Rock Garden",              "coords": [30.7525, 76.8011], "priority": "Low",    "type": "delivery"},
    {"id": 5,  "name": "Mohali Cricket Stadium",   "coords": [30.6908, 76.7371], "priority": "Medium", "type": "pickup"},
    {"id": 6,  "name": "Elante Mall",              "coords": [30.7061, 76.8011], "priority": "High",   "type": "pickup"},
    {"id": 7,  "name": "Rose Garden",              "coords": [30.7461, 76.7820], "priority": "Low",    "type": "delivery"},
    {"id": 8,  "name": "Panjab University",        "coords": [30.7594, 76.7686], "priority": "Medium", "type": "delivery"},
    {"id": 9,  "name": "Chandigarh IT Park",       "coords": [30.7258, 76.8453], "priority": "High",   "type": "pickup"},
    {"id": 10, "name": "Zirakpur Crossing",        "coords": [30.6425, 76.8175], "priority": "Medium", "type": "delivery"},
    {"id": 11, "name": "Panchkula Sector 5",       "coords": [30.6942, 76.8497], "priority": "Medium", "type": "delivery"},
    {"id": 12, "name": "Sector 43 Bus Stand",      "coords": [30.7125, 76.7410], "priority": "High",   "type": "pickup"},
    {"id": 13, "name": "Industrial Area Phase 2",  "coords": [30.6950, 76.7950], "priority": "High",   "type": "pickup"},
    {"id": 14, "name": "Kharar Highway Junction",  "coords": [30.7483, 76.6413], "priority": "Low",    "type": "delivery"},
    {"id": 15, "name": "Derabassi Logistics Hub",  "coords": [30.5900, 76.8400], "priority": "High",   "type": "pickup"},
]


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route('/')
def index():
    """Render the main dashboard UI."""
    return render_template('index.html')


@app.route('/api/health', methods=['GET'])
def health():
    """
    Service health check.
    ---
    tags:
      - System
    summary: Health check
    description: Returns the current health status of the API service.
    responses:
      200:
        description: Service is healthy.
        schema:
          $ref: '#/definitions/HealthResponse'
    """
    return jsonify({"status": "ok", "version": "1.0.0"})


@app.route('/api/locations', methods=['GET'])
def get_locations():
    """
    Retrieve all predefined delivery nodes.
    ---
    tags:
      - Locations
    summary: List delivery nodes
    description: >
      Returns the full catalogue of predefined delivery nodes including
      the central warehouse, pickup points, and drop-off locations.
    parameters:
      - name: type
        in: query
        type: string
        required: false
        enum: [warehouse, pickup, delivery]
        description: Filter nodes by type.
      - name: priority
        in: query
        type: string
        required: false
        enum: [High, Medium, Low]
        description: Filter nodes by priority level.
    responses:
      200:
        description: List of delivery nodes.
        schema:
          type: object
          properties:
            count:
              type: integer
              example: 15
            locations:
              type: array
              items:
                $ref: '#/definitions/Location'
    """
    type_filter     = request.args.get('type')
    priority_filter = request.args.get('priority')

    results = PREDEFINED_LOCATIONS

    if type_filter:
        results = [l for l in results if l['type'] == type_filter]
    if priority_filter:
        results = [l for l in results if l['priority'] == priority_filter]

    return jsonify({"count": len(results), "locations": results})


@app.route('/api/optimize', methods=['POST'])
def optimize_route_api():
    """
    Optimise a delivery route using the Nearest Neighbor algorithm.
    ---
    tags:
      - Route
    summary: Optimise route
    description: >
      Accepts an ordered list of geographic coordinates and returns the
      optimised visitation sequence together with the total travel distance
      (in km) calculated via the Haversine formula.


      The **first coordinate** in the request is always treated as the
      warehouse / starting point and the route will return to it at the end.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          $ref: '#/definitions/OptimizeRequest'
    responses:
      200:
        description: Optimised route computed successfully.
        schema:
          $ref: '#/definitions/OptimizeResponse'
      400:
        description: Invalid input — fewer than two locations provided.
        schema:
          $ref: '#/definitions/ErrorResponse'
      500:
        description: Internal server error during optimisation.
        schema:
          $ref: '#/definitions/ErrorResponse'
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    locations_data = data.get('locations')

    if not locations_data or len(locations_data) < 2:
        return jsonify({"error": "Please select at least two locations for optimization."}), 400

    formatted_locations = [
        {"name": f"Location {i + 1}", "coords": coords}
        for i, coords in enumerate(locations_data)
    ]

    try:
        optimized_route, total_distance = find_nearest_neighbor_route(formatted_locations)
    except Exception as e:
        return jsonify({"error": f"Optimisation failed: {str(e)}"}), 500

    route_coords = [loc['coords'] for loc in optimized_route]
    route_names = [loc['name'] for loc in optimized_route]
    return jsonify({
        "route": route_coords,
        "route_names": route_names,
        "distance": round(total_distance, 2)
    })

@app.route('/api/chat-route', methods=['POST'])
def chat_route():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        available_locations = data.get('available_locations', [])
        
        system_prompt = f"""You are an AI logistics assistant. The user will give you a delivery request in natural language.
        Extract the locations they want to visit from the following available list:
        {json.dumps([loc['name'] for loc in available_locations])}
        
        Also extract the vehicle type they want to use. Valid vehicle types are: 'bike', 'van', 'pickup', 'truck'. If not specified, default to 'van'.
        
        Respond ONLY with a valid JSON object in this format:
        {{"locations": ["Location Name 1", "Location Name 2"], "vehicle": "van"}}
        Make sure to always include "Central Logistics Hub" as the first location if it's not mentioned.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        result = json.loads(response.choices[0].message.content)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-route', methods=['POST'])
def analyze_route():
    try:
        data = request.get_json()
        
        system_prompt = "You are an expert logistics analyst. Given the following route stats, write a concise 1-2 sentence strategic insight for the dispatcher. Mention the distance, fuel savings, and vehicle type. Keep it professional and direct."
        
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(data)}
            ]
        )
        
        insight = response.choices[0].message.content.strip()
        return jsonify({"insight": insight})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Keep the old /optimize route for backward compatibility with the frontend
@app.route('/optimize', methods=['POST'])
def optimize_route():
    """Legacy route — proxies to /api/optimize (not shown in docs)."""
    return optimize_route_api()


if __name__ == '__main__':
    app.run(debug=True)
