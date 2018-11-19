let tsp_server = "https://cs.uef.fi/o-mopsi/api/server.php";
let osrm_server = "https://router.project-osrm.org/route/v1/driving/";

let g_tsp_path = null;

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