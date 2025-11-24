from collections import deque
from typing import Dict, List, Set, Tuple

from app.cheapest_path import find_cheapest_path
from app.path_utils import format_route
from app.shortest_path import find_shortest_path
from app import state

# Return multiple options: cheapest, shortest, and a few extra simple alternatives.


def _extract_sequence(route_data: dict) -> List[str]:
    return [station["station_code"] for station in route_data.get("stations", [])]


def _enumerate_paths(
    graph: state.Graph,
    start: str,
    goal: str,
    max_results: int,
    max_length: int = 30,
) -> List[List[str]]:
    """BFS over simple paths; keeps shorter paths first."""
    queue = deque([(start, [start])])
    results: List[List[str]] = []

    while queue and len(results) < max_results * 3:
        node, path = queue.popleft()
        for edge in graph.get_neighbors(node):
            neighbor = edge['to']
            if neighbor in path:
                continue
            new_path = path + [neighbor]
            if len(new_path) > max_length:
                continue
            if neighbor == goal:
                results.append(new_path)
            else:
                queue.append((neighbor, new_path))

    results.sort(key=len)
    return results[:max_results]


def find_all_paths(from_station_code: str, to_station_code: str, num_paths: int = 3) -> Dict[str, object]:
    """
    Return cheapest + up to num_paths alternative options (shortest is always the first alternative).
    """
    # Use pre-loaded data from state
    stations = state.stations
    edges = state.edges
    fares = state.fares
    graph = state.graph

    if from_station_code not in stations:
        return {
            "status": "error",
            "message": "Starting station not found",
            "data": None,
            "error": "Starting station not found",
        }
    if to_station_code not in stations:
        return {
            "status": "error",
            "message": "Destination station not found",
            "data": None,
            "error": "Destination station not found",
        }

    # Clamp num_paths to the documented range
    num_paths = max(1, min(num_paths, 5))
    graph = build_graph(edges)

    cheapest_response = find_cheapest_path(from_station_code, to_station_code)
    if cheapest_response["status"] != "success":
        return {
            "status": "error",
            "message": "No paths found between the given stations",
            "data": None,
            "error": "No paths found between the given stations",
        }

    paths: List[dict] = [cheapest_response["data"]]
    used_sequences: Set[Tuple[str, ...]] = {tuple(_extract_sequence(cheapest_response["data"]))}

    # First alternative: shortest path if different
    if num_paths > 0:
        shortest_response = find_shortest_path(from_station_code, to_station_code)
        if shortest_response["status"] == "success":
            seq = tuple(_extract_sequence(shortest_response["data"]))
            if seq not in used_sequences:
                paths.append(shortest_response["data"])
                used_sequences.add(seq)
                num_paths -= 1

    # More alternatives (option-N) until we hit the requested count
    extra_needed = num_paths
    option_index = 2
    if extra_needed > 0:
        candidates = _enumerate_paths(graph, from_station_code, to_station_code, max_results=extra_needed * 3)
        added_options = 0
        for candidate in candidates:
            seq = tuple(candidate)
            if seq in used_sequences:
                continue
            paths.append(format_route(candidate, f"option-{option_index}", stations, edges, fares))
            used_sequences.add(seq)
            option_index += 1
            added_options += 1
            if added_options >= extra_needed:
                break

    return {
        "status": "success",
        "message": f"Found {len(paths)} path option(s) between the given stations",
        "data": paths,
        "error": None,
    }
