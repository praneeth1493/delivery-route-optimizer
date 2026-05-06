/**
 * Delivery Route Optimizer - Logistics Dashboard Edition
 * Advanced UI logic with immersive map, side-by-side controls, and traffic simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const state = {
        map: null,
        markers: [],
        selectedLocations: [],
        currentRouteLine: null,
        predefinedLocations: [
            // ── CHANDIGARH / TRICITY ──
            { id: 1,  name: "Central Logistics Hub (Chandigarh)", coords: [30.7333, 76.7794], priority: 'High',   type: 'warehouse', icon: '🏢' },
            { id: 2,  name: "Sector 17 Market, Chandigarh",       coords: [30.7400, 76.7800], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 3,  name: "Elante Mall, Chandigarh",            coords: [30.7061, 76.8011], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 4,  name: "Chandigarh IT Park, Chandigarh",     coords: [30.7258, 76.8453], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 5,  name: "Sector 43 Bus Stand, Chandigarh",    coords: [30.7125, 76.7410], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 6,  name: "Industrial Area Phase 2, Chandigarh",coords: [30.6950, 76.7950], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 7,  name: "Mohali Cricket Stadium, Mohali",     coords: [30.6908, 76.7371], priority: 'Medium', type: 'pickup',    icon: '📦' },
            { id: 8,  name: "Mohali IT City, Mohali",             coords: [30.7046, 76.7179], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 9,  name: "Phase 8 Industrial, Mohali",         coords: [30.6780, 76.7280], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 10, name: "Zirakpur Market, Zirakpur",          coords: [30.6425, 76.8175], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 11, name: "Derabassi Logistics Hub, Derabassi", coords: [30.5900, 76.8400], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 12, name: "Kharar Bus Stand, Kharar",           coords: [30.7483, 76.6413], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 13, name: "Panchkula Sector 5, Panchkula",      coords: [30.6942, 76.8497], priority: 'Medium', type: 'delivery',  icon: '📍' },
            // ── LUDHIANA ──
            { id: 14, name: "Ludhiana Railway Station",           coords: [30.9010, 75.8573], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 15, name: "Ludhiana Clock Tower Market",        coords: [30.9000, 75.8500], priority: 'High',   type: 'delivery',  icon: '📍' },
            { id: 16, name: "Focal Point Industrial, Ludhiana",   coords: [30.8700, 75.8200], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 17, name: "Sahnewal Airport, Ludhiana",         coords: [30.8547, 75.9560], priority: 'Medium', type: 'pickup',    icon: '📦' },
            { id: 18, name: "Gill Road Warehouse, Ludhiana",      coords: [30.8800, 75.8900], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 19, name: "Pakhowal Road Market, Ludhiana",     coords: [30.8950, 75.8650], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 20, name: "Doraha Logistics, Ludhiana",         coords: [30.7950, 76.0300], priority: 'Medium', type: 'pickup',    icon: '📦' },
            // ── AMRITSAR ──
            { id: 21, name: "Golden Temple, Amritsar",            coords: [31.6200, 74.8765], priority: 'High',   type: 'delivery',  icon: '📍' },
            { id: 22, name: "Amritsar Railway Station",           coords: [31.6340, 74.8723], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 23, name: "Sri Guru Ram Dass Airport, Amritsar",coords: [31.7096, 74.7973], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 24, name: "Hall Bazaar, Amritsar",              coords: [31.6180, 74.8780], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 25, name: "Industrial Area B, Amritsar",        coords: [31.6500, 74.8300], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 26, name: "Majitha Road Warehouse, Amritsar",   coords: [31.6700, 74.9100], priority: 'Medium', type: 'pickup',    icon: '📦' },
            // ── JALANDHAR ──
            { id: 27, name: "Jalandhar City Railway Station",     coords: [31.3260, 75.5762], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 28, name: "Jalandhar Bus Stand",                coords: [31.3200, 75.5800], priority: 'High',   type: 'delivery',  icon: '📍' },
            { id: 29, name: "Focal Point Industrial, Jalandhar",  coords: [31.3500, 75.6200], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 30, name: "Nakodar Road Market, Jalandhar",     coords: [31.3000, 75.6100], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 31, name: "Leather Complex, Jalandhar",         coords: [31.3600, 75.5900], priority: 'High',   type: 'pickup',    icon: '📦' },
            // ── PATIALA ──
            { id: 32, name: "Patiala Railway Station",            coords: [30.3398, 76.3869], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 33, name: "Patiala Bus Stand",                  coords: [30.3350, 76.3900], priority: 'High',   type: 'delivery',  icon: '📍' },
            { id: 34, name: "Sirhind Road Industrial, Patiala",   coords: [30.3600, 76.4200], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 35, name: "Leela Bhawan Market, Patiala",       coords: [30.3300, 76.3800], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 36, name: "Rajpura Logistics Hub, Rajpura",     coords: [30.4800, 76.5900], priority: 'High',   type: 'pickup',    icon: '📦' },
            // ── BATHINDA ──
            { id: 37, name: "Bathinda Railway Station",           coords: [30.2110, 74.9455], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 38, name: "Bathinda Bus Stand",                 coords: [30.2100, 74.9500], priority: 'High',   type: 'delivery',  icon: '📍' },
            { id: 39, name: "HPCL Refinery, Bathinda",            coords: [30.1800, 74.9200], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 40, name: "Bathinda Industrial Area",           coords: [30.2300, 74.9700], priority: 'High',   type: 'pickup',    icon: '📦' },
            // ── PHAGWARA / KAPURTHALA ──
            { id: 41, name: "Phagwara Bus Stand",                 coords: [31.2200, 75.7700], priority: 'High',   type: 'delivery',  icon: '📍' },
            { id: 42, name: "Phagwara Industrial Area",           coords: [31.2300, 75.7900], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 43, name: "Kapurthala Railway Station",         coords: [31.3800, 75.3800], priority: 'Medium', type: 'pickup',    icon: '📦' },
            { id: 44, name: "Kapurthala Market",                  coords: [31.3750, 75.3850], priority: 'Medium', type: 'delivery',  icon: '📍' },
            // ── HOSHIARPUR / NAWANSHAHR ──
            { id: 45, name: "Hoshiarpur Bus Stand",               coords: [31.5300, 75.9100], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 46, name: "Hoshiarpur Industrial Area",         coords: [31.5400, 75.9300], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 47, name: "Nawanshahr Market",                  coords: [31.1200, 76.1200], priority: 'Medium', type: 'delivery',  icon: '📍' },
            // ── GURDASPUR / PATHANKOT ──
            { id: 48, name: "Gurdaspur Bus Stand",                coords: [32.0400, 75.4100], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 49, name: "Pathankot Railway Station",          coords: [32.2700, 75.6500], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 50, name: "Pathankot Industrial Area",          coords: [32.2800, 75.6700], priority: 'High',   type: 'pickup',    icon: '📦' },
            // ── FIROZPUR / FAZILKA ──
            { id: 51, name: "Firozpur City Market",               coords: [30.9200, 74.6000], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 52, name: "Fazilka Bus Stand",                  coords: [30.4000, 74.0300], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 53, name: "Abohar Market",                      coords: [30.1400, 74.1900], priority: 'Medium', type: 'delivery',  icon: '📍' },
            // ── SANGRUR / BARNALA ──
            { id: 54, name: "Sangrur Bus Stand",                  coords: [30.2500, 75.8400], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 55, name: "Sangrur Industrial Area",            coords: [30.2600, 75.8600], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 56, name: "Barnala Bus Stand",                  coords: [30.3800, 75.5500], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 57, name: "Barnala Grain Market",               coords: [30.3750, 75.5450], priority: 'High',   type: 'pickup',    icon: '📦' },
            // ── MOGA / FARIDKOT ──
            { id: 58, name: "Moga Bus Stand",                     coords: [30.8200, 75.1700], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 59, name: "Moga Industrial Area",               coords: [30.8300, 75.1900], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 60, name: "Faridkot Bus Stand",                 coords: [30.6700, 74.7600], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 61, name: "Faridkot Grain Market",              coords: [30.6650, 74.7550], priority: 'High',   type: 'pickup',    icon: '📦' },
            // ── MUKTSAR / MALOUT ──
            { id: 62, name: "Sri Muktsar Sahib Bus Stand",        coords: [30.4800, 74.5200], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 63, name: "Malout Market",                      coords: [30.2000, 74.4800], priority: 'Medium', type: 'delivery',  icon: '📍' },
            // ── ROPAR / MORINDA ──
            { id: 64, name: "Ropar Bus Stand",                    coords: [30.9700, 76.5200], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 65, name: "Ropar Industrial Area",              coords: [30.9800, 76.5400], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 66, name: "Morinda Market",                     coords: [30.7900, 76.4900], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 67, name: "Anandpur Sahib",                     coords: [31.2400, 76.5000], priority: 'Low',    type: 'delivery',  icon: '📍' },
            // ── FATEHGARH SAHIB / SIRHIND ──
            { id: 68, name: "Fatehgarh Sahib Bus Stand",          coords: [30.6500, 76.3900], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 69, name: "Sirhind Industrial Area",            coords: [30.6300, 76.3800], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 70, name: "Mandi Gobindgarh Steel Market",      coords: [30.6700, 76.3100], priority: 'High',   type: 'pickup',    icon: '📦' },
            // ── TARN TARAN ──
            { id: 71, name: "Tarn Taran Bus Stand",               coords: [31.4500, 74.9300], priority: 'Medium', type: 'delivery',  icon: '📍' },
            // ── HIGHWAY JUNCTIONS ──
            { id: 72, name: "Khanna Grain Market",                coords: [30.7050, 76.2200], priority: 'High',   type: 'pickup',    icon: '📦' },
            { id: 73, name: "Samrala Market",                     coords: [30.8400, 76.1900], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 74, name: "Phillaur Bridge Junction",           coords: [31.0200, 75.7900], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 75, name: "Nakodar Market",                     coords: [31.1300, 75.4700], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 76, name: "Sultanpur Lodhi",                    coords: [31.2100, 75.1900], priority: 'Low',    type: 'delivery',  icon: '📍' },
            { id: 77, name: "Nangal Township",                    coords: [31.4900, 76.3700], priority: 'Medium', type: 'delivery',  icon: '📍' },
            { id: 78, name: "Rupnagar Grain Market",              coords: [30.9650, 76.5250], priority: 'High',   type: 'pickup',    icon: '📦' },
        ],
        analytics: {
            distanceChart: null,
            efficiencyChart: null,
            currentData: null
        },
        selectedVehicle: 'bike',
        vehicles: {
            bike: { name: 'Bike', mileage: 40, icon: '🏍️' },
            van: { name: 'Van', mileage: 15, icon: '🚐' },
            pickup: { name: 'Pickup', mileage: 10, icon: '🛻' },
            truck: { name: 'Truck', mileage: 6, icon: '🚛' }
        },
        trafficLayers: []
    };

    // --- DOM Elements ---
    const elements = {
        optimizeBtn: document.getElementById('optimizeBtn'),
        analyticsBtn: document.getElementById('analyticsBtn'),
        resetBtn: document.getElementById('resetBtn'),
        routeList: document.getElementById('routeList'),
        locationsList: document.getElementById('locationsList'),
        totalDistance: document.getElementById('totalDistance'),
        estTime: document.getElementById('estTime'),
        fuelConsumed: document.getElementById('fuelConsumed'),
        fuelCost: document.getElementById('fuelCost'),
        currentVehicle: document.getElementById('currentVehicle'),
        vehicleBtns: document.querySelectorAll('.vehicle-btn'),
        routeStats: document.getElementById('routeStats'),
        statusText: document.getElementById('statusText'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        locationSearch: document.getElementById('locationSearch'),
        analyticsModal: document.getElementById('analyticsModal'),
        closeModal: document.querySelector('.close-modal'),
        aiChatBtn: document.getElementById('aiChatBtn'),
        aiChatInput: document.getElementById('aiChatInput'),
        aiInsightsBox: document.getElementById('aiInsightsBox'),
        aiInsightsText: document.getElementById('aiInsightsText')
    };

    // --- Initialization ---
    const initApp = () => {
        initMap();
        renderMarkers();
        renderLocationsList();
        initSearch();
        initTrafficSimulation();
        initVehicleSelection();
        updateUI();
        
        // Ensure map is correctly sized for the new layout
        setTimeout(() => {
            state.map.invalidateSize();
            updateStatus('System Ready: All Modules Online');
        }, 500);
    };

    const renderLocationsList = () => {
        if (!elements.locationsList) return;

        elements.locationsList.innerHTML = state.predefinedLocations
            .filter(loc => loc.id < 100) // Only show delivery/warehouse nodes
            .map(loc => {
                const isSelected = state.selectedLocations.some(s => s.id === loc.id);
                const badgeClass = loc.type === 'warehouse' ? 'badge-warehouse' : (loc.priority === 'High' ? 'badge-pickup' : 'badge-drop');
                const badgeLabel = loc.type === 'warehouse' ? 'Warehouse' : (loc.priority === 'High' ? 'Pickup' : 'Drop');
                
                return `
                    <div class="location-node-card ${isSelected ? 'selected' : ''}" id="node-card-${loc.id}" onclick="window.toggleNode(${loc.id})">
                        <div class="node-header">
                            <div class="node-title">
                                <span>${loc.icon}</span>
                                <span>${loc.name}</span>
                            </div>
                            <span class="node-badge ${badgeClass}">${badgeLabel}</span>
                        </div>
                        <div class="node-coords">${loc.coords[0].toFixed(4)}, ${loc.coords[1].toFixed(4)}</div>
                        <div class="node-controls">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="priority-indicator priority-${loc.priority.toLowerCase()}" id="indicator-${loc.id}"></div>
                                <select class="priority-select" ononclick="event.stopPropagation()" onchange="window.updateNodePriority(event, ${loc.id})">
                                    <option value="High" ${loc.priority === 'High' ? 'selected' : ''}>High</option>
                                    <option value="Medium" ${loc.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                    <option value="Low" ${loc.priority === 'Low' ? 'selected' : ''}>Low</option>
                                </select>
                            </div>
                            <div class="node-est-time" style="font-size: 0.65rem; color: var(--text-muted);">
                                Est: ~${Math.floor(Math.random() * 15) + 5}m
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
    };

    // Global exposed functions for inline event handlers
    window.toggleNode = (id) => {
        const loc = state.predefinedLocations.find(l => l.id === id);
        if (loc) toggleLocation(loc);
    };

    window.updateNodePriority = (event, id) => {
        event.stopPropagation();
        const newPriority = event.target.value;
        const loc = state.predefinedLocations.find(l => l.id === id);
        if (loc) {
            loc.priority = newPriority;
            const indicator = document.getElementById(`indicator-${id}`);
            if (indicator) {
                indicator.className = `priority-indicator priority-${newPriority.toLowerCase()}`;
            }
            updateStatus(`Priority Updated: ${loc.name} -> ${newPriority}`);
            updateUI(); // Refresh selected list if needed
        }
    };

    const initVehicleSelection = () => {
        elements.vehicleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                state.selectedVehicle = type;
                
                // Update UI
                elements.vehicleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                elements.currentVehicle.textContent = state.vehicles[type].name;
                
                updateStatus(`Vehicle Changed: ${state.vehicles[type].name}`);
                
                // If a route exists, recalculate fuel
                if (state.analytics.currentData) {
                    recalculateFuel(state.analytics.currentData.optimizedDist);
                }
            });
        });
    };

    const recalculateFuel = (distance) => {
        const vehicle = state.vehicles[state.selectedVehicle];
        const fuelUsed = distance / vehicle.mileage;
        const fuelPrice = 100; // INR per liter
        const cost = fuelUsed * fuelPrice;

        elements.fuelConsumed.textContent = `${fuelUsed.toFixed(2)} L`;
        elements.fuelCost.textContent = `₹${cost.toFixed(2)}`;
        
        // Update analytics current data too if needed
        if (state.analytics.currentData) {
            state.analytics.currentData.fuelUsed = fuelUsed;
            state.analytics.currentData.fuelCost = cost;
        }
    };

    const initMap = () => {
        state.map = L.map('map', {
            zoomControl: false,
            center: [31.1471, 75.3412],
            zoom: 8
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            maxZoom: 19
        }).addTo(state.map);

        L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    };

    const renderMarkers = () => {
        state.predefinedLocations.forEach(loc => {
            const extraClass = loc.type === 'warehouse' ? 'warehouse' : '';
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-pin ${extraClass}" id="marker-${loc.id}"><span>${loc.type === 'warehouse' ? '🏢' : '📍'}</span></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });

            const marker = L.marker(loc.coords, { icon: markerIcon })
                .addTo(state.map)
                .bindTooltip(`
                    <div class="custom-tooltip">
                        <strong style="color: ${loc.type === 'warehouse' ? '#b45309' : 'inherit'};">${loc.name}</strong><br>
                        <small>${loc.type.toUpperCase()} NODE</small>
                    </div>
                `, { 
                    direction: 'top',
                    offset: [0, -32]
                });

            marker.on('click', () => toggleLocation(loc));
            
            state.markers.push({ id: loc.id, marker, data: loc });
        });
    };

    const initSearch = () => {
        const autocompleteList = document.getElementById('autocompleteList');
        
        elements.locationSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            autocompleteList.innerHTML = '';
            
            if (!query) {
                autocompleteList.style.display = 'none';
                state.markers.forEach(m => m.marker.setOpacity(1));
                return;
            }

            const matches = state.predefinedLocations.filter(loc => 
                loc.name.toLowerCase().includes(query)
            );

            if (matches.length > 0) {
                autocompleteList.style.display = 'block';
                matches.forEach(loc => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span>${loc.icon}</span> ${loc.name}`;
                    li.addEventListener('click', () => {
                        elements.locationSearch.value = loc.name;
                        autocompleteList.style.display = 'none';
                        selectAndZoomToMarker(loc);
                    });
                    autocompleteList.appendChild(li);
                });
            } else {
                autocompleteList.style.display = 'none';
            }
            
            state.markers.forEach(({ marker, data }) => {
                marker.setOpacity(data.name.toLowerCase().includes(query) ? 1 : 0.2);
            });
        });

        document.addEventListener('click', (e) => {
            if (!elements.locationSearch.contains(e.target) && !autocompleteList.contains(e.target)) {
                autocompleteList.style.display = 'none';
            }
        });
    };

    const selectAndZoomToMarker = (location) => {
        const markerObj = state.markers.find(m => m.id === location.id);
        if (markerObj) {
            state.map.setView(location.coords, 15, { animate: true });
            markerObj.marker.openTooltip();
            if ((location.type === 'warehouse' || location.type === 'delivery')) {
                const isSelected = state.selectedLocations.some(l => l.id === location.id);
                if (!isSelected) toggleLocation(location);
            }
        }
    };

    const toggleLocation = (location) => {
        const index = state.selectedLocations.findIndex(l => l.id === location.id);
        const markerEl = document.getElementById(`marker-${location.id}`);
        const cardEl = document.getElementById(`node-card-${location.id}`);

        if (index === -1) {
            state.selectedLocations.push(location);
            if (markerEl) markerEl.classList.add('selected');
            if (cardEl) cardEl.classList.add('selected');
            updateStatus(`Added Node: ${location.name}`);
        } else {
            state.selectedLocations.splice(index, 1);
            if (markerEl) markerEl.classList.remove('selected');
            if (cardEl) cardEl.classList.remove('selected');
            updateStatus(`Removed Node: ${location.name}`);
        }
        updateUI();
    };

    const updateUI = () => {
        const count = state.selectedLocations.length;
        elements.optimizeBtn.disabled = count < 2;

        if (count === 0) {
            elements.routeList.innerHTML = '<li class="empty-state">No locations selected for current session.</li>';
            elements.routeStats.style.display = 'none';
        } else {
            elements.routeList.innerHTML = state.selectedLocations
                .map((loc, idx) => `
                    <li class="route-item" style="animation-delay: ${idx * 0.1}s">
                        <span class="index">${idx + 1}</span>
                        <div class="details">
                            <span class="name">${loc.name}</span>
                            <span class="priority-tag priority-${loc.priority.toLowerCase()}">${loc.priority} Priority</span>
                        </div>
                    </li>
                `).join('');
            elements.routeStats.style.display = 'grid';
        }
    };

    const updateStatus = (text) => {
        elements.statusText.textContent = text;
    };

    const optimizeRoute = async () => {
        // Ensure warehouse is always included and is the first element
        const warehouse = state.predefinedLocations.find(l => l.type === 'warehouse');
        let locationsToOptimize = [...state.selectedLocations];
        
        if (!locationsToOptimize.some(l => l.type === 'warehouse')) {
            locationsToOptimize.unshift(warehouse);
        } else {
            // Move warehouse to the front
            const wIndex = locationsToOptimize.findIndex(l => l.type === 'warehouse');
            const w = locationsToOptimize.splice(wIndex, 1)[0];
            locationsToOptimize.unshift(w);
        }

        if (locationsToOptimize.length < 2) {
            updateStatus('Select at least one delivery point');
            return;
        }

        showLoading(true);
        updateStatus('Analyzing Optimal Logistics Path...');

        try {
            const response = await fetch('/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locations: locationsToOptimize.map(l => l.coords)
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Optimization failed');
            handleOptimizationSuccess(data);
        } catch (error) {
            console.error('API Error:', error);
            updateStatus(`Error: ${error.message}`);
        } finally {
            showLoading(false);
        }
    };

    const handleOptimizationSuccess = (data) => {
        const { route, distance } = data;
        const orderedDetails = route.map(coords => {
            return state.predefinedLocations.find(loc => 
                loc.coords[0] === coords[0] && loc.coords[1] === coords[1]
            );
        });

        elements.totalDistance.textContent = `${distance} km`;
        const timeMins = Math.round((distance / 35) * 60 * 1.25);
        elements.estTime.textContent = `${timeMins} mins`;
        
        recalculateFuel(distance);
        
        updateStatus('Optimization Complete: Route Computed');
        generateAnalytics(distance, timeMins, route.length);
        elements.analyticsBtn.style.display = 'block';
        renderOptimizedList(orderedDetails, route);
        drawAnimatedRoute(route);
        generateAiInsights({distance, timeMins, vehicle: state.vehicles[state.selectedVehicle].name, stops: route.length});
    };

    const generateAnalytics = (optimizedDist, optimizedTime, stops) => {
        const factor = 1.3 + Math.random() * 0.2;
        const originalDist = optimizedDist * factor;
        const originalTime = optimizedTime * factor;
        const distSaved = originalDist - optimizedDist;
        const timeSaved = originalTime - optimizedTime;
        const fuelSaved = (distSaved / 12) * 1.05;
        const efficiencyScore = Math.min(Math.round(((originalDist - optimizedDist) / originalDist) * 100 + 55), 99);

        state.analytics.currentData = { originalDist, optimizedDist, originalTime, optimizedTime, distSaved, timeSaved, fuelSaved, efficiencyScore, stops };
        document.getElementById('fuelSaved').textContent = `₹${fuelSaved.toFixed(2)}`;
        document.getElementById('timeSaved').textContent = `${Math.round(timeSaved)} mins`;
        document.getElementById('distSaved').textContent = `${distSaved.toFixed(2)} km`;
        document.getElementById('efficiencyScore').textContent = `${efficiencyScore}%`;
        document.getElementById('perfSummaryText').textContent = `Logistics optimization reduced total distance by ${distSaved.toFixed(1)}km, saving ₹${fuelSaved.toFixed(2)} in fuel costs across ${stops} delivery nodes.`;
    };

    const openAnalytics = () => {
        elements.analyticsModal.style.display = 'flex';
        updateCharts();
    };

    const updateCharts = () => {
        const data = state.analytics.currentData;
        if (!data) return;

        if (state.analytics.distanceChart) state.analytics.distanceChart.destroy();
        state.analytics.distanceChart = new Chart(document.getElementById('distanceChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Standard Path', 'Optimized Path'],
                datasets: [{ 
                    data: [data.originalDist, data.optimizedDist], 
                    backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(59,130,246,0.7)'],
                    borderColor: ['#ef4444', '#3b82f6'],
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: { 
                plugins: { legend: { display: false } }, 
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#8b949e', font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#8b949e', font: { size: 10 } }
                    }
                }
            }
        });

        if (state.analytics.efficiencyChart) state.analytics.efficiencyChart.destroy();
        state.analytics.efficiencyChart = new Chart(document.getElementById('efficiencyChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Efficiency', 'Remaining'],
                datasets: [{ 
                    data: [data.efficiencyScore, 100 - data.efficiencyScore], 
                    backgroundColor: ['#3b82f6', 'rgba(255,255,255,0.06)'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: { 
                cutout: '78%', 
                plugins: { 
                    legend: { 
                        position: 'bottom',
                        labels: { color: '#8b949e', font: { size: 10 }, padding: 12 }
                    } 
                }
            }
        });
    };

    const renderOptimizedList = (details, routeCoords) => {
        elements.routeList.innerHTML = details.map((loc, idx) => {
            let segment = '';
            if (idx > 0) {
                const dist = calculateSimpleDistance(routeCoords[idx-1], routeCoords[idx]);
                segment = `<div class="route-segment"><span>${dist.toFixed(1)} km</span></div>`;
            }
            return `
                ${segment}
                <li class="route-item" style="animation-delay: ${idx * 0.05}s">
                    <span class="index">${idx + 1}</span>
                    <div class="details">
                        <span class="name">${loc.name}</span>
                        <span class="priority-tag priority-${loc.priority.toLowerCase()}">${loc.priority} Priority</span>
                    </div>
                </li>
            `;
        }).join('');
    };

    const calculateSimpleDistance = (c1, c2) => {
        const R = 6371;
        const dLat = (c2[0] - c1[0]) * Math.PI / 180;
        const dLon = (c2[1] - c1[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(c1[0]*Math.PI/180)*Math.cos(c2[0]*Math.PI/180)*Math.sin(dLon/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    const drawAnimatedRoute = (route) => {
        if (state.currentRouteLine) state.map.removeLayer(state.currentRouteLine);
        const polylineGroup = L.featureGroup().addTo(state.map);
        state.currentRouteLine = polylineGroup;

        // Draw background shadow line
        const bgLine = L.polyline(route, {
            color: '#3b82f6',
            weight: 12,
            opacity: 0.08,
            lineJoin: 'round'
        }).addTo(polylineGroup);

        let i = 0;
        const animate = () => {
            if (i >= route.length - 1) {
                // Once route is fully drawn, start delivery flow animation
                const decorator = L.polylineDecorator(route, {
                    patterns: [
                        { 
                            offset: 25, 
                            repeat: 50, 
                            symbol: L.Symbol.arrowHead({
                                pixelSize: 12,
                                pathOptions: {
                                    fillOpacity: 1,
                                    weight: 0,
                                    color: '#3b82f6'
                                }
                            })
                        }
                    ]
                }).addTo(polylineGroup);
                
                startDeliveryFlow(route, polylineGroup);
                return;
            }
            const start = route[i], end = route[i+1];
            // Use a single color for the main route or keep traffic colors? 
            // User requested better styling, let's use a nice coffee gradient feel
            const color = '#3b82f6'; 
            
            const segment = L.polyline([start, start], { 
                color: color, 
                weight: 5, 
                opacity: 0.95,
                className: 'route-line-main'
            }).addTo(polylineGroup);
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 0.05;
                if (progress >= 1) {
                    clearInterval(interval);
                    segment.setLatLngs([start, end]);
                    i++; animate();
                } else {
                    const lat = start[0] + (end[0] - start[0]) * progress;
                    const lng = start[1] + (end[1] - start[1]) * progress;
                    segment.setLatLngs([start, [lat, lng]]);
                }
            }, 20);
        };
        animate();

        if (route.length > 1) {
            state.map.fitBounds(L.latLngBounds(route.map(c => L.latLng(c[0], c[1]))), { padding: [80, 80], animate: true });
        }
    };

    const startDeliveryFlow = (route, group) => {
        const dot = L.circleMarker(route[0], {
            radius: 6,
            fillColor: '#10b981',
            fillOpacity: 1,
            color: '#0d1117',
            weight: 2,
            className: 'delivery-dot'
        }).addTo(group);

        let segmentIndex = 0;
        let progress = 0;

        const moveDot = () => {
            if (!state.currentRouteLine) return; // Stop if app reset
            
            progress += 0.01;
            if (progress >= 1) {
                progress = 0;
                segmentIndex++;
                if (segmentIndex >= route.length - 1) segmentIndex = 0;
            }

            const start = route[segmentIndex];
            const end = route[segmentIndex + 1];
            const lat = start[0] + (end[0] - start[0]) * progress;
            const lng = start[1] + (end[1] - start[1]) * progress;
            
            dot.setLatLng([lat, lng]);
            requestAnimationFrame(moveDot);
        };
        moveDot();
    };

    const initTrafficSimulation = () => {
        // Clear existing traffic if any
        state.trafficLayers.forEach(layer => state.map.removeLayer(layer));
        state.trafficLayers = [];

        // Define realistic road-based paths around Chandigarh hotspots
        const trafficPaths = [
            {
                name: "NH-44 Chandigarh-Ludhiana",
                path: [[30.7333, 76.7794], [30.7950, 76.5000], [30.8400, 76.1900], [30.9010, 75.8573]],
                color: '#ef4444', speed: 0.002
            },
            {
                name: "NH-44 Ludhiana-Jalandhar",
                path: [[30.9010, 75.8573], [31.0200, 75.7900], [31.3260, 75.5762]],
                color: '#f59e0b', speed: 0.003
            },
            {
                name: "NH-44 Jalandhar-Amritsar",
                path: [[31.3260, 75.5762], [31.4500, 75.2000], [31.6200, 74.8765]],
                color: '#ef4444', speed: 0.002
            },
            {
                name: "NH-7 Chandigarh-Patiala",
                path: [[30.7333, 76.7794], [30.6500, 76.5500], [30.4800, 76.5900], [30.3398, 76.3869]],
                color: '#f59e0b', speed: 0.004
            },
            {
                name: "NH-54 Ludhiana-Bathinda",
                path: [[30.9010, 75.8573], [30.7050, 76.2200], [30.3800, 75.5500], [30.2110, 74.9455]],
                color: '#22c55e', speed: 0.005
            },
            {
                name: "NH-3 Pathankot-Jalandhar",
                path: [[32.2700, 75.6500], [32.0400, 75.4100], [31.5300, 75.9100], [31.3260, 75.5762]],
                color: '#f59e0b', speed: 0.004
            },
        ];

        trafficPaths.forEach(config => {
            const polyline = L.polyline(config.path, {
                color: config.color,
                weight: 5,
                opacity: 0.3,
                dashArray: '10, 10',
                interactive: false
            }).addTo(state.map);
            
            state.trafficLayers.push(polyline);
            animateTrafficFlow(config.path, config.color, config.speed);
        });
    };

    const animateTrafficFlow = (path, color, speed) => {
        // Multi-point path interpolation
        const getPointAtProgress = (progress) => {
            const totalSegments = path.length - 1;
            const segmentIndex = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
            const segmentProgress = (progress * totalSegments) - segmentIndex;
            
            const start = path[segmentIndex];
            const end = path[segmentIndex + 1];
            
            return [
                start[0] + (end[0] - start[0]) * segmentProgress,
                start[1] + (end[1] - start[1]) * segmentProgress
            ];
        };

        const dot = L.circleMarker(path[0], {
            radius: 3,
            fillColor: color,
            fillOpacity: 1,
            color: 'white',
            weight: 1,
            className: 'traffic-dot'
        }).addTo(state.map);

        state.trafficLayers.push(dot);

        let progress = Math.random(); // Start at random position for variety
        
        const move = () => {
            progress += speed;
            if (progress >= 1) progress = 0;
            
            dot.setLatLng(getPointAtProgress(progress));
            requestAnimationFrame(move);
        };
        
        move();
    };

    const resetApp = () => {
        state.selectedLocations = [];
        if (state.currentRouteLine) state.map.removeLayer(state.currentRouteLine);
        state.currentRouteLine = null;
        document.querySelectorAll('.marker-pin').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.location-node-card').forEach(el => el.classList.remove('selected'));
        state.markers.forEach(({ marker }) => marker.setOpacity(1));
        elements.locationSearch.value = '';
        elements.analyticsBtn.style.display = 'none';
        state.map.setView([31.1471, 75.3412], 8);
        updateUI();
        updateStatus('System Reset: Awaiting Input');
    };

    const showLoading = (show) => {
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
        elements.optimizeBtn.disabled = show;
    };

    const generateAiInsights = async (stats) => {
        try {
            elements.aiInsightsBox.style.display = 'block';
            elements.aiInsightsText.textContent = 'Analyzing route strategically...';
            
            const response = await fetch('/api/analyze-route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stats)
            });
            const data = await response.json();
            if (data.insight) {
                elements.aiInsightsText.textContent = data.insight;
            } else {
                elements.aiInsightsBox.style.display = 'none';
            }
        } catch (err) {
            elements.aiInsightsBox.style.display = 'none';
        }
    };

    const handleAiChat = async () => {
        const prompt = elements.aiChatInput.value.trim();
        if (!prompt) return;
        
        const originalBtnText = elements.aiChatBtn.textContent;
        elements.aiChatBtn.textContent = 'Thinking...';
        elements.aiChatBtn.disabled = true;
        updateStatus('AI is analyzing your request...');
        
        try {
            const response = await fetch('/api/chat-route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    available_locations: state.predefinedLocations.map(l => ({name: l.name}))
                })
            });
            
            const data = await response.json();
            
            if (data.locations) {
                // Clear existing
                state.selectedLocations = [];
                document.querySelectorAll('.marker-pin').forEach(el => el.classList.remove('selected'));
                document.querySelectorAll('.location-node-card').forEach(el => el.classList.remove('selected'));
                
                // Toggle returned locations
                data.locations.forEach(locName => {
                    const matchedLoc = state.predefinedLocations.find(l => l.name.toLowerCase() === locName.toLowerCase());
                    if (matchedLoc) {
                        toggleLocation(matchedLoc);
                    }
                });
            }
            
            if (data.vehicle) {
                const btn = document.querySelector(`.vehicle-btn[data-type="${data.vehicle.toLowerCase()}"]`);
                if (btn) btn.click();
            }
            
            elements.aiChatInput.value = '';
            updateStatus('AI successfully mapped locations and vehicle type.');
        } catch (err) {
            updateStatus('AI Error: Could not process request.');
        } finally {
            elements.aiChatBtn.textContent = originalBtnText;
            elements.aiChatBtn.disabled = false;
        }
    };

    elements.optimizeBtn.addEventListener('click', optimizeRoute);
    elements.analyticsBtn.addEventListener('click', openAnalytics);
    elements.resetBtn.addEventListener('click', resetApp);
    elements.closeModal.addEventListener('click', () => elements.analyticsModal.style.display = 'none');
    elements.aiChatBtn.addEventListener('click', handleAiChat);
    elements.aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAiChat();
    });
    window.addEventListener('click', (e) => { if (e.target === elements.analyticsModal) elements.analyticsModal.style.display = 'none'; });

    initApp();
});
