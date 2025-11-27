# Repository Guidelines

## Project Structure & Module Organization
The FastAPI backend lives in `app/`, with `main.py` wiring routers and `state.py` loading station graphs from `app/data/{stations,edge,fares}.json`. Routing logic sits in `routes.py` (station listings) and `paths.py` which dispatches to the algorithm modules (`shortest_path.py`, `cheapest_path.py`, `all_path.py`). Shared helpers are in `path_utils.py` and `schemas.py`. Static assets served at `/` live under `app/static/`, while experimental notebooks belong in `app/testing.ipynb`. Container assets (`Dockerfile`, `compose.yml`) and dependency pins (`requirements.txt`) remain at the repo root; keep generated datasets or PNG/SVG maps inside `app/static/` or `map.svg`.

## Build, Test, and Development Commands
Run `uvicorn app.main:app --reload --port 8000` for local API development. Use `fastapi run app/main.py --host 0.0.0.0 --port 80` to mirror the container entrypoint. `docker compose up --build` builds the image and exposes the service on `http://localhost:7003`. Install deps with `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.

## Coding Style & Naming Conventions
Follow PEP 8 with four-space indentation, type-hinted function signatures, and snake_case for modules, files, and local variables (`find_all_paths`). FastAPI routers remain singular nouns (`router`, `paths_router`). Keep public schemas in `schemas.py` with Pydantic models and prefer explicit return types. JSON fixtures and assets should use lowercase-with-dashes filenames.

## Testing Guidelines
Automate regression coverage with `pytest`, placing new suites under `app/tests/` (mirror the module path: `test_shortest_path.py`). Use `fastapi.testclient.TestClient` to hit `/paths` endpoints and craft data-driven fixtures from `app/data`. Run `pytest -q` locally and add scenario-based notebook experiments only when results feed back into proper tests. Target line coverage above the core algorithms (>85%) before merging.

## Commit & Pull Request Guidelines
Git history shows concise, imperative subject lines (`add simple frontend`, `implement all path`); keep using present tense, <=72 characters, and describe user-visible impact in the body when needed. Pull requests must summarize the change, link Jira/GitHub issues, include reproduction steps or sample API payloads, and attach updated screenshots if static content (`app/static/index.html`) changes. Note any schema or data migrations in the PR checklist and confirm that `docker compose up` succeeds locally.

## Security & Configuration Tips
Secrets are not managed here, so use environment variables (e.g., fare overrides) via `.env` files excluded from source control. Validate station codes before algorithm calls, and never commit modified JSON datasets without regenerating `state.load_data` snapshots.

## General instructions
1. I am trying to learn while doing this project. 
2. Aim for understandable and explainable code rather than complex code.
3. When creating new files, explain the need to do so.

## Frontend Instructions
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.
Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with shar p accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for insp iration.
- Motion: Use
animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motio
n library for React when available. Focus on high-impact moments: one well-orchestrated page load with stagger ed reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.
Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
-Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character
Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!