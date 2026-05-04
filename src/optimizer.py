from distance import haversine_distance

def find_nearest_neighbor_route(locations):
    """
    Implements the Nearest Neighbor algorithm to find an optimized route
    using the Haversine distance formula.
    The first location in the input list is considered the starting point (warehouse).
    
    Args:
        locations (list): A list of dictionaries, each containing 'name' and 'coords' (lat, lng).
        
    Returns:
        tuple: (optimized_route, total_distance)
               optimized_route is a list of location dictionaries in order.
               total_distance is the total distance of the route in kilometers.
    """
    if not locations:
        return [], 0.0

    unvisited = locations.copy()
    
    # The first location is the warehouse/starting point
    current_location = unvisited.pop(0) 
    route = [current_location]
    total_distance = 0.0

    while unvisited:
        nearest_location = None
        min_distance = float('inf')
        nearest_idx = -1

        current_lat, current_lng = current_location['coords']

        for i, location in enumerate(unvisited):
            loc_lat, loc_lng = location['coords']
            dist = haversine_distance(current_lat, current_lng, loc_lat, loc_lng)
            
            if dist < min_distance:
                min_distance = dist
                nearest_location = location
                nearest_idx = i

        total_distance += min_distance
        current_location = nearest_location
        route.append(current_location)
        unvisited.pop(nearest_idx)

    # Return to the warehouse to complete the cycle
    warehouse = route[0]
    warehouse_lat, warehouse_lng = warehouse['coords']
    current_lat, current_lng = current_location['coords']
    
    return_distance = haversine_distance(current_lat, current_lng, warehouse_lat, warehouse_lng)
    total_distance += return_distance
    route.append(warehouse)

    return route, total_distance
