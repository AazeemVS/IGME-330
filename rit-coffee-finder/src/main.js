let map;

let geojson = {
  type: 'FeatureCollection',
  features: []
};

// New function: initMap()
function initMap() {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWF6ZWVtdnMiLCJhIjoiY21pcnpwenB2MDZ1ejNlb204cm1qYTJ4ciJ9.r2t_QWWZKJq6KYJkbrfoSQ';

  // Create the map, now centered on RIT
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-77.67454147338866, 43.08484339838443],
    zoom: 15.5
  });
}

// New function: addMarkersToMap()
function addMarkersToMap() {
  for (const feature of geojson.features) {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker(el)
      .setLngLat(feature.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
        )
      )
      .addTo(map);
  }
}

function loadMarkers() {
  const coffeeShops = [
    { latitude: 43.084156, longitude: -77.67514,  title: "Artesano Bakery & Cafe" },
    { latitude: 43.083866, longitude: -77.66901,  title: "Beanz" },
    { latitude: 43.082520, longitude: -77.67980,  title: "Starbucks" },
    { latitude: 43.086678, longitude: -77.669014, title: "The College Grind" },
    { latitude: 43.082634, longitude: -77.68004,  title: "The Cafe & Market at Crossroads" },
    { latitude: 43.08382,  longitude: -77.674805, title: "RITZ Sports Zone" },
    { latitude: 43.086502, longitude: -77.66912,  title: "The Commons" },
    { latitude: 43.08324,  longitude: -77.68105,  title: "The Market at Global Village" },
    { latitude: 43.08384,  longitude: -77.67457,  title: "Brick City Cafe" },
    { latitude: 43.084904, longitude: -77.6676,   title: "Corner Store" },
    { latitude: 43.08464,  longitude: -77.680145, title: "CTRL ALT DELi" },
    { latitude: 43.08359,  longitude: -77.66921,  title: "Gracie's" }
  ];

  for (let shop of coffeeShops) {
    const newFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: []
      },
      properties: {
        title: "",
        description: 'A place to get coffee!'
      }
    };

    // add some properties for the current coffee shop
    newFeature.geometry.coordinates[0] = shop.longitude;
    newFeature.geometry.coordinates[1] = shop.latitude;
    newFeature.properties.title = shop.title;

    geojson.features.push(newFeature);
  }

  console.log(geojson.features);
}

function init() {
  initMap();
  loadMarkers();
  addMarkersToMap();
}

export { init };
