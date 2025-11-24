import heapq
from typing import Dict, List, Optional, Tuple

from app.path_utils import fare_between, format_route
from app import state

# Cheapest path: minimize fare by tracking ride segments between transfers.


def _reconstruct_state_path(
    came_from: Dict[Tuple[str, str], Tuple[str, str]], state: Tuple[str, str]
) -> List[str]:
    path = [state[0]]
    while state in came_from:
        state = came_from[state]
        path.append(state[0])
    path.reverse()
    return path


def _dijkstra_cheapest(
    graph: state.Graph,
    start: str,
    goal: str,
    fares: Dict[str, float],
) -> Optional[Tuple[List[str], float]]:
    """
    Dijkstra that keeps track of the current ride segment start.
    Transfers reset the segment; ride edges accumulate fare differences.
    """
    start_state = (start, start)
    distances: Dict[Tuple[str, str], float] = {start_state: 0.0}
    came_from: Dict[Tuple[str, str], Tuple[str, str]] = {}
    queue: List[Tuple[float, Tuple[str, str]]] = [(0.0, start_state)]

    while queue:
        cost, (node, segment_start) = heapq.heappop(queue)
        if cost > distances.get((node, segment_start), float("inf")):
            continue
        if node == goal:
            return _reconstruct_state_path(came_from, (node, segment_start)), cost

        for edge in graph.get_neighbors(node):
            neighbor = edge['to']
            edge_type = edge['type']
            if edge_type == "ride":
                base_current = fare_between(segment_start, node, fares, default=0.0)
                base_neighbor = fare_between(segment_start, neighbor, fares, default=0.0)
                incremental = max(base_neighbor - base_current, 0.0)
                if base_neighbor == 0.0 and base_current == 0.0 and segment_start != neighbor:
                    incremental = 1.0  # Fallback when fare data is missing
                next_state = (neighbor, segment_start)
                new_cost = cost + incremental
            else:  # transfer is free but starts a new fare segment
                next_state = (neighbor, neighbor)
                new_cost = cost

            if new_cost < distances.get(next_state, float("inf")):
                distances[next_state] = new_cost
                came_from[next_state] = (node, segment_start)
                heapq.heappush(queue, (new_cost, next_state))

    return None


def find_cheapest_path(from_station_code: str, to_station_code: str) -> Dict[str, object] | None:
    """
    Find the lowest-fare path between two stations.
    Returns a response dict shaped like the README example.
    """
    # Use pre-loaded data from state
    stations = state.stations
    edges = state.edges
    fares = state.fares
    graph = state.graph

    result = _dijkstra_cheapest(graph, from_station_code, to_station_code, fares)

    if result:
        path, _ = result
        return format_route(path, "cheapest", stations, edges, fares)
    return None