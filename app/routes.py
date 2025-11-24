from fastapi import APIRouter
from typing import List
from app.schemas import Station, Line
from app import state

router = APIRouter(prefix="/api", tags=["transit"])

@router.get("/stations/", response_model=List[Station])
async def get_stations():
    """
    Get all stations with transformed structure.
    Returns stations with nested line information.
    """
    stations_data = state.stations
    
    stations = []
    for station_code, station_info in stations_data.items():
        # Transform the structure
        line_name_en = station_info.get("line_name_en", "")
        
        station = Station(
            station_code=station_info["station_code"],
            station_short_name=station_info["station_short_name"],
            name_en=station_info["name_en"],
            name_thai=station_info.get("name_thai"),
            line_id=station_info["line_id"],
            place_id=station_info["place_id"],
            x=station_info["x"],
            y=station_info["y"],
            id=station_info["id"],
            line=Line(
                id=station_info["line_id"],
                name_en=line_name_en,
            )
        )
        stations.append(station)
    
    return stations