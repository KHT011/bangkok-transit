const ENDPOINTS = {
    stations: '/api/stations/',
    paths: '/paths/'
};

const elements = {
    form: document.getElementById('path-form'),
    startInput: document.getElementById('start_station_code'),
    endInput: document.getElementById('end_station_code'),
    datalist: document.getElementById('station-list'),
    suggestions: document.getElementById('station-suggestions'),
    status: document.getElementById('status'),
    pathsContainer: document.getElementById('paths-container'),
    submitButton: document.querySelector('.cta')
};

const state = {
    stations: [],
    stationLookup: {}
};

const curatedTrips = [
    { from: 'N24', to: 'BL01', note: 'BTS north terminus down to Tao Poon blue line hub' },
    { from: 'Siam', to: 'Si Lom', note: 'Iconic transfer between core city grids' },
    { from: 'A01', to: 'N08', note: 'Airport Rail Link into Sukhumvit spine' }
];

function setStatus(message, tone = 'neutral') {
    elements.status.textContent = message;
    elements.status.dataset.tone = tone;
}

function createOption(station) {
    const option = document.createElement('option');
    option.value = station.station_code;
    option.textContent = `${station.station_code} — ${station.name_en} (${station.line.name_en})`;
    return option;
}

function renderSuggestions() {
    elements.suggestions.innerHTML = '';
    curatedTrips.forEach((trip) => {
        const stationLabel = state.stationLookup[trip.from]?.name_en || trip.from;
        const targetLabel = state.stationLookup[trip.to]?.name_en || trip.to;
        const wrapper = document.createElement('button');
        wrapper.type = 'button';
        wrapper.className = 'suggestion-card';
        wrapper.innerHTML = `
            <strong>${trip.from} → ${trip.to}</strong>
            <p>${trip.note}</p>
            <small>${stationLabel} → ${targetLabel}</small>`;
        wrapper.addEventListener('click', () => {
            elements.startInput.value = trip.from;
            elements.endInput.value = trip.to;
        });
        elements.suggestions.appendChild(wrapper);
    });
}

async function loadStations() {
    try {
        setStatus('Loading stations catalog…');
        const response = await fetch(ENDPOINTS.stations);
        if (!response.ok) {
            throw new Error('Unable to reach station catalog');
        }
        const stations = await response.json();
        state.stations = stations;
        state.stationLookup = stations.reduce((acc, station) => {
            acc[station.station_code] = station;
            acc[station.name_en] = station;
            return acc;
        }, {});
        elements.datalist.innerHTML = '';
        stations.forEach((station) => elements.datalist.appendChild(createOption(station)));
        renderSuggestions();
        setStatus('Stations ready. Submit a query to view routes.');
    } catch (error) {
        console.error(error);
        setStatus('Could not load stations. Make sure the API is running.', 'error');
    }
}

function formatPathType(pathType) {
    if (!pathType) return 'Path';
    if (pathType === 'shortest' || pathType === 'cheapest') {
        return pathType.charAt(0).toUpperCase() + pathType.slice(1) + ' path';
    }
    return pathType.replace(/-/g, ' ');
}

function renderPaths(payload) {
    const isArray = Array.isArray(payload.data);
    const paths = isArray ? payload.data : payload.data ? [payload.data] : [];

    if (!paths.length) {
        setStatus('No route data returned. Try a different station pair.', 'error');
        elements.pathsContainer.innerHTML = '';
        return;
    }

    setStatus(payload.message || `Showing ${paths.length} option(s).`, 'success');
    elements.pathsContainer.innerHTML = '';

    paths.forEach((path) => {
        elements.pathsContainer.appendChild(createPathCard(path));
    });
}

function createPathCard(path) {
    const card = document.createElement('article');
    card.className = 'path-card';

    const header = document.createElement('div');
    header.className = 'path-header';

    const title = document.createElement('h3');
    title.className = 'path-title';
    title.textContent = formatPathType(path.path_type);

    const fare = document.createElement('div');
    fare.className = 'fare-line';
    fare.innerHTML = `<span>Total fare</span><strong>${(path.fare_total ?? 0).toFixed(2)} THB</strong>`;

    const stats = document.createElement('div');
    stats.className = 'path-stats';
    const totalStations = path.stats?.total_stations ?? '—';
    const transfers = path.stats?.total_transfers ?? 0;
    const lines = path.stats?.total_lines ?? 0;
    stats.innerHTML = `
        <span>${totalStations} stations</span>
        <span>${transfers} transfers</span>
        <span>${lines} lines</span>`;

    header.appendChild(title);
    header.appendChild(stats);

    const description = document.createElement('p');
    description.textContent = path.route_description || 'Route description unavailable';
    description.className = 'route-description';

    const stepsList = document.createElement('ul');
    stepsList.className = 'route-steps';
    (path.route_steps || []).forEach((step) => {
        const li = document.createElement('li');
        li.className = 'route-step';
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = step.icon || '•';
        const text = document.createElement('div');
        const station = step.station ? `${step.station.code} • ${step.station.name}` : '';
        text.innerHTML = `<strong>${step.action}</strong> ${step.line || ''} ${station}`.trim();
        li.appendChild(icon);
        li.appendChild(text);
        stepsList.appendChild(li);
    });

    const fares = document.createElement('div');
    fares.className = 'fare-breakdown';
    fares.innerHTML = (path.fare_breakdown || [])
        .map((segment) => {
            const agency = segment.agency || 'Segment';
            const hops = segment.ride_hops ?? '-';
            const cost = typeof segment.cost === 'number' ? segment.cost : Number(segment.cost) || 0;
            return `${agency}: ${hops} hops → ${cost.toFixed(2)} THB`;
        })
        .join('<br>');

    card.appendChild(header);
    // card.appendChild(description);
    card.appendChild(stepsList);
    card.appendChild(fare);
    card.appendChild(fares);
    return card;
}

async function submitForm(event) {
    event.preventDefault();
    const formData = new FormData(elements.form);
    const payload = Object.fromEntries(formData.entries());
    payload.start_station_code = payload.start_station_code.trim().toUpperCase();
    payload.end_station_code = payload.end_station_code.trim().toUpperCase();

    if (!payload.start_station_code || !payload.end_station_code) {
        setStatus('Please provide both station codes.', 'error');
        return;
    }

    elements.submitButton.disabled = true;
    setStatus('Calculating routes…');

    try {
        const response = await fetch(ENDPOINTS.paths, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const body = await response.json();
        if (!response.ok || body.status !== 'success') {
            throw new Error(body.detail || body.message || 'Path request failed');
        }
        renderPaths(body);
    } catch (error) {
        console.error(error);
        setStatus(error.message || 'Unable to calculate path.', 'error');
        elements.pathsContainer.innerHTML = '';
    } finally {
        elements.submitButton.disabled = false;
    }
}

loadStations();
elements.form.addEventListener('submit', submitForm);
