from typing import Dict, List, Optional, Tuple

# Shared helpers for formatting path responses.

def get_edge_type(source: str, target: str, edges: Dict[str, str]) -> str:
    """Return the edge type between two stations if present."""
    return edges.get(f"{source}:{target}", "ride")


def fare_between(
    source: Optional[str], target: Optional[str], fares: Dict[str, float], default: float = 0.0
) -> float:
    """Look up a fare in either direction."""
    if not source or not target:
        return default
    forward = fares.get(f"{source}:{target}")
    if forward is not None:
        return float(forward)
    backward = fares.get(f"{target}:{source}")
    if backward is not None:
        return float(backward)
    return default


def split_segments(path: List[str], edges: Dict[str, str], stations: Dict[str, dict]) -> List[dict]:
    """
    Break a full path into ride segments separated by transfers.
    Each segment has start, end, line, and ride_hops count.
    """
    if len(path) < 2:
        return []

    segments: List[dict] = []
    segment_start = path[0]
    segment_line = stations.get(segment_start, {}).get("line_name_en", "Unknown Line")
    ride_hops = 0

    for prev, curr in zip(path, path[1:]):
        edge_type = get_edge_type(prev, curr, edges)
        if edge_type == "ride":
            ride_hops += 1
            continue

        # Transfer: close the current ride segment if any
        segments.append(
            {
                "start": segment_start,
                "end": prev,
                "line": segment_line,
                "ride_hops": ride_hops,
            }
        )
        segment_start = curr
        segment_line = stations.get(curr, {}).get("line_name_en", "Unknown Line")
        ride_hops = 0

    # Final segment to the destination
    segments.append(
        {
            "start": segment_start,
            "end": path[-1],
            "line": segment_line,
            "ride_hops": ride_hops,
        }
    )

    return segments


def format_route(
    path: List[str],
    path_type: str,
    stations: Dict[str, dict],
    edges: Dict[str, str],
    fares: Dict[str, float],
) -> dict:
    """Convert a raw station path into the response payload."""
    if not path:
        return {}

    segments = split_segments(path, edges, stations)
    transfers = sum(1 for prev, curr in zip(path, path[1:]) if get_edge_type(prev, curr, edges) == "transfer")

    label = path_type.upper().replace("-", " ")
    if label.startswith("OPTION"):
        description_lines = [f"{label}"]
    else:
        description_lines = [f"{label} PATH"]
    route_steps: List[dict] = []
    fare_breakdown: List[dict] = []
    fare_total = 0.0

    for idx, segment in enumerate(segments):
        start_code = segment["start"]
        end_code = segment["end"]
        ride_hops = segment["ride_hops"]

        start_info = stations.get(start_code, {})
        end_info = stations.get(end_code, {})

        line_name = segment["line"] or start_info.get("line_name_en", "Unknown Line")
        start_name = start_info.get("name_en", start_code)
        end_name = end_info.get("name_en", end_code)
        start_place = start_info.get("place_name_en", start_name)
        end_place = end_info.get("place_name_en", end_name)

        action = "Start ride on" if idx == 0 else "Board"
        description_lines.append(f"🚆 {action} {line_name}: {start_code} - {start_name} ({start_place})")
        route_steps.append(
            {
                "icon": "🚆",
                "action": action,
                "line": line_name,
                "station": {"code": start_code, "name": start_name},
            }
        )

        description_lines.append(f"🚉 Get off at: {end_code} - {end_name} ({end_place})")
        route_steps.append(
            {
                "icon": "🚏",
                "action": "Get off at",
                "line": None,
                "station": {"code": end_code, "name": end_name},
            }
        )

        if idx < len(segments) - 1:
            description_lines.append(f"🔄 Transfer at: {end_name}")
            route_steps.append(
                {
                    "icon": "🔄",
                    "action": "Transfer at",
                    "line": None,
                    "station": {"code": end_code, "name": end_name},
                }
            )

        segment_fare = fare_between(start_code, end_code, fares, default=0.0)
        fare_total += segment_fare
        if ride_hops > 0 or start_code != end_code:
            fare_breakdown.append(
                {
                    "agency": line_name,
                    "ride_hops": max(ride_hops, 1),
                    "cost": round(segment_fare, 2),
                }
            )

    station_coords = [
        {"station_code": code, "x": stations[code]["x"], "y": stations[code]["y"]}
        for code in path
        if code in stations
    ]

    return {
        "path_type": path_type,
        "start_station_code": path[0],
        "end_station_code": path[-1],
        "stats": {
            "total_stations": len(path),
            "total_transfers": transfers,
            "total_lines": len(segments),
        },
        "route_description": "\n".join(description_lines),
        "route_steps": route_steps,
        "stations": station_coords,
        "fare_total": round(fare_total, 2),
        "fare_breakdown": fare_breakdown,
    }
