function init() {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWF6ZWVtdnMiLCJhIjoiY21pcnpwenB2MDZ1ejNlb204cm1qYTJ4ciJ9.r2t_QWWZKJq6KYJkbrfoSQ';

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-77.032, 38.913] },
        properties: { title: 'Mapbox', description: 'Washington, D.C.' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-122.414, 37.776] },
        properties: { title: 'Mapbox', description: 'San Francisco, California' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-77.6010, 43.1548] },
        properties: { title: 'Strong Museum of Play', description: 'Rochester, New York' }
      }
    ]
  };

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-96, 37.8],
    zoom: 3
  });

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

export { init };
