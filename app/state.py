import json
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict
from app.path_utils import fare_between

# Global state
stations: Dict[str, dict] = {}
edges: Dict[str, str] = {}
fares: Dict[str, float] = {}
# graph: Dict[str, List[Tuple[str, str]]] = {}

DATA_DIR = Path(__file__).parent / "data"

class Graph:
    def __init__(self):
        self.nodes = {}
        self.adjacency_list = defaultdict(list)

    def add_node(self, node_id, **kwargs):
        self.nodes[node_id] = kwargs

    def add_edge(self, u, v, cost=0.0, type='ride'):
        self.adjacency_list[u].append({'to': v, 'cost': cost, 'type': type})

    def get_neighbors(self, u):
        return self.adjacency_list[u]

    def get_node(self, u):
        return self.nodes.get(u)
    
graph: Graph = Graph()

def build_graph_from_edges(edges_data: Dict[str, str]) -> Dict[str, List[Tuple[str, str]]]:
    """Create an adjacency list where each item is (neighbor, edge_type)."""
    g: Dict[str, List[Tuple[str, str]]] = {}
    for key, edge_type in edges_data.items():
        try:
            source, target = key.split(":")
        except ValueError:
            continue
        g.setdefault(source, []).append((target, edge_type))
    return g

def load_data():
    """Load data from JSON files and build the graph."""
    global stations, edges, fares, graph
    
    with open(DATA_DIR / "stations.json", "r", encoding="utf-8") as f:
        stations = json.load(f).get("stations", {})
    
    with open(DATA_DIR / "edge.json", "r", encoding="utf-8") as f:
        edges = json.load(f).get("edges", {})
    
    with open(DATA_DIR / "fares.json", "r", encoding="utf-8") as f:
        fares = json.load(f).get("fares", {})
        
    graph = build_graph(graph, stations, edges, fares)
    print("Transit data loaded and graph built.")

def build_graph(g, stations, edges, fares) -> Graph:
    for station_code, station_info in stations.items():
        g.add_node(station_code, **station_info)
    for edge_key, edge_type in edges.items():
        try:
            source, target = edge_key.split(":")
        except ValueError:
            continue
        cost = fare_between(source, target, fares)
        g.add_edge(source, target, cost=cost, type=edge_type)

    return g