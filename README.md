# Bangkok Transit Map

Project for finding shortest paths, cheapest paths, and calculating fares in the Bangkok railway network.

## Features

- **Find Shortest Path**: Calculate the route with the minimum number of stations between two points.
- **Find Cheapest Path**: Calculate the most cost-effective route based on fare information.
- **Find All Paths**: Explore multiple route options between stations.
- **Station Information**: Retrieve detailed information about all stations in the network.

## Quickstart

### Option 1: Docker (Recommended)

This is the easiest way to run the application, as it handles all dependencies for you.

**Prerequisites:**
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

**Steps:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KHT011/bangkok-transit.git
    cd bangkok_transit
    ```

2.  **Run with Docker Compose:**
    ```bash
    docker compose up --build
    ```

3.  **Access the App:**
    The app will be available at `http://localhost:7003`.

### Option 2: Local Development

If you prefer to run the application directly on your machine.

**Prerequisites:**
- Python 3.10 or higher

**Steps:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KHT011/bangkok-transit.git
    cd bangkok_transit
    ```

2.  **Install dependencies:**
    It is recommended to use a virtual environment.
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the server:**
    You can use `fastapi` CLI or `uvicorn` directly.
    ```bash
    fastapi dev app/main.py
    # OR
    uvicorn app.main:app --reload
    ```

4.  **Access the App:**
    By default, the app will be available at `http://localhost:8000`.

## API Documentation

The application provides interactive API documentation via Swagger UI.

- **Interactive Docs**: [http://localhost:7003/docs](http://localhost:7003/docs) (Docker) or [http://localhost:8000/docs](http://localhost:8000/docs) (Local)

### Key Endpoints

#### 1. Get All Stations

Retrieve a list of all available stations in the network.

- **URL**: `/stations/`
- **Method**: `GET`
- **Response**: List of station objects containing codes, names, and location data.

#### 2. Calculate Path

Find a path between two stations based on specific criteria.

- **URL**: `/paths/`
- **Method**: `POST`
- **Body**:
    ```json
    {
      "start_station_code": "A01",
      "end_station_code": "BL22",
      "criteria": "shortest" 
    }
    ```
    - `criteria` options: `"shortest"`, `"cheapest"`, `"all"`

#### 3. Health Check

Check if the API is running and healthy.

- **URL**: `/health`
- **Method**: `GET`
- **Response**: `{"status": "healthy"}`
