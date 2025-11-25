FROM python:3.12-slim

WORKDIR /app

# Copy only dependency metadata first (better caching)
COPY requirements.txt ./

# Install dependencies directly from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code
COPY . .

EXPOSE 80

CMD fastapi run app/main.py --host 0.0.0.0 --port 80
