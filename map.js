// Initialize Leaflet map inside the #map container
const map = L.map('map').setView([41.6, 21.75], 8);

// Add OpenStreetMap tile layer (you can change this to any tile source)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Data store keyed by city name
let cityData = {};

// Load the CSV data using PapaParse
Papa.parse('data.csv', {
  download: true,
  header: true,
  complete: (results) => {
    results.data.forEach(row => {
      const cityName = row.City?.trim();
      if (cityName) {
        cityData[cityName] = row.StaffTable;
      }
    });

    // Once CSV is ready, load the GeoJSON
    fetch('macedonia-regions.geojson')
      .then(res => res.json())
      .then(geoData => {
        const geojson = L.geoJson(geoData, {
          style: {
            color: "#999",
            weight: 1,
            fillColor: "#cce5ff",
            fillOpacity: 0.7
          },
          onEachFeature: handleRegionFeature
        }).addTo(map);
      });
  }
});

// Function to run for each region feature
function handleRegionFeature(feature, layer) {
  const regionName = feature.properties.NAME_1?.trim();
  const tableData = cityData[regionName];

  layer.bindTooltip(regionName, {
    direction: 'top',
    sticky: true,
    offset: [0, -10],
    className: 'region-tooltip'
  });

  // Show staff table in the sidebar
  layer.on('click', () => {
    const content = tableData
      ? `<h3>${regionName}</h3>${tableData}`
      : `<h3>${regionName}</h3><em>Нема достапни податоци.</em>`;
    document.getElementById('region-details').innerHTML = content;
  });

  // Highlight on hover
  layer.on({
    mouseover: (e) => {
      e.target.setStyle({ fillColor: "#007BFF" });
      e.target.bringToFront();
    },
    mouseout: (e) => {
      e.target.setStyle({ fillColor: "#cce5ff" });
    }
  });
}
