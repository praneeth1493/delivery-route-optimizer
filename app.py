from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flasgger import Swagger
import sys
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from functools import wraps

load_dotenv()
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Add the src directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from optimizer import find_nearest_neighbor_route
from distance import haversine_distance

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# ─────────────────────────────────────────────
# Flask-Login Setup
# ─────────────────────────────────────────────
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth_page'

# Simple in-memory user store (replace with database in production)
users_db = {
    'demo@routeoptimizer.com': {
        'id': '1',
        'name': 'Demo User',
        'email': 'demo@routeoptimizer.com',
        'password': generate_password_hash('Demo@1234')
    }
}

class User(UserMixin):
    def __init__(self, id, name, email):
        self.id = id
        self.name = name
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    for email, data in users_db.items():
        if data['id'] == user_id:
            return User(data['id'], data['name'], data['email'])
    return None

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
    # ── CHANDIGARH / TRICITY HUB ──────────────────────────────────────────
    {"id": 1,  "name": "Central Logistics Hub (Chandigarh)", "coords": [30.7333, 76.7794], "priority": "High",   "type": "warehouse"},
    {"id": 2,  "name": "Sector 17 Market, Chandigarh",       "coords": [30.7400, 76.7800], "priority": "Medium", "type": "delivery"},
    {"id": 3,  "name": "Elante Mall, Chandigarh",            "coords": [30.7061, 76.8011], "priority": "High",   "type": "pickup"},
    {"id": 4,  "name": "Chandigarh IT Park, Chandigarh",     "coords": [30.7258, 76.8453], "priority": "High",   "type": "pickup"},
    {"id": 5,  "name": "Sector 43 Bus Stand, Chandigarh",    "coords": [30.7125, 76.7410], "priority": "High",   "type": "pickup"},
    {"id": 6,  "name": "Industrial Area Phase 2, Chandigarh","coords": [30.6950, 76.7950], "priority": "High",   "type": "pickup"},
    {"id": 7,  "name": "Mohali Cricket Stadium, Mohali",     "coords": [30.6908, 76.7371], "priority": "Medium", "type": "pickup"},
    {"id": 8,  "name": "Mohali IT City, Mohali",             "coords": [30.7046, 76.7179], "priority": "High",   "type": "pickup"},
    {"id": 9,  "name": "Phase 8 Industrial, Mohali",         "coords": [30.6780, 76.7280], "priority": "High",   "type": "pickup"},
    {"id": 10, "name": "Zirakpur Market, Zirakpur",          "coords": [30.6425, 76.8175], "priority": "Medium", "type": "delivery"},
    {"id": 11, "name": "Derabassi Logistics Hub, Derabassi", "coords": [30.5900, 76.8400], "priority": "High",   "type": "pickup"},
    {"id": 12, "name": "Kharar Bus Stand, Kharar",           "coords": [30.7483, 76.6413], "priority": "Medium", "type": "delivery"},
    {"id": 13, "name": "Panchkula Sector 5, Panchkula",      "coords": [30.6942, 76.8497], "priority": "Medium", "type": "delivery"},

    # ── LUDHIANA ──────────────────────────────────────────────────────────
    {"id": 14, "name": "Ludhiana Railway Station",           "coords": [30.9010, 75.8573], "priority": "High",   "type": "pickup"},
    {"id": 15, "name": "Ludhiana Clock Tower Market",        "coords": [30.9000, 75.8500], "priority": "High",   "type": "delivery"},
    {"id": 16, "name": "Focal Point Industrial, Ludhiana",   "coords": [30.8700, 75.8200], "priority": "High",   "type": "pickup"},
    {"id": 17, "name": "Sahnewal Airport, Ludhiana",         "coords": [30.8547, 75.9560], "priority": "Medium", "type": "pickup"},
    {"id": 18, "name": "Gill Road Warehouse, Ludhiana",      "coords": [30.8800, 75.8900], "priority": "High",   "type": "pickup"},
    {"id": 19, "name": "Pakhowal Road Market, Ludhiana",     "coords": [30.8950, 75.8650], "priority": "Medium", "type": "delivery"},
    {"id": 20, "name": "Doraha Logistics, Ludhiana",         "coords": [30.7950, 76.0300], "priority": "Medium", "type": "pickup"},

    # ── AMRITSAR ──────────────────────────────────────────────────────────
    {"id": 21, "name": "Golden Temple, Amritsar",            "coords": [31.6200, 74.8765], "priority": "High",   "type": "delivery"},
    {"id": 22, "name": "Amritsar Railway Station",           "coords": [31.6340, 74.8723], "priority": "High",   "type": "pickup"},
    {"id": 23, "name": "Sri Guru Ram Dass Airport, Amritsar","coords": [31.7096, 74.7973], "priority": "High",   "type": "pickup"},
    {"id": 24, "name": "Hall Bazaar, Amritsar",              "coords": [31.6180, 74.8780], "priority": "Medium", "type": "delivery"},
    {"id": 25, "name": "Industrial Area B, Amritsar",        "coords": [31.6500, 74.8300], "priority": "High",   "type": "pickup"},
    {"id": 26, "name": "Majitha Road Warehouse, Amritsar",   "coords": [31.6700, 74.9100], "priority": "Medium", "type": "pickup"},

    # ── JALANDHAR ─────────────────────────────────────────────────────────
    {"id": 27, "name": "Jalandhar City Railway Station",     "coords": [31.3260, 75.5762], "priority": "High",   "type": "pickup"},
    {"id": 28, "name": "Jalandhar Bus Stand",                "coords": [31.3200, 75.5800], "priority": "High",   "type": "delivery"},
    {"id": 29, "name": "Focal Point Industrial, Jalandhar",  "coords": [31.3500, 75.6200], "priority": "High",   "type": "pickup"},
    {"id": 30, "name": "Nakodar Road Market, Jalandhar",     "coords": [31.3000, 75.6100], "priority": "Medium", "type": "delivery"},
    {"id": 31, "name": "Phagwara Gate, Jalandhar",           "coords": [31.3400, 75.5600], "priority": "Medium", "type": "delivery"},
    {"id": 32, "name": "Leather Complex, Jalandhar",         "coords": [31.3600, 75.5900], "priority": "High",   "type": "pickup"},

    # ── PATIALA ───────────────────────────────────────────────────────────
    {"id": 33, "name": "Patiala Railway Station",            "coords": [30.3398, 76.3869], "priority": "High",   "type": "pickup"},
    {"id": 34, "name": "Patiala Bus Stand",                  "coords": [30.3350, 76.3900], "priority": "High",   "type": "delivery"},
    {"id": 35, "name": "Sirhind Road Industrial, Patiala",   "coords": [30.3600, 76.4200], "priority": "High",   "type": "pickup"},
    {"id": 36, "name": "Leela Bhawan Market, Patiala",       "coords": [30.3300, 76.3800], "priority": "Medium", "type": "delivery"},
    {"id": 37, "name": "Rajpura Logistics Hub, Rajpura",     "coords": [30.4800, 76.5900], "priority": "High",   "type": "pickup"},

    # ── BATHINDA ──────────────────────────────────────────────────────────
    {"id": 38, "name": "Bathinda Railway Station",           "coords": [30.2110, 74.9455], "priority": "High",   "type": "pickup"},
    {"id": 39, "name": "Bathinda Bus Stand",                 "coords": [30.2100, 74.9500], "priority": "High",   "type": "delivery"},
    {"id": 40, "name": "HPCL Refinery, Bathinda",            "coords": [30.1800, 74.9200], "priority": "High",   "type": "pickup"},
    {"id": 41, "name": "Bathinda Industrial Area",           "coords": [30.2300, 74.9700], "priority": "High",   "type": "pickup"},
    {"id": 42, "name": "Goniana Road Market, Bathinda",      "coords": [30.2000, 74.9600], "priority": "Medium", "type": "delivery"},

    # ── PHAGWARA / KAPURTHALA ─────────────────────────────────────────────
    {"id": 43, "name": "Phagwara Bus Stand",                 "coords": [31.2200, 75.7700], "priority": "High",   "type": "delivery"},
    {"id": 44, "name": "Phagwara Industrial Area",           "coords": [31.2300, 75.7900], "priority": "High",   "type": "pickup"},
    {"id": 45, "name": "Kapurthala Railway Station",         "coords": [31.3800, 75.3800], "priority": "Medium", "type": "pickup"},
    {"id": 46, "name": "Kapurthala Market",                  "coords": [31.3750, 75.3850], "priority": "Medium", "type": "delivery"},

    # ── HOSHIARPUR / NAWANSHAHR ───────────────────────────────────────────
    {"id": 47, "name": "Hoshiarpur Bus Stand",               "coords": [31.5300, 75.9100], "priority": "Medium", "type": "delivery"},
    {"id": 48, "name": "Hoshiarpur Industrial Area",         "coords": [31.5400, 75.9300], "priority": "High",   "type": "pickup"},
    {"id": 49, "name": "Nawanshahr Market",                  "coords": [31.1200, 76.1200], "priority": "Medium", "type": "delivery"},
    {"id": 50, "name": "Banga Logistics, Nawanshahr",        "coords": [31.1900, 76.0100], "priority": "Medium", "type": "pickup"},

    # ── GURDASPUR / PATHANKOT ─────────────────────────────────────────────
    {"id": 51, "name": "Gurdaspur Bus Stand",                "coords": [32.0400, 75.4100], "priority": "Medium", "type": "delivery"},
    {"id": 52, "name": "Pathankot Railway Station",          "coords": [32.2700, 75.6500], "priority": "High",   "type": "pickup"},
    {"id": 53, "name": "Pathankot Bus Stand",                "coords": [32.2650, 75.6520], "priority": "High",   "type": "delivery"},
    {"id": 54, "name": "Pathankot Industrial Area",          "coords": [32.2800, 75.6700], "priority": "High",   "type": "pickup"},

    # ── FIROZPUR / FAZILKA ────────────────────────────────────────────────
    {"id": 55, "name": "Firozpur Cantonment",                "coords": [30.9300, 74.6100], "priority": "Medium", "type": "delivery"},
    {"id": 56, "name": "Firozpur City Market",               "coords": [30.9200, 74.6000], "priority": "Medium", "type": "delivery"},
    {"id": 57, "name": "Fazilka Bus Stand",                  "coords": [30.4000, 74.0300], "priority": "Medium", "type": "delivery"},
    {"id": 58, "name": "Abohar Market",                      "coords": [30.1400, 74.1900], "priority": "Medium", "type": "delivery"},

    # ── SANGRUR / BARNALA ─────────────────────────────────────────────────
    {"id": 59, "name": "Sangrur Bus Stand",                  "coords": [30.2500, 75.8400], "priority": "Medium", "type": "delivery"},
    {"id": 60, "name": "Sangrur Industrial Area",            "coords": [30.2600, 75.8600], "priority": "High",   "type": "pickup"},
    {"id": 61, "name": "Barnala Bus Stand",                  "coords": [30.3800, 75.5500], "priority": "Medium", "type": "delivery"},
    {"id": 62, "name": "Barnala Grain Market",               "coords": [30.3750, 75.5450], "priority": "High",   "type": "pickup"},

    # ── MOGA / FARIDKOT ───────────────────────────────────────────────────
    {"id": 63, "name": "Moga Bus Stand",                     "coords": [30.8200, 75.1700], "priority": "Medium", "type": "delivery"},
    {"id": 64, "name": "Moga Industrial Area",               "coords": [30.8300, 75.1900], "priority": "High",   "type": "pickup"},
    {"id": 65, "name": "Faridkot Bus Stand",                 "coords": [30.6700, 74.7600], "priority": "Medium", "type": "delivery"},
    {"id": 66, "name": "Faridkot Grain Market",              "coords": [30.6650, 74.7550], "priority": "High",   "type": "pickup"},

    # ── MUKTSAR / MALOUT ──────────────────────────────────────────────────
    {"id": 67, "name": "Sri Muktsar Sahib Bus Stand",        "coords": [30.4800, 74.5200], "priority": "Medium", "type": "delivery"},
    {"id": 68, "name": "Malout Market",                      "coords": [30.2000, 74.4800], "priority": "Medium", "type": "delivery"},

    # ── ROPAR / MORINDA ───────────────────────────────────────────────────
    {"id": 69, "name": "Ropar Bus Stand",                    "coords": [30.9700, 76.5200], "priority": "Medium", "type": "delivery"},
    {"id": 70, "name": "Ropar Industrial Area",              "coords": [30.9800, 76.5400], "priority": "High",   "type": "pickup"},
    {"id": 71, "name": "Morinda Market",                     "coords": [30.7900, 76.4900], "priority": "Medium", "type": "delivery"},
    {"id": 72, "name": "Anandpur Sahib",                     "coords": [31.2400, 76.5000], "priority": "Low",    "type": "delivery"},

    # ── FATEHGARH SAHIB / SIRHIND ─────────────────────────────────────────
    {"id": 73, "name": "Fatehgarh Sahib Bus Stand",          "coords": [30.6500, 76.3900], "priority": "Medium", "type": "delivery"},
    {"id": 74, "name": "Sirhind Industrial Area",            "coords": [30.6300, 76.3800], "priority": "High",   "type": "pickup"},
    {"id": 75, "name": "Mandi Gobindgarh Steel Market",      "coords": [30.6700, 76.3100], "priority": "High",   "type": "pickup"},

    # ── TARN TARAN / GOINDWAL ─────────────────────────────────────────────
    {"id": 76, "name": "Tarn Taran Bus Stand",               "coords": [31.4500, 74.9300], "priority": "Medium", "type": "delivery"},
    {"id": 77, "name": "Goindwal Sahib",                     "coords": [31.6300, 75.1200], "priority": "Low",    "type": "delivery"},

    # ── NANGAL / UNA BORDER ───────────────────────────────────────────────
    {"id": 78, "name": "Nangal Township",                    "coords": [31.4900, 76.3700], "priority": "Medium", "type": "delivery"},
    {"id": 79, "name": "Rupnagar Grain Market",              "coords": [30.9650, 76.5250], "priority": "High",   "type": "pickup"},

    # ── MAJOR HIGHWAY JUNCTIONS ───────────────────────────────────────────
    {"id": 80, "name": "Doraha NH-44 Junction",              "coords": [30.7950, 76.0300], "priority": "High",   "type": "pickup"},
    {"id": 81, "name": "Khanna Grain Market",                "coords": [30.7050, 76.2200], "priority": "High",   "type": "pickup"},
    {"id": 82, "name": "Samrala Market",                     "coords": [30.8400, 76.1900], "priority": "Medium", "type": "delivery"},
    {"id": 83, "name": "Phillaur Bridge Junction",           "coords": [31.0200, 75.7900], "priority": "Medium", "type": "delivery"},
    {"id": 84, "name": "Nakodar Market",                     "coords": [31.1300, 75.4700], "priority": "Medium", "type": "delivery"},
    {"id": 85, "name": "Sultanpur Lodhi",                    "coords": [31.2100, 75.1900], "priority": "Low",    "type": "delivery"},
]


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route('/')
@login_required
def index():
    """Render the main dashboard UI."""
    return render_template('index.html', user=current_user)


# ─────────────────────────────────────────────
# Authentication Routes
# ─────────────────────────────────────────────

@app.route('/auth')
def auth_page():
    """Render the authentication page."""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('auth.html')


@app.route('/auth/login', methods=['POST'])
def login():
    """Handle user login."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    remember = data.get('remember', False)

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user_data = users_db.get(email)
    if not user_data or not check_password_hash(user_data['password'], password):
        return jsonify({"error": "Invalid email or password."}), 401

    user = User(user_data['id'], user_data['name'], user_data['email'])
    login_user(user, remember=remember)
    return jsonify({"success": True, "message": "Login successful"})


@app.route('/auth/register', methods=['POST'])
def register():
    """Handle user registration."""
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({"error": "All fields are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if email in users_db:
        return jsonify({"error": "Email already registered."}), 400

    # Create new user
    user_id = str(len(users_db) + 1)
    users_db[email] = {
        'id': user_id,
        'name': name,
        'email': email,
        'password': generate_password_hash(password)
    }

    # Auto-login after registration
    user = User(user_id, name, email)
    login_user(user)
    return jsonify({"success": True, "message": "Registration successful"})


@app.route('/auth/logout')
@login_required
def logout():
    """Handle user logout."""
    logout_user()
    return redirect(url_for('auth_page'))


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
