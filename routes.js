const tsp_server = "https://cs.uef.fi/o-mopsi/api/server.php";
const osrm_server = "https://router.project-osrm.org/route/v1/driving/";
const gh_server = "https://graphhopper.com/api/1/route?";
const gh_key = "LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn";

let g_tsp_path = null;
let g_directions_path = null;

// Removes TSP path from map
function resetTSP() {
    if (g_tsp_path !== null)
        g_tsp_path.setMap(null);

    g_tsp_path = null;
}

// Returns true if TSP route is currently shown on map, otherwise false
function isTSPShown() {
    if (g_tsp_path === null)
        return false
    else
        return true
}

// Get TSP and draw it on the map
// NOTE: Only works if the page is hosted on cs.uef.fi!!!
function getTSP(markers, map) {
    // Get marker locations
    let points = [];
    markers.forEach(element => {
        points.push({
            lat: element.berryLocation.latitude,
            lng: element.berryLocation.longitude
        });
    });

    let param = {
        "request_type": "tsp",
        "points": points
    }

    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", e => {
        let tsp_points = JSON.parse(oReq.responseText);

        resetTSP();

        g_tsp_path = new google.maps.Polyline({
            path: tsp_points,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        g_tsp_path.setMap(map);
    });
    oReq.open("POST", tsp_server, true);
    oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    oReq.send("param="+JSON.stringify(param));
}

// Get directions to location from OSRM/GraphHopper
function getDirections(start, end, map) {
    //let url = `${osrm_server}${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson`;
    let url = `${gh_server}point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&points_encoded=false&vehicle=car&key=${gh_key}`;
    
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", e => {
        //let coords = JSON.parse(oReq.responseText)["routes"][0]["geometry"]["coordinates"];
        let coords = JSON.parse(oReq.responseText)["paths"][0]["points"]["coordinates"];

        let maps_points = []
        coords.forEach(e => maps_points.push({lat: e[1], lng: e[0]}));

        if (g_directions_path !== null)
            g_directions_path.setMap(null);

        g_directions_path = new google.maps.Polyline({
            path: maps_points,
            strokeColor: "#0000FF",
            strokeOpacity: 1.0,
            strokeWeight: 4
        });

        g_directions_path.setMap(map);
    });
    oReq.open("GET", url, true);
    oReq.send();
}