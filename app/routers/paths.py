from fastapi import APIRouter, HTTPException
from typing import Optional
from app.schemas import PathRequest, PathResponse, AllPathResponse
from app.shortest_path import find_shortest_path
from app.cheapest_path import find_cheapest_path
from app.all_path import find_all_paths
from app import state

router = APIRouter()

def shortest_path(start_station_code: str, end_station_code: str) -> PathResponse:
    """
    Find the shortest path between two stations.
    """
    if start_station_code is None or end_station_code is None:
        return PathResponse(
            status="error",
            message="Start and end station codes must be provided.",
            data=None
        )
    
    path = find_shortest_path(start_station_code, end_station_code)

    if path:
        return PathResponse(
            status="success",
            message="Shortest path found successfully.",
            data=path
        )
    else:
        return PathResponse(
            status="error",
            message="No path found between the specified stations.",
            data=None
        )
    

def cheapest_path(start_station_code: str, end_station_code: str) -> PathResponse:
    """
    Find the cheapest path between two stations.
    """
    
    path = find_cheapest_path(start_station_code, end_station_code)

    if path:
        return PathResponse(
            status="success",
            message="Cheapest path found successfully.",
            data=path
        )
    else:
        return PathResponse(
            status="error",
            message="No path found between the specified stations.",
            data=None
        )

def all_paths(start_station_code: str, end_station_code: str) -> AllPathResponse:
    """
    Find multiple path options between two stations.
    """
    paths = find_all_paths(start_station_code, end_station_code)

    if paths:
        return AllPathResponse(
            status="success",
            message=f"{len(paths)} paths found successfully.",
            data=paths
        )
    else:
        return AllPathResponse(
            status="error",
            message="No paths found between the specified stations.",
            data=None
        )
    

@router.post("/")
def paths(request: PathRequest) -> Optional[PathResponse] | Optional[AllPathResponse]:
    """
    Find path based on criteria: "shortest", "cheapest", or "all".
    """

    start_station = request.start_station_code
    end_station = request.end_station_code

    stations = state.stations

    if start_station not in stations:
        raise HTTPException(status_code=404, detail="Starting station not found")
    if end_station not in stations:
        raise HTTPException(status_code=404, detail="Destination station not found")
    
    if start_station == end_station:
        raise HTTPException(status_code=400, detail="Start and end stations cannot be the same")

    if request.criteria == "shortest":
        return shortest_path(start_station, end_station)
    elif request.criteria == "cheapest":
        return cheapest_path(start_station, end_station)
    elif request.criteria == "all":
        return all_paths(start_station, end_station)