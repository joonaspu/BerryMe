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
        let parsed = JSON.parse(oReq.responseText)
        let coords = parsed["paths"][0]["points"]["coordinates"];
        let distance = parsed["paths"][0]["distance"]
        distance = Math.round(distance / 100) / 10

        let maps_points = []
        coords.forEach(e => maps_points.push({lat: e[1], lng: e[0]}));

        // Remove existing routes
        if (g_directions_path !== null)
            g_directions_path.setMap(null);

        // Create a new polyline for the new route
        g_directions_path = new google.maps.Polyline({
            path: maps_points,
            strokeColor: "#0000FF",
            strokeOpacity: 1.0,
            strokeWeight: 4
        });

        // Get start and end location address
        let geocoder = new google.maps.Geocoder;
        let startAddr = "Unknown";
        let endAddr = "Unknown";
        geocoder.geocode({location: start}, (res, status) => {
            if (status === "OK")
                startAddr = res[0].formatted_address;
        })
        geocoder.geocode({location: end}, (res, status) => {
            if (status === "OK")
                endAddr = res[0].formatted_address;
        })

        // Click handler for the route
        g_directions_path.addListener("click", e => {
            let pathWindow

            // Create a new div and add the template content to it
            let t_directionsDiv = document.querySelector("#infoWindowDirectionsTemplate");
            let directionsDiv = document.createElement('div');
            directionsDiv.appendChild(document.importNode(t_directionsDiv.content, true));

            // Set addresses
            directionsDiv.querySelector(".routeFrom").innerHTML += startAddr;
            directionsDiv.querySelector(".routeTo").innerHTML += endAddr;
            directionsDiv.querySelector(".routeDist").innerHTML += distance + " km";

            // Click handler for the remove button
            directionsDiv.querySelector(".removeDirButton").addEventListener("click", e => {
                g_directions_path.setMap(null);
                pathWindow.close();
            });

            // Create the infoWindow and add it to the map
            pathWindow = new google.maps.InfoWindow({
                content: directionsDiv,
                position: e.latLng
            });
            pathWindow.setMap(map);
        });

        g_directions_path.setMap(map);
    });
    oReq.open("GET", url, true);
    oReq.send();
}