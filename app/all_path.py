from typing import Dict, List

from app.path_utils import format_route
from app import state

# Return multiple options: cheapest, shortest, and a few extra simple alternatives.

def _all_paths(graph: state.Graph, start_id: str, end_id: str, limit: int = 5) -> List[List[str]]:
    """Finds all simple paths using Depth-First Search (DFS)."""
    # limit: max number of paths to return to avoid explosion
    paths = []
    # Stack stores (current_node, current_path_list)
    stack = [(start_id, [start_id])]
    
    while stack and len(paths) < limit:
        (vertex, path) = stack.pop()
        
        # Explore neighbors
        for edge in graph.get_neighbors(vertex):
            neighbor = edge['to']
            
            # If destination found, add to results
            if neighbor == end_id:
                full_path = path + [neighbor]
                
                paths.append(full_path)
                
            # If neighbor not in current path (avoid cycles), continue DFS
            elif neighbor not in path:
                stack.append((neighbor, path + [neighbor]))
                
    return paths

def find_all_paths(from_station_code: str, to_station_code: str) -> List[Dict[str, object]] | None:
    """
    Find the shortest path by station hops (penalizing transfers slightly).
    Returns a response dict shaped like the README example.
    """
    # Use pre-loaded data from state
    stations = state.stations
    edges = state.edges
    fares = state.fares
    graph = state.graph

    paths = _all_paths(graph, from_station_code, to_station_code)

    if paths:
        return [format_route(path, f"option-{i+1}", stations, edges, fares) for i, path in enumerate(paths)]
    return None