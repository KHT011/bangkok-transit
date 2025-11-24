import heapq
from typing import Dict, List, Optional

from app.path_utils import format_route
from app import state

# Shortest path: minimize hops with a small penalty on transfers so we avoid
# zig-zagging between lines when a direct ride exists.


def _reconstruct_path(came_from: Dict[str, str], current: str) -> List[str]:
    path: List[str] = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path


def _dijkstra_shortest(graph: state.Graph, start: str, goal: str) -> Optional[List[str]]:
    """Dijkstra with unit ride weight and transfer penalty."""
    queue: List = [(0, start)]
    distances: Dict[str, float] = {start: 0}
    came_from: Dict[str, str] = {}

    while queue:
        cost, node = heapq.heappop(queue)
        if node == goal:
            return _reconstruct_path(came_from, node)
        if cost > distances.get(node, float("inf")):
            continue

        for edge in graph.get_neighbors(node):
            neighbor = edge['to']
            edge_type = edge['type']
            weight = 1 if edge_type == "ride" else 2
            new_cost = cost + weight
            if new_cost < distances.get(neighbor, float("inf")):
                distances[neighbor] = new_cost
                came_from[neighbor] = node
                heapq.heappush(queue, (new_cost, neighbor))
    return None


def find_shortest_path(from_station_code: str, to_station_code: str) -> Dict[str, object] | None:
    """
    Find the shortest path by station hops (penalizing transfers slightly).
    Returns a response dict shaped like the README example.
    """
    # Use pre-loaded data from state
    stations = state.stations
    edges = state.edges
    fares = state.fares
    graph = state.graph

    path = _dijkstra_shortest(graph, from_station_code, to_station_code)

    if path:
        return format_route(path, "shortest", stations, edges, fares)
    return None