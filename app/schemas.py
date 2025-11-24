from pydantic import BaseModel
from typing import List, Optional, Dict


class Line(BaseModel):
    id: int
    name_en: str
    name_thai: Optional[str] = None


class Station(BaseModel):
    station_code: str
    station_short_name: str
    name_en: str
    name_thai: Optional[str] = None
    line_id: int
    place_id: int
    x: float
    y: float
    id: int
    line: Line

class PathRequest(BaseModel):
    start_station_code: str
    end_station_code: str
    criteria: str  # "shortest" or "cheapest" or "all"

# class StationInfo(BaseModel):
#     station_code: str
#     x: float
#     y: float

# class RouteStep(BaseModel):
#     icon: str                   # "🚆", "🚏", "🔄", "🚶"
#     action: str                 # "Start ride on", "Get off at", "Transfer at", "Walk to", "Board"
#     line: str | None            # Line name if applicable
#     station: Dict[str, str] | None

# class FareBreakdownItem(BaseModel):
#     agency: str               
#     ride_hops: int
#     cost: float 

# class PathData(BaseModel):
#     path_type: str
#     start_station_code: str
#     end_station_code: str
#     stats: Dict[str, int]
#     route_description: str  
#     route_steps: List[RouteStep]     
#     stations: List[StationInfo]        
#     fare_total: float | None      
#     fare_breakdown: List[FareBreakdownItem] | None

class PathResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, object]

class AllPathResponse(PathResponse):
    data: List[Dict[str, object]]