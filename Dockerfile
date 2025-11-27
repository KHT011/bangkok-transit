FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

# Install frontend dependencies with the lockfile for reproducibility
COPY frontend/package*.json ./
RUN npm ci

# Copy the frontend sources and build the production bundle
COPY frontend .
ARG VITE_API_BASE_URL=.
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build

FROM python:3.12-slim
WORKDIR /app

# Copy dependency metadata and install backend requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY . .

# Replace the static assets with the freshly built frontend bundle
RUN rm -rf app/static/* && mkdir -p app/static
COPY --from=frontend-builder /frontend/dist ./app/static

EXPOSE 80

CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "80"]
