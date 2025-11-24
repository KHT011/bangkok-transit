# Railway Path Finding API Documentation

This document describes the API structure for three path-finding endpoints: Shortest Path, Cheapest Path, and All Paths.

## Base URL
```
/paths
```

## Common Request Headers
```http
Content-Type: application/json
```

---

## 1. Shortest Path API

Finds the path with the minimum number of stations and transfers between two stations.

### Endpoint
```
POST /paths/shortest
```

### Request Body
```json
{
  "from_station_code": "N24",
  "to_station_code": "BL01"
}
```

**Request Schema:**
- `from_station_code` (string, required): Starting station code (e.g., "N24", "BL10", "YL09")
- `to_station_code` (string, required): Destination station code

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Shortest path found successfully",
  "data": {
    "path_type": "shortest",
    "start_station_code": "N24",
    "end_station_code": "BL01",
    "stats": {
      "total_stations": 15,
      "total_transfers": 2,
      "total_lines": 3
    },
    "route_description": "=== SHORTEST PATH ===\n🚆 Start ride on BTS Sukhumvit Line: N24 - Khu Khot (Khu Khot)\n🚉 Get off at: N17 - Wat Phra Sri Mahathat (Wat Phra Sri Mahathat)\n🔄 Transfer at: Wat Phra Sri Mahathat\n🚆 Board MRT Blue Line to: BL01 - Tao Poon (Tao Poon)\n🚉 Get off at: BL01 - Tao Poon (Tao Poon)",
    "route_steps": [
      {
        "icon": "🚆",
        "action": "Start ride on",
        "line": "BTS Sukhumvit Line",
        "station": {
          "code": "N24",
          "name": "Khu Khot"
        }
      },
      {
        "icon": "🚏",
        "action": "Get off at",
        "line": null,
        "station": {
          "code": "N17",
          "name": "Wat Phra Sri Mahathat"
        }
      },
      {
        "icon": "🔄",
        "action": "Transfer at",
        "line": null,
        "station": {
          "code": "N17",
          "name": "Wat Phra Sri Mahathat"
        }
      },
      {
        "icon": "🚆",
        "action": "Board",
        "line": "MRT Blue Line",
        "station": {
          "code": "BL01",
          "name": "Tao Poon"
        }
      },
      {
        "icon": "🚏",
        "action": "Get off at",
        "line": null,
        "station": {
          "code": "BL01",
          "name": "Tao Poon"
        }
      }
    ],
    "stations": [
      {
        "station_code": "N24",
        "x": 775.26,
        "y": 482.55
      },
      {
        "station_code": "N23",
        "x": 780.12,
        "y": 485.30
      },
      {
        "station_code": "N17",
        "x": 800.50,
        "y": 490.20
      },
      {
        "station_code": "BL01",
        "x": 810.30,
        "y": 495.10
      }
    ],
    "fare_total": 45.00,
    "fare_breakdown": [
      {
        "agency": "BTS Sukhumvit Line",
        "ride_hops": 7,
        "cost": 25.00
      },
      {
        "agency": "MRT Blue Line",
        "ride_hops": 5,
        "cost": 20.00
      }
    ]
  },
  "error": null
}
```

### Error Responses

**Station Not Found (404):**
```json
{
  "status": "error",
  "message": "Starting station not found",
  "data": null,
  "error": "Starting station not found"
}
```

**No Path Found (200):**
```json
{
  "status": "error",
  "message": "No path found between the given stations",
  "data": null,
  "error": "No path found between the given stations"
}
```

### Example cURL
```bash
curl -X POST "http://your-api-url/paths/shortest" \
  -H "Content-Type: application/json" \
  -d '{
    "from_station_code": "N24",
    "to_station_code": "BL01"
  }'
```

---

## 2. Cheapest Path API

Finds the path with the minimum fare cost between two stations.

### Endpoint
```
POST /paths/cheapest
```

### Request Body
```json
{
  "from_station_code": "N24",
  "to_station_code": "BL01"
}
```

**Request Schema:**
- `from_station_code` (string, required): Starting station code
- `to_station_code` (string, required): Destination station code

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Cheapest path found successfully",
  "data": {
    "path_type": "cheapest",
    "start_station_code": "N24",
    "end_station_code": "BL01",
    "stats": {
      "total_stations": 18,
      "total_transfers": 3,
      "total_lines": 4
    },
    "route_description": "=== CHEAPEST PATH ===\n🚆 Start ride on BTS Sukhumvit Line: N24 - Khu Khot (Khu Khot)\n...",
    "route_steps": [
      {
        "icon": "🚆",
        "action": "Start ride on",
        "line": "BTS Sukhumvit Line",
        "station": {
          "code": "N24",
          "name": "Khu Khot"
        }
      }
    ],
    "stations": [
      {
        "station_code": "N24",
        "x": 775.26,
        "y": 482.55
      }
    ],
    "fare_total": 42.00,
    "fare_breakdown": [
      {
        "agency": "BTS Sukhumvit Line",
        "ride_hops": 7,
        "cost": 22.00
      },
      {
        "agency": "MRT Blue Line",
        "ride_hops": 8,
        "cost": 20.00
      }
    ]
  },
  "error": null
}
```

**Note:** The response structure is identical to the shortest path, but:
- `path_type` will be `"cheapest"`
- `message` will be `"Cheapest path found successfully"`
- The path may have more stations/transfers but lower total fare

### Error Responses
Same as Shortest Path API (404 for station not found, 200 for no path found).

### Example cURL
```bash
curl -X POST "http://your-api-url/paths/cheapest" \
  -H "Content-Type: application/json" \
  -d '{
    "from_station_code": "N24",
    "to_station_code": "BL01"
  }'
```

---

## 3. All Paths API

Returns multiple path options including the cheapest path and k-shortest alternative paths.

### Endpoint
```
POST /paths/all_paths
```

### Request Body
```json
{
  "from_station_code": "N24",
  "to_station_code": "BL01",
  "num_paths": 3
}
```

**Request Schema:**
- `from_station_code` (string, required): Starting station code
- `to_station_code` (string, required): Destination station code
- `num_paths` (integer, optional): Number of path options to return
  - Default: `3` if not provided
  - Minimum: `1`
  - Maximum: `5`
  - Note: The cheapest path is always included as the first path, plus k-shortest paths

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Found 4 path option(s) between the given stations",
  "data": [
    {
      "path_type": "cheapest",
      "start_station_code": "N24",
      "end_station_code": "BL01",
      "stats": {
        "total_stations": 18,
        "total_transfers": 3,
        "total_lines": 4
      },
      "route_description": "=== CHEAPEST PATH ===\n...",
      "route_steps": [...],
      "stations": [...],
      "fare_total": 42.00,
      "fare_breakdown": [...]
    },
    {
      "path_type": "shortest",
      "start_station_code": "N24",
      "end_station_code": "BL01",
      "stats": {
        "total_stations": 15,
        "total_transfers": 2,
        "total_lines": 3
      },
      "route_description": "=== SHORTEST PATH ===\n...",
      "route_steps": [...],
      "stations": [...],
      "fare_total": 45.00,
      "fare_breakdown": [...]
    },
    {
      "path_type": "option-2",
      "start_station_code": "N24",
      "end_station_code": "BL01",
      "stats": {
        "total_stations": 17,
        "total_transfers": 2,
        "total_lines": 3
      },
      "route_description": "=== OPTION 2 ===\n...",
      "route_steps": [...],
      "stations": [...],
      "fare_total": 47.00,
      "fare_breakdown": [...]
    },
    {
      "path_type": "option-3",
      "start_station_code": "N24",
      "end_station_code": "BL01",
      "stats": {
        "total_stations": 19,
        "total_transfers": 3,
        "total_lines": 4
      },
      "route_description": "=== OPTION 3 ===\n...",
      "route_steps": [...],
      "stations": [...],
      "fare_total": 50.00,
      "fare_breakdown": [...]
    }
  ],
  "error": null
}
```

**Response Structure:**
- `data` is an **array** of path objects (not a single object)
- First path: Always the cheapest path (`path_type: "cheapest"`)
- Second path: Shortest path (`path_type: "shortest"`)
- Subsequent paths: Alternative k-shortest paths (`path_type: "option-2"`, `"option-3"`, etc.)

### Error Responses
Same as Shortest Path API, but message will say "No paths found" (plural).

### Example cURL
```bash
curl -X POST "http://your-api-url/paths/all_paths" \
  -H "Content-Type: application/json" \
  -d '{
    "from_station_code": "N24",
    "to_station_code": "BL01",
    "num_paths": 3
  }'
```

---

## Response Data Models

### PathResponse (for /shortest and /cheapest)
```typescript
{
  status: "success" | "error",
  message: string,
  data: PathData | null,
  error: string | null
}
```

### AllPathsResponse (for /all_paths)
```typescript
{
  status: "success" | "error",
  message: string,
  data: PathData[] | null,  // Array of paths
  error: string | null
}
```

### PathData
```typescript
{
  path_type: string,              // "shortest", "cheapest", or "option-N"
  start_station_code: string,
  end_station_code: string,
  stats: {
    total_stations: number,
    total_transfers: number,
    total_lines: number
  },
  route_description: string,       // Human-readable text (backward compatibility)
  route_steps: RouteStep[],       // Structured route steps
  stations: StationInfo[],        // Station coordinates in path order
  fare_total: number | null,      // Total fare in THB
  fare_breakdown: FareBreakdownItem[] | null
}
```

### RouteStep
```typescript
{
  icon: string,                   // "🚆", "🚏", "🔄", "🚶"
  action: string,                 // "Start ride on", "Get off at", "Transfer at", "Walk to", "Board"
  line: string | null,            // Line name if applicable
  station: {
    code: string,
    name: string
  } | null
}
```

### StationInfo
```typescript
{
  station_code: string,
  x: number,                      // X coordinate
  y: number                       // Y coordinate
}
```

### FareBreakdownItem
```typescript
{
  agency: string,                 // Line/agency name
  ride_hops: number,              // Number of stops on this segment
  cost: number                    // Fare for this segment in THB
}
```

---

## Quick Reference

| Endpoint | Method | Request Body | Response Type | Description |
|----------|--------|--------------|---------------|-------------|
| `/paths/shortest` | POST | `from_station_code`, `to_station_code` | `PathResponse` | Minimum stations/transfers |
| `/paths/cheapest` | POST | `from_station_code`, `to_station_code` | `PathResponse` | Minimum fare cost |
| `/paths/all_paths` | POST | `from_station_code`, `to_station_code`, `num_paths?` | `AllPathsResponse` | Multiple path options |

---

## Example JavaScript/TypeScript Usage

```typescript
// Shortest Path
const shortestPath = await fetch('/paths/shortest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_station_code: 'N24',
    to_station_code: 'BL01'
  })
});
const shortest = await shortestPath.json();

// Cheapest Path
const cheapestPath = await fetch('/paths/cheapest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_station_code: 'N24',
    to_station_code: 'BL01'
  })
});
const cheapest = await cheapestPath.json();

// All Paths
const allPaths = await fetch('/paths/all_paths', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_station_code: 'N24',
    to_station_code: 'BL01',
    num_paths: 3
  })
});
const paths = await allPaths.json();
console.log(`Found ${paths.data.length} path options`);
```

---

## Example Python Usage

```python
import requests

# Shortest Path
response = requests.post(
    'http://your-api-url/paths/shortest',
    json={
        'from_station_code': 'N24',
        'to_station_code': 'BL01'
    },
    headers={'Content-Type': 'application/json'}
)
shortest = response.json()

# Cheapest Path
response = requests.post(
    'http://your-api-url/paths/cheapest',
    json={
        'from_station_code': 'N24',
        'to_station_code': 'BL01'
    },
    headers={'Content-Type': 'application/json'}
)
cheapest = response.json()

# All Paths
response = requests.post(
    'http://your-api-url/paths/all_paths',
    json={
        'from_station_code': 'N24',
        'to_station_code': 'BL01',
        'num_paths': 3
    },
    headers={'Content-Type': 'application/json'}
)
all_paths = response.json()
print(f"Found {len(all_paths['data'])} path options")
```

---

## Error Handling

All endpoints follow the same error handling pattern:

1. **Station Not Found (404)**: When `from_station_code` or `to_station_code` doesn't exist
2. **No Path Found (200)**: When stations exist but no path connects them
3. **Invalid Request (422)**: When request body doesn't match schema (handled by framework)

Always check the `status` field in the response:
- `"success"`: Request succeeded, check `data` field
- `"error"`: Request failed, check `error` field for details

---

## Implementation Notes for Developers

### 1. Request Validation
- Always validate that `from_station_code` and `to_station_code` exist in your station database
- Return 404 if either station is not found
- For `/all_paths`, validate `num_paths` is between 1 and 5 (default to 3)

### 2. Path Finding Algorithms
- **Shortest Path**: Use Dijkstra's algorithm with edge weights = 1 for rides, higher weight for transfers
- **Cheapest Path**: Use Dijkstra's algorithm with edge weights based on fare costs
- **All Paths**: 
  - First find cheapest path using fare-weighted graph
  - Then find k-shortest paths using k-shortest path algorithm (Yen's algorithm or similar)

### 3. Response Formatting
- Always include both `route_description` (text) and `route_steps` (structured) for backward compatibility
- Calculate fare breakdown by identifying contiguous segments on the same line
- Include station coordinates in the order they appear in the path

### 4. Error Handling
- Return appropriate HTTP status codes (200 for no path found, 404 for station not found)
- Always include both `status` and `error` fields in error responses
- Set `data` to `null` when there's an error

### 5. Testing Examples

**Test Case 1: Valid stations with path**
```json
Request: { "from_station_code": "N24", "to_station_code": "BL01" }
Expected: 200 OK with path data
```

**Test Case 2: Invalid starting station**
```json
Request: { "from_station_code": "INVALID", "to_station_code": "BL01" }
Expected: 404 Not Found
```

**Test Case 3: No path exists**
```json
Request: { "from_station_code": "STATION_A", "to_station_code": "STATION_B" }
Expected: 200 OK with status="error", data=null
```

**Test Case 4: All paths with num_paths**
```json
Request: { "from_station_code": "N24", "to_station_code": "BL01", "num_paths": 5 }
Expected: 200 OK with array of up to 5 paths (cheapest + 4 alternatives)
```

---

## Notes

1. **Station Codes**: Use valid station codes (e.g., "N24", "BL01", "YL09", "PK10")
2. **Fare Calculation**: Fares are calculated based on contiguous segments on the same line
3. **Path Ordering**: 
   - Shortest path minimizes stations and transfers
   - Cheapest path minimizes total fare (may have more stations)
   - All paths returns cheapest first, then shortest, then alternatives
4. **Coordinates**: X and Y coordinates are provided for mapping/visualization purposes
5. **Route Steps**: Use `route_steps` for structured display, `route_description` for text output

---

## Support

For questions or issues, refer to the main project documentation or contact the development team.

