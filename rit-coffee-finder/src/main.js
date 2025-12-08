import * as map from "./map.js";
import * as ajax from "./ajax.js";

let poi;

function init() {
  map.initMap();
  map.loadMarkers();
  map.addMarkersToMap();
   setupUI(); 
}

function loadPOI() {
  const url = "https://people.rit.edu/~acjvks/shared/330/igm-points-of-interest.php";

  // callback after data arrives
  function poiLoaded(jsonString) {
  poi = JSON.parse(jsonString);
  console.log("POI Data:", poi);

  // make markers and add them to the map
  for (let p of poi) {
  map.addMarker(p.coordinates, p.title, "A POI!", "poi");
}
}


  // start ajax download
  ajax.downloadFile(url, poiLoaded);
}

function setupUI(){
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

  // load some marker data (external AJAX data)
btn5.onclick = () => {
  // only download once
  if (!poi) {
    loadPOI();
  }
};
}

export { init };
