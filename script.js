(async function(){
  // Pre-select station from URL if present
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const stationParam = getQueryParam('station');

  // After stations are loaded, set selection if param exists
  async function loadAQHI(){
    try {
      const res = await fetch(aqhiUrl);
      const data = await res.json();

      select.innerHTML = "";
      data.forEach(station => {
        const opt = document.createElement("option");
        opt.value = station.station;
        opt.textContent = station.station;
        select.appendChild(opt);
      });

      if (stationParam) {
        // Try to match station name case-insensitively
        const found = data.find(s => s.station.toLowerCase() === stationParam.toLowerCase());
        if (found) {
          select.value = found.station;
        } else {
          select.value = data[0].station;
        }
      } else {
        select.value = data[0].station;
      }
      updateStation(select.value, data);

      select.addEventListener("change", e => updateStation(e.target.value, data));
    } catch (err) {
      console.error("AQHI fetch failed:", err);
      aqhiValue.textContent = "Error";
      aqhiRisk.textContent = "Could not load AQHI";
    }
  }
  const workerBase = "https://purple-river-7d7a.trials-9f5.workers.dev/?feed=";
  const aqhiUrl = workerBase + "aqhi";
  // Pollutants: 24-hour data from new AQHI site (Nov 2025 revamp)
  // Direct: https://www.aqhi.gov.hk/epd/ddata/html/out/24pc_Eng.xml
  const pollutantUrl = workerBase + "pollutants";
  const weatherUrl = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en";
  const warningsUrl = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en";
  const windCsvProxyUrl = workerBase + "windcsv";
  const windCsvUrl = "https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_10min_wind.csv";
  const pressureCsvProxyUrl = workerBase + "pressure";
  const pressureCsvUrl = "https://data.weather.gov.hk/weatherAPI/hko_data/regional-weather/latest_1min_pressure.csv";
  const visCsvProxyUrl = workerBase + "visibility";
  const visCsvUrl = "https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=LTMV&lang=en&rformat=csv";

const stationWeatherMap = {
    // Only 4 visibility stations: Central, Chek Lap Kok, Sai Wan Ho, Waglan Island
    // Mapping generously based on geographic proximity
    "Central/Western": { tempPlace: "Hong Kong Observatory", rainPlace: "Central & Western District", windPlace: "Central Pier", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Central": { tempPlace: "Hong Kong Observatory", rainPlace: "Central & Western District", windPlace: "Central Pier", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Eastern": { tempPlace: "King's Park", rainPlace: "Eastern District", windPlace: "North Point", pressurePlace: "HK Observatory", visPlace: "Sai Wan Ho" },
    "Islands": { tempPlace: "Chek Lap Kok", rainPlace: "Islands District", windPlace: "Chek Lap Kok", pressurePlace: "Chek Lap Kok", visPlace: "Chek Lap Kok" },
    "North": { tempPlace: "Ta Kwu Ling", rainPlace: "North District", windPlace: "Ta Kwu Ling", pressurePlace: "Ta Kwu Ling", visPlace: "Sai Wan Ho" },
    "Sai Kung": { tempPlace: "Sai Kung", rainPlace: "Sai Kung", windPlace: "Sai Kung", pressurePlace: "HK Observatory", visPlace: "Sai Wan Ho" },
    "Sha Tin": { tempPlace: "Sha Tin", rainPlace: "Sha Tin", windPlace: "Sha Tin", pressurePlace: "Sha Tin", visPlace: "Sai Wan Ho" },
    "Southern": { tempPlace: "Wong Chuk Hang", rainPlace: "Southern District", windPlace: "Wong Chuk Hang", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Tai Po": { tempPlace: "Tai Po", rainPlace: "Tai Po", windPlace: "Tai Po Kau", pressurePlace: "Tai Po", visPlace: "Sai Wan Ho" },
    "Tsuen Wan": { tempPlace: "Tsuen Wan Shing Mun Valley", rainPlace: "Tsuen Wan", windPlace: "Tsing Yi", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Tuen Mun": { tempPlace: "Tuen Mun", rainPlace: "Tuen Mun", windPlace: "Tuen Mun", pressurePlace: "Lau Fau Shan", visPlace: "Chek Lap Kok" },
    "Wan Chai": { tempPlace: "Happy Valley", rainPlace: "Wan Chai", windPlace: "Star Ferry", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Yuen Long": { tempPlace: "Yuen Long Park", rainPlace: "Yuen Long", windPlace: "Wetland Park", pressurePlace: "Wetland Park", visPlace: "Chek Lap Kok" },
    "Yau Tsim Mong": { tempPlace: "King's Park", rainPlace: "Yau Tsim Mong", windPlace: "King's Park", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Kowloon City": { tempPlace: "Kowloon City", rainPlace: "Kowloon City", windPlace: "Kai Tak", pressurePlace: "HK Observatory", visPlace: "Sai Wan Ho" },
    "Sham Shui Po": { tempPlace: "Sham Shui Po", rainPlace: "Sham Shui Po", windPlace: "King's Park", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Wong Tai Sin": { tempPlace: "Wong Tai Sin", rainPlace: "Wong Tai Sin", windPlace: "Tate's Cairn", pressurePlace: "HK Observatory", visPlace: "Sai Wan Ho" },
    "Kwun Tong": { tempPlace: "Kwun Tong", rainPlace: "Kwun Tong", windPlace: "Kai Tak", pressurePlace: "HK Observatory", visPlace: "Sai Wan Ho" },
    // Additional AQHI stations
    "Kwai Chung": { tempPlace: "Tsing Yi", rainPlace: "Kwai Tsing", windPlace: "Tsing Yi", pressurePlace: "HK Observatory", visPlace: "Central" },
    "Tseung Kwan O": { tempPlace: "Tseung Kwan O", rainPlace: "Sai Kung", windPlace: "Tseung Kwan O", pressurePlace: "HK Observatory", visPlace: "Sai Wan Ho" },
    "Tung Chung": { tempPlace: "Chek Lap Kok", rainPlace: "Islands District", windPlace: "Chek Lap Kok", pressurePlace: "Chek Lap Kok", visPlace: "Chek Lap Kok" },
    "Tap Mun": { tempPlace: "Tap Mun", rainPlace: "North District", windPlace: "Tap Mun", pressurePlace: "HK Observatory", visPlace: "Waglan Island" },
    "Causeway Bay": { tempPlace: "Happy Valley", rainPlace: "Wan Chai", windPlace: "North Point", pressurePlace: "HK Observatory", visPlace: "Sai Wan Ho" },
    "Mong Kok": { tempPlace: "King's Park", rainPlace: "Yau Tsim Mong", windPlace: "King's Park", pressurePlace: "HK Observatory", visPlace: "Central" }
};


  // DOM references
  const compactToggle = document.getElementById("compactToggle");
  const compactIcon = document.getElementById("compactIcon");
  const pollutantSection = document.getElementById("pollutantSection");
  compactToggle.addEventListener("click", function() {
    document.body.classList.toggle("compact-mode");
    const isCompact = document.body.classList.contains("compact-mode");
    pollutantSection.style.display = isCompact ? "none" : "";
    compactIcon.innerHTML = isCompact ? "&#x25BC;" : "&#x25B2;";
  });
  // On load, ensure correct state
  if(document.body.classList.contains("compact-mode")){
    pollutantSection.style.display = "none";
    compactIcon.innerHTML = "&#x25BC;";
  }
  const select = document.getElementById("stationSelect");
  const warningsContainer = document.getElementById("warningsContainer");
  const aqhiValue = document.getElementById("aqhiValue");
  const aqhiRisk = document.getElementById("aqhiRisk");
  const lastUpdated = document.getElementById("lastUpdated");

  const tempValue = document.getElementById("tempValue");
  const tempPill = document.getElementById("tempPill");
  const humidityValue = document.getElementById("humidityValue");
  const humPill = document.getElementById("humPill");
  const uvValue = document.getElementById("uvValue");
  const uvDesc = document.getElementById("uvDesc");
  const uvPill = document.getElementById("uvPill");
  const rainValue = document.getElementById("rainValue");
  const rainPill = document.getElementById("rainPill");
  const weatherUpdated = document.getElementById("weatherUpdated");
  // Wind & visibility DOM
  const windSpeedValue = document.getElementById("windSpeedValue");
  const windPill = document.getElementById("windPill");
  const windArrowEl = document.getElementById("windArrow");
  const windArrowRotEl = document.getElementById("windArrowRot");
  const windDirText = document.getElementById("windDirText");
  const visibilityValue = document.getElementById("visibilityValue");
  const visPill = document.getElementById("visPill");
  // Activity DOM
  const activityList = document.getElementById("activityList");
  // CSV caches
  let windCsvCache = { ts: 0, rows: [] };
  let pressureCsvCache = { ts: 0, rows: [] };
  let visCsvCache = { ts: 0, rows: [] };

  function parseWindDirectionWord(word){
    if (!word) return null;
    const map = {
      'NORTH':'N',
      'NORTH-NORTHEAST':'NNE',
      'NORTHEAST':'NE',
      'EAST-NORTHEAST':'ENE',
      'EAST':'E',
      'EAST-SOUTHEAST':'ESE',
      'SOUTHEAST':'SE',
      'SOUTH-SOUTHEAST':'SSE',
      'SOUTH':'S',
      'SOUTH-SOUTHWEST':'SSW',
      'SOUTHWEST':'SW',
      'WEST-SOUTHWEST':'WSW',
      'WEST':'W',
      'WEST-NORTHWEST':'WNW',
      'NORTHWEST':'NW',
      'NORTH-NORTHWEST':'NNW',
      'VARIABLE': null
    };
    const key = String(word).toUpperCase().replace(/\s+/g,'-');
    return map[key] ?? null;
  }

  async function fetchWindCsv(){
    const now = Date.now();
    if (now - windCsvCache.ts < 5*60*1000 && windCsvCache.rows.length) return windCsvCache.rows;
    let csv = '';
    try {
      // Try proxy (CORS-friendly)
      let res = await fetch(windCsvProxyUrl, { cache: 'no-store', headers: { 'Accept': 'text/csv' } });
      if (!res.ok) throw new Error('Proxy not OK');
      csv = await res.text();
    } catch (e) {
      // Fallback to direct (may fail under CORS in local dev)
      const res2 = await fetch(windCsvUrl, { cache: 'no-store', headers: { 'Accept': 'text/csv' } });
      csv = await res2.text();
    }
    const lines = csv.trim().split(/\r?\n/);
    const rows = [];
    for (let i=0;i<lines.length;i++){
      if (i===0 && /Automatic Weather Station/i.test(lines[0])) continue; // header
      const parts = lines[i].split(',');
      if (parts.length < 5) continue;
      const dt = parts[0].trim();
      const station = parts[1].trim();
      const dirWord = parts[2].trim();
      const mean = Number(parts[3].trim());
      const gust = Number(parts[4].trim());
      rows.push({ dt, station, dirWord, mean, gust });
    }
    windCsvCache = { ts: now, rows };
    return rows;
  }

  async function applyWindFromCsv(aqhiStation){
    try{
      const rows = await fetchWindCsv();
      const mapping = stationWeatherMap[aqhiStation] || {};
      const target = mapping.windPlace;
      if (!target){
        return; // no mapping, leave existing values
      }
      const rec = rows.find(r => r.station.toLowerCase() === String(target).toLowerCase());
      if (!rec){
        // try a looser contains match
        const recLoose = rows.find(r => r.station.toLowerCase().includes(String(target).toLowerCase()));
        if (!recLoose) return;
        updateWindUi(recLoose);
      } else {
        updateWindUi(rec);
      }
    } catch(e){
      console.warn('Wind CSV load failed', e);
    }
  }

  function updateWindUi(rec){
    const abbr = parseWindDirectionWord(rec.dirWord);
    windSpeedValue.textContent = isNaN(rec.mean)? '—' : rec.mean;
    windPill.style.backgroundColor = setColour(rec.mean, [9, 19, 39, 59, 9999], ["#86efac", "#4ade80", "#fde68a", "#fca5a5", "#f87171"]);
    if (abbr){
      const deg = compassToDeg(abbr);
      if (!isNaN(deg)){
        windArrowEl.style.opacity = '1';
        const target = windArrowRotEl || windArrowEl;
        target.style.transform = `rotate(${deg}deg)`;
      }
      windDirText.textContent = abbr;
    } else {
      windArrowEl.style.opacity = '0.5';
      windDirText.textContent = rec.dirWord || '—';
    }
  }

  // Pressure CSV fetching
  async function fetchPressureCsv(){
    const now = Date.now();
    if (now - pressureCsvCache.ts < 5*60*1000 && pressureCsvCache.rows.length) return pressureCsvCache.rows;
    let csv = '';
    try {
      // Try proxy (CORS-friendly)
      let res = await fetch(pressureCsvProxyUrl, { cache: 'no-store', headers: { 'Accept': 'text/csv' } });
      if (!res.ok) throw new Error('Proxy not OK');
      csv = await res.text();
    } catch (e) {
      // Fallback to direct (may fail under CORS in local dev)
      const res2 = await fetch(pressureCsvUrl, { cache: 'no-store', headers: { 'Accept': 'text/csv' } });
      csv = await res2.text();
    }
    const lines = csv.trim().split(/\r?\n/);
    const rows = [];
    for (let i=0;i<lines.length;i++){
      if (i===0 && /Automatic Weather Station/i.test(lines[0])) continue; // header
      const parts = lines[i].split(',');
      if (parts.length < 3) continue;
      const dt = parts[0].trim();
      const station = parts[1].trim();
      const pressure = Number(parts[2].trim());
      rows.push({ dt, station, pressure });
    }
    pressureCsvCache = { ts: now, rows };
    return rows;
  }

  async function applyPressureFromCsv(aqhiStation){
    try{
      const rows = await fetchPressureCsv();
      const mapping = stationWeatherMap[aqhiStation] || {};
      const target = mapping.pressurePlace;
      if (!target){
        return; // no mapping, leave existing values
      }
      const rec = rows.find(r => r.station.toLowerCase() === String(target).toLowerCase());
      if (!rec){
        // try a looser contains match
        const recLoose = rows.find(r => r.station.toLowerCase().includes(String(target).toLowerCase()));
        if (!recLoose) return;
        updatePressureUi(recLoose);
      } else {
        updatePressureUi(rec);
      }
    } catch(e){
      console.warn('Pressure CSV load failed', e);
    }
  }

  function updatePressureUi(rec){
    pressureValue.textContent = isNaN(rec.pressure)? '—' : rec.pressure.toFixed(1);
    // Pressure coloring: Low (<1010), Normal (1010-1020), High (>1020)
    if (rec.pressure < 1010) {
      pressurePill.style.backgroundColor = "#fbbf24"; // Amber - low pressure (storm approaching)
    } else if (rec.pressure > 1020) {
      pressurePill.style.backgroundColor = "#4ade80"; // Green-400 - high pressure (fair weather)
    } else {
      pressurePill.style.backgroundColor = "#d1d5db"; // Gray-300 - normal
    }
  }

  // Visibility CSV fetching
  async function fetchVisibilityCsv(){
    const now = Date.now();
    if (now - visCsvCache.ts < 5*60*1000 && visCsvCache.rows.length) return visCsvCache.rows;
    let csv = '';
    try {
      // Try proxy (CORS-friendly)
      let res = await fetch(visCsvProxyUrl, { cache: 'no-store', headers: { 'Accept': 'text/csv' } });
      if (!res.ok) throw new Error('Proxy not OK');
      csv = await res.text();
    } catch (e) {
      // Fallback to direct (may fail under CORS in local dev)
      const res2 = await fetch(visCsvUrl, { cache: 'no-store', headers: { 'Accept': 'text/csv' } });
      csv = await res2.text();
    }
    const lines = csv.trim().split(/\r?\n/);
    const rows = [];
    for (let i=0;i<lines.length;i++){
      if (i===0 && /Automatic Weather Station/i.test(lines[0])) continue; // header
      const parts = lines[i].split(',');
      if (parts.length < 3) continue;
      const dt = parts[0].trim();
      const station = parts[1].trim().replace(/^"|"$/g, ''); // Remove quotes
      const visStr = parts[2].trim().replace(/^"|"$/g, '').replace(' km', ''); // Remove quotes and " km"
      const visibility = Number(visStr);
      rows.push({ dt, station, visibility });
    }
    visCsvCache = { ts: now, rows };
    return rows;
  }

  async function applyVisibilityFromCsv(aqhiStation){
    try{
      const rows = await fetchVisibilityCsv();
      const mapping = stationWeatherMap[aqhiStation] || {};
      const target = mapping.visPlace;
      if (!target){
        return; // no mapping, leave existing values
      }
      const rec = rows.find(r => r.station.toLowerCase() === String(target).toLowerCase());
      if (!rec){
        // try a looser contains match
        const recLoose = rows.find(r => r.station.toLowerCase().includes(String(target).toLowerCase()));
        if (!recLoose) return;
        updateVisibilityUi(recLoose);
      } else {
        updateVisibilityUi(rec);
      }
    } catch(e){
      console.warn('Visibility CSV load failed', e);
    }
  }

  function updateVisibilityUi(rec){
    visibilityValue.textContent = isNaN(rec.visibility)? '—' : rec.visibility;
    visPill.style.backgroundColor = setColour(rec.visibility, [3, 5, 8, 12, 9999], ["#fca5a5", "#fde68a", "#86efac", "#4ade80", "#22c55e"]);
  }

  const no2Value = document.getElementById("no2Value");
  const no2Pill = document.getElementById("no2Pill");
  const o3Value = document.getElementById("o3Value");
  const o3Pill = document.getElementById("o3Pill");
  const so2Value = document.getElementById("so2Value");
  const so2Pill = document.getElementById("so2Pill");
  const coValue = document.getElementById("coValue");
  const coPill = document.getElementById("coPill");
  const pm10Value = document.getElementById("pm10Value");
  const pm10Pill = document.getElementById("pm10Pill");
  const pm25Value = document.getElementById("pm25Value");
  const pm25Pill = document.getElementById("pm25Pill");
  const pollutantUpdated = document.getElementById("pollutantUpdated");
  // Additional layers DOM
  const pollenValue = document.getElementById("pollenValue");
  const pollenPill = document.getElementById("pollenPill");
  const pressureValue = document.getElementById("pressureValue");
  const pressurePill = document.getElementById("pressurePill");
  const beachQualityValue = document.getElementById("beachQualityValue");
  const beachPill = document.getElementById("beachPill");
  const layersUpdated = document.getElementById("layersUpdated");

  // --- Info modal wiring: make pills clickable and show contextual help ---
  const infoTargets = [
    { el: aqhiRisk, key: 'aqhi' },
    { el: no2Pill, key: 'no2' },
    { el: o3Pill, key: 'o3' },
    { el: so2Pill, key: 'so2' },
    { el: coPill, key: 'co' },
    { el: pm10Pill, key: 'pm10' },
    { el: pm25Pill, key: 'pm25' },
    { el: tempPill, key: 'temperature' },
    { el: humPill, key: 'humidity' },
    { el: uvPill, key: 'uv' },
    { el: rainPill, key: 'rainfall' },
    { el: windPill, key: 'wind' },
    { el: visPill, key: 'visibility' },
    { el: pressurePill, key: 'pressure' },
    { el: pollenPill, key: 'pollen' },
    { el: beachPill, key: 'beach' }
  ];
  infoTargets.forEach(t => {
    if (t.el) {
      t.el.classList.add('clickable-pill');
      t.el.addEventListener('click', () => showInfoModal(t.key));
    }
  });

  // Warning metadata
  const warningMetadata = {
  "WFIREY": { name: "Yellow Fire Danger Warning", icon: "🔥" },
  "WFIRER": { name: "Red Fire Danger Warning", icon: "🔥" },
  "WFIRE": { name: "Fire Danger Warning", icon: "🔥" },
  "WTYPHOON": { name: "Typhoon Warning", icon: "🌪️" },
  "WRAINSTORMY": { name: "Yellow Rainstorm Warning", icon: "🌧️" },
  "WRAINSTORMR": { name: "Red Rainstorm Warning", icon: "🌧️" },
  "WRAINSTORMB": { name: "Black Rainstorm Warning", icon: "🌧️" },
  "WRAINSTORM": { name: "Rainstorm Warning", icon: "🌧️" },
    "WUVI": { name: "High UV Warning", icon: "☀️" },
    "WSMOG": { name: "Smog Warning", icon: "💨" },
    "WSIGW": { name: "Significant Wave Warning", icon: "🌊" },
    "WTMW": { name: "Tsunami Warning", icon: "🌊" },
    "WCOLDRULE": { name: "Cold Weather Warning", icon: "❄️" },
    "WHOTULE": { name: "Hot Weather Warning", icon: "🌡️" },
    "WAIRPOL": { name: "Air Pollution Warning", icon: "💨" },
    "WLOWVIS": { name: "Low Visibility Warning", icon: "🌫️" },
    "WWIND": { name: "Wind Warning", icon: "💨" },
    "WMSGNL": { name: "Strong Monsoon Signal", icon: "💨" },
    "WTMW": { name: "Tsunami Warning", icon: "🌊" },
    "WTCSIGNAL": { name: "Tropical Cyclone Warning Signal", icon: "🌀" },
    "WTHUNDER": { name: "Thunderstorm Warning", icon: "⚡" },
    "WTS": { name: "Thunderstorm Warning", icon: "⚡" }
  };

  function getWarningIcon(type) {
    return warningMetadata[type]?.icon || "⚠️";
  }

  function getWarningName(type) {
  return warningMetadata[type]?.name || warningMetadata[type.replace(/.$/,"")]?.name || type;
  }

  function getWarningClass(typeCode) {
    // Extract color from code (e.g., "WFIREY" -> "Y" for Yellow)
    const lastChar = typeCode.slice(-1).toUpperCase();
    if (lastChar === "R") return "red";
    if (lastChar === "B") return "black";
    return "yellow"; // Default to yellow
  }

  function aqhiColor(val){
    const v = Number(val);
    if (v <= 3) return "#22c55e";
    if (v <= 6) return "#eab308";
    if (v === 7) return "#f97316";
    if (v <= 10) return "#ef4444";
    return "#7e22ce";
  }
  
  function setColour(value, checks, returns) {
  if (checks.length !== returns.length) {
    throw new Error("Checks and returns arrays must be the same length");
  }

  for (let i = 0; i < checks.length; i++) {
    if (value <= checks[i]) {
      return returns[i];
    }
  }

  // If value is greater than all thresholds, return the last one
  return returns[returns.length - 1];
}
  
  function normalizeStationName(name){
  return String(name)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/-/g, " ")
    .replace(/district$/i, "")       // drop trailing "District"
    .replace(/(\(|（).*?(\)|）)/g, "")// drop bracketed qualifiers
    .replace(/&/g, "and")
    .replace(/\/+/g, "/");
}

  async function loadWarnings(){
    try {
      const res = await fetch(warningsUrl);
      const data = await res.json();

      // Filter out only active warnings (actionCode === "ISSUE")
      const activeWarnings = Object.entries(data)
        .filter(([key, warning]) => warning.actionCode === "ISSUE")
        .map(([key, warning]) => ({
          code: key,
          ...warning
        }));

      // Display warnings
      if (activeWarnings.length === 0) {
        warningsContainer.innerHTML = '<div class="no-warnings">✓ No active weather warnings</div>';
      } else {
        warningsContainer.innerHTML = activeWarnings.map(warning => {
          const warningClass = getWarningClass(warning.code);
          const name = getWarningName(warning.code);
          const issueTime = new Date(warning.issueTime).toLocaleString("en-HK", { hour12: false });
          let extra = "";
          // Show typhoon level if present
          if (warning.code.startsWith("WTCSIGNAL") || warning.code.startsWith("WTYPHOON")) {
            // Try to show type or name field as level
            if (warning.type) {
              extra = `<div class='warning-level'>Level: ${warning.type}</div>`;
            } else if (warning.name && warning.name.match(/No\.\s*\d+/i)) {
              extra = `<div class='warning-level'>${warning.name}</div>`;
            }
          }
          return `
            <div class="warning-item ${warningClass}">
              <img src="assets/${warning.code}.png" alt="${name}" class="warning-icon" onerror="this.style.display='none'" />
              <div class="warning-content">
                <div class="warning-title">${name}</div>
                ${extra}
                <div class="warning-time">Issued: ${issueTime}</div>
              </div>
            </div>
          `;
        }).join("");
      }
    } catch (err) {
      console.error("Warnings fetch failed:", err);
      warningsContainer.innerHTML = '<div class="no-warnings">Unable to load weather warnings</div>';
    }
  }

  async function loadAQHI(){
    try {
      const res = await fetch(aqhiUrl);
      const data = await res.json();

      select.innerHTML = "";
      data.forEach(station => {
        const opt = document.createElement("option");
        opt.value = station.station;
        opt.textContent = station.station;
        select.appendChild(opt);
      });

      select.value = data[0].station;
      updateStation(select.value, data);

      select.addEventListener("change", e => updateStation(e.target.value, data));
    } catch (err) {
      console.error("AQHI fetch failed:", err);
      aqhiValue.textContent = "Error";
      aqhiRisk.textContent = "Could not load AQHI";
    }
  }

  async function updateStation(stationName, data){
    const s = data.find(d => d.station === stationName);
    if (!s) return;
    
    // Flush historical values when station changes to avoid misleading trends
    previousAQHI = null;
    previousTemp = null;
    previousPollutants = {};
    
    const currentAQHI = s.aqhi ?? "—";
    
    // Add trend indicator
    const trendHTML = getTrendIndicator(currentAQHI, previousAQHI);
    aqhiValue.innerHTML = currentAQHI + trendHTML;
    // Store numeric AQHI for other modules (avoid parsing from decorated text)
    if (!isNaN(Number(currentAQHI))) {
      aqhiValue.dataset.aqhi = String(currentAQHI);
    } else {
      delete aqhiValue.dataset.aqhi;
    }
    aqhiValue.style.color = aqhiColor(currentAQHI);
    
    aqhiRisk.textContent = s.health_risk ?? "—";
    aqhiRisk.style.backgroundColor = aqhiColor(currentAQHI);
    lastUpdated.textContent = "Last updated: " + (s.publish_date ? new Date(s.publish_date).toLocaleString("en-HK",{hour12:false}) : "—");
    
    // Update health advice
    getHealthAdvice(currentAQHI);
    
    // Store current value for next comparison
    previousAQHI = currentAQHI;

    updatePollutants(stationName);
    loadWeather(stationName);
  }


async function loadWeather(stationName){
  try {
    const res = await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en");
    const text = await res.text();
    const weatherData = JSON.parse(text);

    const mapping = stationWeatherMap[stationName] || { tempPlace: "Hong Kong Observatory", rainPlace: "Central & Western District" };

  const temp = weatherData.temperature?.data?.find(d => d.place === mapping.tempPlace);
  const rain = weatherData.rainfall?.data?.find(d => d.place === mapping.rainPlace);
  const wind = weatherData.wind || weatherData.wind?.data?.[0] || null;
  const visibility = weatherData.visibility?.data?.[0] || weatherData.visibility || null;
  const visVal = (typeof visibility?.value === 'number') ? visibility.value : (typeof visibility?.km === 'number') ? visibility.km : null;
  const pressure = weatherData.pressure?.data?.[0] || weatherData.pressure || null;

    // Humidity: single entry
    const humidity = weatherData.humidity?.data?.[0];
    humidityValue.textContent = humidity?.value ?? "No reading";
      humPill.style.backgroundColor = setColour(humidity.value, [25, 30, 60 ,70, 9999], ["#caefff", "#99e5ff", "#66cbff", "#2cb4fe", "#0099ff"]);


    // UV index: single entry
    const uv = weatherData.uvindex?.data?.[0];
    uvValue.textContent = uv?.value ?? "No reading";
    uvDesc.textContent = uv?.desc ?? "";
	if (uv?.value)      uvPill.style.backgroundColor = setColour(uv.value, [2, 5, 7,10, 9999], ["#67be4d", "#fcbc22", "#f66b33", "#ed164a", "#7e4399"]);

    const currentTemp = temp?.value ?? "—";
    const tempTrend = getTrendIndicator(currentTemp, previousTemp);
    tempValue.innerHTML = currentTemp + tempTrend;
    tempPill.style.backgroundColor = setColour(temp?.value, [-32, -12, 0 ,16 , 29, 9999], ["#059bfc", "#7ed8fe", "#35fd63", "#fce26b", "#fe9e01", "#ff0304"]);
    
  const rainMax = (typeof rain?.max === "number") ? rain.max : null;
  rainValue.textContent = (rainMax ?? "—");
    rainPill.style.backgroundColor = setColour(rain?.max, [1, 29, 50, 70, 9999], ["#fedf68", "#7bdafc", "#f66b33", "#ed164a", "#000000"]);
    // Wind
    const windSpeed = (typeof wind?.speed === 'number') ? wind.speed : (typeof wind?.speed?.value === 'number') ? wind.speed.value : null;
    const windDir = wind?.direction?.value || wind?.direction || wind?.compassDirection || null;
    if (windSpeed != null) {
      windSpeedValue.textContent = windSpeed;
      windPill.style.backgroundColor = setColour(windSpeed, [9, 19, 39, 59, 9999], ["#86efac", "#4ade80", "#fde68a", "#fca5a5", "#f87171"]);
    } else {
      windSpeedValue.textContent = "—";
    }
    const deg = compassToDeg(windDir);
    if (!isNaN(deg)) {
      const target = windArrowRotEl || windArrowEl;
      target.style.transform = `rotate(${deg}deg)`;
    }
    windDirText.textContent = windDir || "—";

  // Override wind with CSV station-specific reading
    applyWindFromCsv(stationName);

    // Override pressure with CSV station-specific reading
    applyPressureFromCsv(stationName);

    // Override visibility with CSV station-specific reading
    applyVisibilityFromCsv(stationName);

    // Update recommendations (use CSV-updated values where available)
    updateActivityRecommendations({
      rain: rainMax ?? 0,
      aqhi: (!isNaN(Number(aqhiValue.dataset?.aqhi))) ? Number(aqhiValue.dataset.aqhi) : (Number(String(aqhiValue.textContent).match(/\d+/)?.[0]) || null),
      uv: Number(uvValue.textContent) || null,
      humidity: Number(humidityValue.textContent) || null,
      windSpeed: (typeof windSpeedValue.textContent === 'string' ? Number(windSpeedValue.textContent) : windSpeed) ?? null,
      visibility: (typeof visibilityValue.textContent === 'string' && visibilityValue.textContent !== '—') ? Number(visibilityValue.textContent) : (visVal ?? null)
    });
    
    // Store temperature for trend comparison
    previousTemp = currentTemp;       
    weatherUpdated.textContent = "Last updated: " + (
      weatherData.updateTime
        ? new Date(weatherData.updateTime).toLocaleString("en-HK", { hour12: false })
        : "—"
    );

    // Pollen (seasonal: dormant Nov–Feb)
    pollenPill.style.background = "#f3f4f6";

    // Beach water quality (seasonal: off-season Nov–Mar)
    beachPill.style.background = "#f3f4f6";
  } catch (err) {
    console.error("Weather fetch failed:", err);
    tempValue.textContent = humidityValue.textContent = uvValue.textContent = rainValue.textContent = "Error";
    uvDesc.textContent = "Error";
    weatherUpdated.textContent = "Weather data unavailable";
  }
}

// Convert compass direction to degrees (N=0, E=90, S=180, W=270)
function compassToDeg(dir){
  if (!dir) return NaN;
  const d = String(dir).toUpperCase();
  const map = {N:0, NE:45, ENE:67.5, E:90, ESE:112.5, SE:135, SSE:157.5, S:180, SSW:202.5, SW:225, WSW:247.5, W:270, WNW:292.5, NW:315, NNW:337.5};
  return map[d] ?? map[d.replace(/[^A-Z]/g,'')] ?? NaN;
}

// Activity recommendation logic
function updateActivityRecommendations(ctx){
  if (!activityList) return;
  const items = [
    { key: 'hike', label: 'Go hiking', icon: 'hiking.png', weight: 1 },
    { key: 'beach', label: 'Go to the beach', icon: 'gotobeach.png', weight: 1 },
    { key: 'exercise', label: 'Exercise outdoors', icon: 'exercise.png', weight: 1 },
    { key: 'laundry', label: 'Hang laundry', icon: 'laundry.png', weight: 1 },
    { key: 'carwash', label: 'Wash the car', icon: 'carwash.png', weight: 1 }
  ];

  function scoreGoodness(){
    const rain = ctx.rain ?? 0; // mm last hour
    const aqhi = ctx.aqhi ?? 0; // 1-10+
    const uv = ctx.uv ?? 0;
    const hum = ctx.humidity ?? 50;
    const wind = ctx.windSpeed ?? 5;
    const vis = ctx.visibility ?? 10;
    return { rain, aqhi, uv, hum, wind, vis };
  }
  const s = scoreGoodness();

  function badge(state){
    if (state==='good') return '<span class="activity-badge badge-good">Good</span>';
    if (state==='caution') return '<span class="activity-badge badge-caution">Caution</span>';
    return '<span class="activity-badge badge-avoid">Avoid</span>';
  }
  function decideHike(){
    if (s.rain >= 1 || s.vis < 5 || s.aqhi >= 8 || s.thunder) return {state:'avoid', reason:'Rain/low visibility or high AQHI'};
    if (s.uv >= 8 || s.hum >= 85) return {state:'caution', reason:'High UV or humidity'};
    return {state:'good', reason:'Clear and suitable conditions'};
  }
  function decideBeach(){
    if (s.rain >= 1 || s.uv >= 10) return {state:'avoid', reason:'Rain or extreme UV'};
    if (s.aqhi >= 8) return {state:'caution', reason:'High AQHI may affect sensitive groups'};
    return {state:'good', reason:'UV manageable and no rain'};
  }
  function decideExercise(){
    if (s.aqhi >= 8 || s.rain >= 1) return {state:'avoid', reason:'High AQHI or rain'};
    if (s.hum >= 85 || s.uv >= 8) return {state:'caution', reason:'High humidity or UV'};
    return {state:'good', reason:'Comfortable conditions'};
  }
  function decideLaundry(){
    if (s.rain >= 1 || s.hum >= 90) return {state:'avoid', reason:'Rain or very high humidity'};
    if (s.hum >= 80) return {state:'caution', reason:'Slow drying due to humidity'};
    return {state:'good', reason:'Dry conditions'};
  }
  function decideCarwash(){
    if (s.rain >= 1) return {state:'avoid', reason:'Rain likely to return'};
    if (s.rain > 0) return {state:'caution', reason:'Recent rain'};
    return {state:'good', reason:'Low chance of rain'};
  }

  const decisions = [
    {label:'Go hiking', icon:'hiking.png', ...decideHike()},
    {label:'Go to the beach', icon:'gotobeach.png', ...decideBeach()},
    {label:'Exercise outdoors', icon:'exercise.png', ...decideExercise()},
    {label:'Hang laundry', icon:'laundry.png', ...decideLaundry()},
    {label:'Wash the car', icon:'carwash.png', ...decideCarwash()},
  ];

  activityList.innerHTML = decisions.map(d => `
    <div class="activity-item">
      <div class="activity-left">
        <img src="assets/${d.icon}" alt="${d.label}" class="activity-icon" />
        <div>
          <div class="activity-label">${d.label}</div>
          <div class="activity-reason">${d.reason}</div>
        </div>
      </div>
      <div>${badge(d.state)}</div>
    </div>
  `).join('');
}

  // --- Pollutants ---
  function calculateAverage(records, tagName) {
    const values = records
      .map(r => {
        const val = r.getElementsByTagName(tagName)[0]?.textContent;
        return val && val !== '-' ? parseFloat(val) : null;
      })
      .filter(v => v !== null && !isNaN(v));
    
    if (values.length === 0) return null;
    return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1);
  }

  async function updatePollutants(stationName){
    try {
      const res = await fetch(pollutantUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      // Check for XML parse errors
      const parseError = xmlDoc.querySelector("parsererror");
      if (parseError) {
        throw new Error("XML parse error");
      }

      const records = Array.from(xmlDoc.getElementsByTagName("PollutantConcentration"))
        .filter(node => node.getElementsByTagName("StationName")[0]?.textContent === stationName);

      if (records.length === 0) {
        throw new Error("No data for selected station");
      }

      const latest = records[records.length - 1];
      
      // NO2 - Latest only
      const no2 = latest.getElementsByTagName("NO2")[0]?.textContent ?? "—";
      no2Value.innerHTML = no2 + getTrendIndicator(no2, previousPollutants.no2);
      no2Pill.style.backgroundColor = setColour(no2, [40, 90, 120, 230, 340, 9999], ["#7cdded", "#7bda72", "#f0c42d", "#ec2c45", "#960232", "#512771"]);
      previousPollutants.no2 = no2;
      
      // O3 - Latest only
      const o3 = latest.getElementsByTagName("O3")[0]?.textContent ?? "—";
      o3Value.innerHTML = o3 + getTrendIndicator(o3, previousPollutants.o3);
      o3Pill.style.backgroundColor = setColour(o3, [50, 100, 130, 240, 380, 9999], ["#7cdded", "#7bda72", "#f0c42d", "#ec2c45", "#960232", "#512771"]);
      previousPollutants.o3 = o3;
      
      // SO2 - Latest only
      const so2 = latest.getElementsByTagName("SO2")[0]?.textContent ?? "—";
      so2Value.innerHTML = so2 + getTrendIndicator(so2, previousPollutants.so2);
      so2Pill.style.backgroundColor = setColour(so2, [100, 200, 350, 500, 750, 9999], ["#7cdded", "#7bda72", "#f0c42d", "#ec2c45", "#960232", "#512771"]);
      previousPollutants.so2 = so2;
      
      // CO - Latest only
      const co = latest.getElementsByTagName("CO")[0]?.textContent ?? "—";
      coValue.innerHTML = co + getTrendIndicator(co, previousPollutants.co);
      if(co != "-")
          coPill.style.backgroundColor = setColour(co, [4000, 20000, 35000, 50000, 75000, 999999999999], ["#7cdded", "#7bda72", "#f0c42d", "#ec2c45", "#960232", "#512771"]);
      previousPollutants.co = co;
      
      // PM10 - Latest only
      const pm10 = latest.getElementsByTagName("PM10")[0]?.textContent ?? "—";
      pm10Value.innerHTML = pm10 + getTrendIndicator(pm10, previousPollutants.pm10);
      pm10Pill.style.backgroundColor = setColour(pm10, [20, 40, 50, 100, 150, 9999], ["#7cdded", "#7bda72", "#f0c42d", "#ec2c45", "#960232", "#512771"]);
      previousPollutants.pm10 = pm10;
      
      // PM2.5 - Latest only
      const pm25 = latest.getElementsByTagName("PM2.5")[0]?.textContent ?? "—";
      pm25Value.innerHTML = pm25 + getTrendIndicator(pm25, previousPollutants.pm25);
      pm25Pill.style.backgroundColor = setColour(pm25, [10, 20, 25, 50, 75, 9999], ["#7cdded", "#7bda72", "#f0c42d", "#ec2c45", "#960232", "#512771"]);
      previousPollutants.pm25 = pm25;
      
      pollutantUpdated.textContent = "Last updated: " + (latest.getElementsByTagName("DateTime")[0]?.textContent ?? "—");
    } catch (err) {
      console.warn("Pollutant fetch failed:", err.message || err);
      // Set graceful unavailable state
      no2Value.textContent = "—";
      o3Value.textContent = "—";
      so2Value.textContent = "—";
      coValue.textContent = "—";
      pm10Value.textContent = "—";
      pm25Value.textContent = "—";
      no2Pill.style.backgroundColor = "#e5e7eb";
      o3Pill.style.backgroundColor = "#e5e7eb";
      so2Pill.style.backgroundColor = "#e5e7eb";
      coPill.style.backgroundColor = "#e5e7eb";
      pm10Pill.style.backgroundColor = "#e5e7eb";
      pm25Pill.style.backgroundColor = "#e5e7eb";
      pollutantUpdated.textContent = "Data temporarily unavailable";
    }
  }

  // Run all loaders initially
  await loadWarnings();
  await loadAQHI();

  // Auto-refresh every 15 minutes (900000 ms)
  setInterval(async () => {
    console.log('Auto-refreshing data...');
    await loadWarnings();
    await loadAQHI(); // This triggers updateStation which loads weather and pollutants
    forecastData = null; // Clear cached forecast data to get fresh data
  }, 900000);
})();

// Global variables for modal and chart
let forecastChart = null;
let forecastData = null;

// Global variables for tracking previous values (for trend indicators)
let previousAQHI = null;
let previousTemp = null;
let previousPollutants = {};

// Fetch 9-day forecast data
async function fetchForecastData() {
  if (forecastData) return forecastData; // Cache the data
  
  try {
    const res = await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en");
    forecastData = await res.json();
    return forecastData;
  } catch (err) {
    console.error("Forecast fetch failed:", err);
    return null;
  }
}

// Show forecast modal with chart
async function showForecast(type) {
  const modal = document.getElementById("forecastModal");
  const modalTitle = document.getElementById("modalTitle");
  const canvas = document.getElementById("forecastChart");
  // Ensure Chart.js is loaded
  try {
    if (!window.Chart && window.chartReadyPromise) {
      await window.chartReadyPromise;
    }
  } catch (e) {
    console.error('Chart.js not available:', e);
    modalTitle.textContent = 'Charts unavailable (Chart.js failed to load)';
    modal.classList.add('show');
    return;
  }
  
  // Show loading
  modalTitle.textContent = "Loading forecast...";
  modal.classList.add("show");
  
  const data = await fetchForecastData();
  if (!data || !data.weatherForecast) {
    modalTitle.textContent = "Error loading forecast";
    return;
  }
  
  const forecast = data.weatherForecast;
  const dates = forecast.map(f => f.week);
  
  let chartData, chartLabel, chartColor, yAxisLabel;
  
  if (type === 'temperature') {
    chartData = {
      max: forecast.map(f => f.forecastMaxtemp.value),
      min: forecast.map(f => f.forecastMintemp.value)
    };
    chartLabel = { max: 'Max Temperature (°C)', min: 'Min Temperature (°C)' };
    chartColor = { max: '#ef4444', min: '#3b82f6' };
    yAxisLabel = 'Temperature (°C)';
    modalTitle.textContent = '9-Day Temperature Forecast';
  } else if (type === 'humidity') {
    chartData = {
      max: forecast.map(f => f.forecastMaxrh.value),
      min: forecast.map(f => f.forecastMinrh.value)
    };
    chartLabel = { max: 'Max Humidity (%)', min: 'Min Humidity (%)' };
    chartColor = { max: '#0099ff', min: '#66cbff' };
    yAxisLabel = 'Humidity (%)';
    modalTitle.textContent = '9-Day Humidity Forecast';
  } else if (type === 'rainfall') {
    // For rainfall, we'll use PSR (Probability of Significant Rain)
    const psrMap = { 'Low': 20, 'Medium Low': 40, 'Medium': 50, 'Medium High': 70, 'High': 90 };
    chartData = {
      psr: forecast.map(f => psrMap[f.PSR] || 0)
    };
    chartLabel = { psr: 'Rain Probability (%)' };
    chartColor = { psr: '#3b82f6' };
    yAxisLabel = 'Probability (%)';
    modalTitle.textContent = '9-Day Rainfall Probability';
  }
  
  // Destroy existing chart
  if (forecastChart) {
    forecastChart.destroy();
  }
  
  // Create new chart
  const ctx = canvas.getContext('2d');
  
  const datasets = [];
  if (type === 'rainfall') {
    datasets.push({
      label: chartLabel.psr,
      data: chartData.psr,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: chartColor.psr,
      borderWidth: 2,
      fill: true,
      tension: 0.4
    });
  } else {
    datasets.push({
      label: chartLabel.max,
      data: chartData.max,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: chartColor.max,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    });
    datasets.push({
      label: chartLabel.min,
      data: chartData.min,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: chartColor.min,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    });
  }
  
  // Calculate y-axis range with buffer
  let yAxisConfig = {
    title: {
      display: true,
      text: yAxisLabel
    }
  };
  
  if (type === 'rainfall') {
    // Fixed range 0-100 for rainfall probability
    yAxisConfig.min = 0;
    yAxisConfig.max = 100;
  } else if (type === 'temperature') {
    // Add 5 degree buffer top and bottom
    const allTemps = [...chartData.max, ...chartData.min];
    const minTemp = Math.min(...allTemps);
    const maxTemp = Math.max(...allTemps);
    yAxisConfig.min = Math.floor(minTemp - 5);
    yAxisConfig.max = Math.ceil(maxTemp + 5);
  } else if (type === 'humidity') {
    // Add 10% buffer top and bottom
    const allHumidity = [...chartData.max, ...chartData.min];
    const minHum = Math.min(...allHumidity);
    const maxHum = Math.max(...allHumidity);
    yAxisConfig.min = Math.max(0, Math.floor(minHum - 10));
    yAxisConfig.max = Math.min(100, Math.ceil(maxHum + 10));
  }
  
  forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: yAxisConfig,
        x: {
          title: {
            display: true,
            text: 'Day of Week'
          }
        }
      }
    }
  });
}

// Close modal
function closeForecastModal() {
  const modal = document.getElementById("forecastModal");
  modal.classList.remove("show");
}

// Close modal when clicking outside
window.onclick = function(event) {
  const forecastModal = document.getElementById("forecastModal");
  const infoModal = document.getElementById("infoModal");
  if (event.target === forecastModal) {
    closeForecastModal();
  }
  if (event.target === infoModal) {
    closeInfoModal();
  }
};

// Health recommendations based on AQHI
function getHealthAdvice(aqhi) {
  const value = Number(aqhi);
  const healthAdviceEl = document.getElementById("healthAdvice");
  
  if (!healthAdviceEl || isNaN(value)) return;
  
  let icon = "";
  let advice = "";
  let color = "";
  
  if (value <= 3) {
    icon = "😊";
    advice = "Air quality is good. Ideal for all outdoor activities!";
    color = "#22c55e";
  } else if (value <= 6) {
    icon = "🙂";
    advice = "Air quality is moderate. Generally acceptable for most people.";
    color = "#eab308";
  } else if (value === 7) {
    icon = "😐";
    advice = "Air quality is unhealthy for sensitive groups. Consider reducing prolonged outdoor activities.";
    color = "#f97316";
  } else if (value <= 10) {
    icon = "😷";
    advice = "Air quality is unhealthy. Reduce outdoor physical exertion. Sensitive groups should stay indoors.";
    color = "#ef4444";
  } else {
    icon = "⚠️";
    advice = "Air quality is very unhealthy. Avoid all outdoor activities. Everyone should remain indoors.";
    color = "#7e22ce";
  }
  
  healthAdviceEl.innerHTML = `
    <span class="health-advice-icon">${icon}</span>
    <span class="health-advice-text">${advice}</span>
  `;
  healthAdviceEl.style.borderLeftColor = color;
}

// --- Info Modal (measure explanations) ---
const MEASURE_INFO = {
  aqhi: {
    title: 'AQHI — Air Quality Health Index',
    html: `<p>AQHI is a 1–10+ index summarizing overall air pollution and potential health risk.</p>
          <ul>
            <li><strong>1–3 (Low):</strong> Good for outdoor activities.</li>
            <li><strong>4–6 (Moderate):</strong> Generally acceptable.</li>
            <li><strong>7 (High):</strong> Sensitive groups reduce prolonged outdoor exertion.</li>
            <li><strong>8–10 (Very High):</strong> Reduce outdoor activities.</li>
            <li><strong>10+ (Serious):</strong> Avoid outdoor activities.</li>
          </ul>`
  },
  no2: { title: 'NO₂ — Nitrogen Dioxide (µg/m³)', html: `<p>Produced mainly from traffic and combustion. Higher levels can irritate airways.</p>` },
  o3:  { title: 'O₃ — Ozone (µg/m³)', html: `<p>Forms in sunlight from other pollutants. High ozone can cause throat and chest irritation.</p>` },
  so2: { title: 'SO₂ — Sulfur Dioxide (µg/m³)', html: `<p>From fuel sulfur. Elevated SO₂ may affect people with respiratory conditions.</p>` },
  co:  { title: 'CO — Carbon Monoxide (µg/m³)', html: `<p>Colorless gas from incomplete combustion. High concentrations reduce oxygen delivery.</p>` },
  pm10:{ title: 'PM₁₀ — Particles ≤10 µm (µg/m³)', html: `<p>Coarse particles (dust, sea salt). Higher values can reduce visibility and affect breathing.</p>` },
  pm25:{ title: 'PM₂.₅ — Fine particles ≤2.5 µm (µg/m³)', html: `<p>Fine particles penetrate deep into lungs. Lower is better for health.</p>` },
  temperature: { title: 'Temperature (°C)', html: `<p>Air temperature at station. Consider humidity and wind for heat/cold stress.</p>` },
  humidity:    { title: 'Humidity (%)', html: `<p>Relative humidity. Higher humidity makes temperatures feel warmer; low humidity feels drier.</p>` },
  uv:          { title: 'UV Index', html: `<p>Strength of sun UV radiation.</p><ul><li>0–2 Low</li><li>3–5 Moderate</li><li>6–7 High</li><li>8–10 Very High</li><li>11+ Extreme</li></ul>` },
  rainfall:    { title: 'Rainfall (mm)', html: `<p>Rainfall in the past hour at district station.</p>` },
  wind:        { title: 'Wind (km/h & direction)', html: `<p>Mean 10-min wind speed and direction. Higher wind disperses pollution but can feel cooler.</p>` },
  visibility:  { title: 'Visibility (km)', html: `<p>Horizontal visibility distance. Lower visibility can be due to mist, rain, or particles.</p>` },
  pressure:    { title: 'Air Pressure (hPa)', html: `<p>Sea-level adjusted pressure. Falling pressure often precedes unsettled weather.</p>` },
  pollen:      { title: 'Pollen Index', html: `<p>Seasonal. Indicates airborne pollen levels that can trigger allergies.</p>` },
  beach:       { title: 'Beach Water Quality', html: `<p>Seasonal ratings from EPD; available during swimming season.</p>` }
};

function showInfoModal(key){
  const modal = document.getElementById('infoModal');
  const titleEl = document.getElementById('infoModalTitle');
  const bodyEl = document.getElementById('infoModalBody');
  const info = MEASURE_INFO[key] || { title: 'About this reading', html: '<p>Details coming soon.</p>' };
  titleEl.textContent = info.title;
  bodyEl.innerHTML = info.html;
  modal.classList.add('show');
  // attach close button
  const closeBtn = document.getElementById('infoModalClose');
  if (closeBtn) closeBtn.onclick = closeInfoModal;
}

function closeInfoModal(){
  const modal = document.getElementById('infoModal');
  modal.classList.remove('show');
}

// --- Interactive Tutorial ---
const tutorialSteps = [
  {
    title: 'Welcome to HK Weather Dashboard! 👋',
    text: 'This quick tour will show you the interactive features. Click Next to continue.',
    target: null,
    position: 'center'
  },
  {
    title: 'Select Your Station',
    text: 'Choose from 17+ AQHI monitoring stations across Hong Kong to see localized readings.',
    target: '#stationSelect',
    position: 'bottom'
  },
  {
    title: 'Learn About Readings',
    text: 'Click any colored pill to learn what each measurement means and how to interpret it.',
    target: '#aqhiRisk',
    position: 'bottom'
  },
  {
    title: '9-Day Forecasts',
    text: 'Click temperature, humidity, or rainfall icons to view interactive 9-day forecast charts.',
    target: '.clickable-icon',
    position: 'bottom'
  },
  {
    title: 'Activity Recommendations',
    text: 'Check real-time suggestions for outdoor activities based on current conditions.',
    target: '#activityList',
    position: 'top'
  },
  {
    title: 'Share & Help',
    text: 'Share current conditions or restart this tour anytime using the buttons up top. Enjoy!',
    target: '#shareButton',
    position: 'bottom'
  }
];

let currentTutorialStep = 0;
let tutorialActive = false;

function startTutorial() {
  currentTutorialStep = 0;
  tutorialActive = true;
  const overlay = document.getElementById('tutorialOverlay');
  overlay.style.display = 'block';
  setTimeout(() => overlay.classList.add('active'), 10);
  showTutorialStep();
}

function showTutorialStep() {
  if (currentTutorialStep >= tutorialSteps.length) {
    endTutorial();
    return;
  }

  const step = tutorialSteps[currentTutorialStep];
  const tooltip = document.getElementById('tutorialTooltip');
  const title = document.getElementById('tutorialTitle');
  const text = document.getElementById('tutorialText');
  const nextBtn = document.getElementById('tutorialNext');
  const skipBtn = document.getElementById('tutorialSkip');

  title.textContent = step.title;
  text.textContent = step.text;

  // Clear previous highlights
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });

  // Remove previous arrow classes
  tooltip.className = 'tutorial-tooltip';

  if (step.target) {
    const target = document.querySelector(step.target);
    if (target) {
      target.classList.add('tutorial-highlight');
      positionTooltip(tooltip, target, step.position);
    }
  } else {
    // Center position for intro/outro
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
  }

  // Update button text for last step
  if (currentTutorialStep === tutorialSteps.length - 1) {
    nextBtn.textContent = 'Got it!';
  } else {
    nextBtn.textContent = 'Next';
  }

  // Wire up buttons
  nextBtn.onclick = () => {
    currentTutorialStep++;
    showTutorialStep();
  };
  skipBtn.onclick = endTutorial;
}

function positionTooltip(tooltip, target, position) {
  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let top, left;
  
  switch(position) {
    case 'top':
      top = rect.top - tooltipRect.height - 30;
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      tooltip.classList.add('arrow-bottom');
      break;
    case 'bottom':
      top = rect.bottom + 20;
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      tooltip.classList.add('arrow-top');
      break;
    case 'left':
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.left - tooltipRect.width - 30;
      tooltip.classList.add('arrow-right');
      break;
    case 'right':
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.right + 20;
      tooltip.classList.add('arrow-left');
      break;
    default:
      top = rect.bottom + 20;
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      tooltip.classList.add('arrow-top');
  }
  
  // Keep tooltip in viewport
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }
  if (top < 10) top = 10;
  
  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
  tooltip.style.transform = 'none';
}

function endTutorial() {
  tutorialActive = false;
  const overlay = document.getElementById('tutorialOverlay');
  overlay.classList.remove('active');
  setTimeout(() => {
    overlay.style.display = 'none';
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  }, 300);
  // Mark tutorial as seen
  localStorage.setItem('hkdash-tutorial-seen', 'true');
}

// Auto-start tutorial on first visit
window.addEventListener('load', () => {
  const tutorialSeen = localStorage.getItem('hkdash-tutorial-seen');
  if (!tutorialSeen) {
    setTimeout(startTutorial, 1000);
  }
});

// Get trend indicator
function getTrendIndicator(current, previous) {
  if (previous === null || current === null || current === "—" || previous === "—") return "";
  
  const curr = Number(current);
  const prev = Number(previous);
  
  if (isNaN(curr) || isNaN(prev)) return "";
  
  const diff = curr - prev;
  
  if (Math.abs(diff) < 0.1) {
    return '<span class="trend-indicator trend-neutral">⇳</span>';
  } else if (diff > 0) {
    return `<span class="trend-indicator trend-up">▲</span>`;
  } else {
    return `<span class="trend-indicator trend-down">▼</span>`;
  }
}

// Share weather function
async function shareWeather() {
  const station = document.getElementById("stationSelect").value;
  const aqhi = document.getElementById("aqhiValue").textContent;
  const temp = document.getElementById("tempValue").textContent;
  const humidity = document.getElementById("humidityValue").textContent;
  const risk = document.getElementById("aqhiRisk").textContent;
  
  const shareText = `🌤️ Hong Kong Weather - ${station}
  
📊 AQHI: ${aqhi} (${risk})
🌡️ Temperature: ${temp}°C
💧 Humidity: ${humidity}%

Check live conditions: ${window.location.href}

#HongKong #Weather #AirQuality`;

  // Try Web Share API first (mobile-friendly)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Hong Kong Weather Dashboard',
        text: shareText,
        url: window.location.href
      });
      console.log('Shared successfully');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Share failed:', err);
        fallbackShare(shareText);
      }
    }
  } else {
    fallbackShare(shareText);
  }
}

// Fallback share (copy to clipboard)
function fallbackShare(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show temporary notification
    const button = document.getElementById("shareButton");
    const originalText = button.innerHTML;
    button.innerHTML = '✓ Copied!';
    button.style.background = '#22c55e';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Could not copy to clipboard. Please try again.');
  });
}

