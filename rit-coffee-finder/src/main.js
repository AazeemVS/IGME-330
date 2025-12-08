import * as map from "./map.js";



function init() {
  map.initMap();
  map.loadMarkers();
  map.addMarkersToMap();
   setupUI(); 
}

function setupUI(){
  // it's easy to get [longitude,latitude] coordinates with this tool: http://geojson.io/
  const lnglatRIT = [-77.67454147338866, 43.08484339838443];
  const lnglatIGM = [-77.67990589141846, 43.08447511795301];

  // RIT Zoom 15.5
  btn1.onclick = () => {
    map.setZoomLevel(15.5);
    map.setPitchAndBearing(0, 0);
    map.flyTo(lnglatRIT);
  };

  // RIT isometric view
  btn2.onclick = () => {
    map.setZoomLevel(15.5);
    map.setPitchAndBearing(45, 0);
    map.flyTo(lnglatRIT);
  };

  // World zoom 0
  btn3.onclick = () => {
    map.setZoomLevel(0);
    map.setPitchAndBearing(0, 0);
    map.flyTo([0, 0]);
  };

  // IGM zoom 18
  btn4.onclick = () => {
    map.setZoomLevel(18);
    map.setPitchAndBearing(0, 0);
    map.flyTo(lnglatIGM);
  };

  // Load markers
  btn5.onclick = () => {
    map.loadMarkers();
    map.addMarkersToMap();
  };
}

export { init };
