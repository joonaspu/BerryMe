let map;
//
let g_currentMapName;
// Types of berries
let g_berries;
// Markers
let g_markers = []; 

let g_nextid = 0;

function addBerryButton() {
    // Create a new div and add the template content to it
    let t_addBerryDiv = document.querySelector("#addBerryTemplate");
    let addBerryDiv = document.createElement('div');
    addBerryDiv.appendChild(document.importNode(t_addBerryDiv.content, true));

    // Add event listener for click
    addBerryDiv.querySelector(".addBerryButton").addEventListener("click", () => {
        addBerryToMap(  {
                            "latitude": map.getCenter().lat(),
                            "longitude": map.getCenter().lng(),
                            "berry": "nab",
                            "rating": "2",
                            "date": "not yet"
                        },
                        "res/questionmark.png", true);
    });

    return addBerryDiv;
}

// Returns a marker with the given ID (or null if it doesn't exist)
function findMarkerByID(id) {
    for(let i = 0;i<g_markers.length;i++) {
        tmarker = g_markers[i];
        if(tmarker.id == id) {  
            return tmarker;
        }
    }
    return null;
}

// Called when "Save" button is clicked in the infoWindow
function saveBerryListener(event) {
    // Get selected berry
    let selectedBerry = event.target.parentNode.querySelector("input[type='radio']:checked").value;
    let id = event.target.parentNode.querySelector("#markerId").value;
    let marker = findMarkerByID(id);

    if (selectedBerry !== null) {
        console.log("Saved " + selectedBerry);  

        // Update icon of the marker
        marker.setIcon({
            url: g_berries[0][selectedBerry].url,
            size:new google.maps.Size(40,40),
            scaledSize:new google.maps.Size(40,40),
            origin:new google.maps.Point(0,0),
            anchor:new google.maps.Point(20,20)
        })

        marker.berryLocation.berry = selectedBerry;

        // Update position based on marker
        let newPosition = marker.getPosition()
        marker.berryLocation.latitude = newPosition.lat();
        marker.berryLocation.longitude = newPosition.lng();

        // Save map
        saveData(g_currentMapName);
    }

}

// Called when "Remove" button is clicked in the infoWindow
function removeBerryListener(event) {
    let id = event.target.parentNode.querySelector("#markerId").value;

    // Remove marker from the map
    findMarkerByID(id).setMap(null);

    // Remove the element from g_markers
    g_markers = g_markers.filter(marker => marker.id != id);

    // Save map
    saveData(g_currentMapName);
}

// Builds the HTML for the berry infoWindow
function buildInfoWindow(markerid) {
    // Get templates
    let t_window = document.querySelector("#infoWindowTemplate");
    let t_berry = document.querySelector("#infoWindowBerryTemplate");

    // Make copy of infoWindowTemplate
    let infoWindowContent = document.importNode(t_window.content, true);
    // Add markerid to hidden input field
    infoWindowContent.querySelector("#markerId").value = markerid;

    // Find div for list of berries
    let berryListDiv = infoWindowContent.querySelector(".berryList");

    let marker = findMarkerByID(markerid);

    // Add each berry to div
    for (let berryID in g_berries[0]) {
        let berry = g_berries[0][berryID]

        // Make copy of infoWindowBerryTemplate
        let berryElem = document.importNode(t_berry.content, true);
        // Add label
        berryElem.querySelector("label").innerHTML += `${berry.name} <img src="${berry.url}" height=32 width=32/>`;
        // Add value to radio input
        berryElem.querySelector("input").value = berryID;

        if (berryID == marker.berryLocation.berry)
            berryElem.querySelector("input").checked = true;

        berryListDiv.appendChild(berryElem);
    }

    // Set unique input group for the radio buttons
    infoWindowContent.querySelectorAll("input[type='radio']").forEach(elem => elem.name = "berryInput"+markerid);

    // Event listeners for save and remove buttons
    infoWindowContent.querySelector(".saveButton").addEventListener("click", saveBerryListener);
    infoWindowContent.querySelector(".removeButton").addEventListener("click", removeBerryListener);

    return infoWindowContent;
}

// Add berry to the map.
// TODO: more parameters?
function addBerryToMap(berryLocation, imageurl, isnewberry=false) {
    // Berry marker
    let icon= {
        url: imageurl,
        size:new google.maps.Size(40,40),
        scaledSize:new google.maps.Size(40,40),
        origin:new google.maps.Point(0,0),
        anchor:new google.maps.Point(20,20)
    }

    let newMarker = new google.maps.Marker({
        position: {"lat":berryLocation.latitude, "lng":berryLocation.longitude},
        animation: google.maps.Animation.DROP,
        draggable: true,
        icon: icon,
        map: map,
        berryLocation: berryLocation,
        id: g_nextid++
    });

    console.log(g_markers.push(newMarker));
    // Save new berry to localstorage, testing
    if(isnewberry) {
        saveData(g_currentMapName);
    }
    // Build info window HTML
    let infoWindowContent = buildInfoWindow(newMarker.id);
    let infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });
    if(isnewberry) {
        infoWindow.open(map, newMarker);
    }

    // Click berry to open the infoWindow
    newMarker.addListener("click", function(){
        // Build info window HTML
        let infoWindowContent = buildInfoWindow(newMarker.id);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.open(map, newMarker);
    });

    return newMarker;
}

function initMap() {
    // Create Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 62, lng: 26},
        zoom: 6,
        streetViewControl: false,
        fullscreenControl: false
    });

    // "Add berry" button to map
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(addBerryButton());

    // Position circle
    let myPositionCircle = new google.maps.Circle({
        map: map,
        visible: false,
        strokeColor: "blue",
        strokeWeight: 1,
        strokeOpacity: 0.4,
        fillColor: "blue",
        fillOpacity: 0.2,
        clickable: false
    });

    // Position marker
    let myPositionMarker = new google.maps.Marker({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10
        },
        map: map,
        visible: false,
        clickable: false
    });

    // Geolocation
    let geolocation = null;
    geolocation = window.navigator.geolocation;
    if (geolocation != null) {
        // Get initial position
        geolocation.getCurrentPosition(position=>{
            let newCoords = {lat: 0, lng: 0};
            newCoords.lat = position["coords"].latitude;
            newCoords.lng = position["coords"].longitude;

            map.setCenter(newCoords);
            map.setZoom(13);

            console.log(position);
        });
        
        // Update position if it changes
        geolocation.watchPosition(
            function(position) {
                let newCoords = {lat: 0, lng: 0};
                newCoords.lat = position["coords"].latitude;
                newCoords.lng = position["coords"].longitude;

                myPositionCircle.setVisible(true);
                myPositionCircle.setCenter(newCoords);
                myPositionCircle.setRadius(position.coords.accuracy);

                myPositionMarker.setVisible(true);
                myPositionMarker.setPosition(newCoords);

                console.log(position);
            }, 
            // Error handler
            function(error) {
                console.log(error);
            },
            // Geolocation options 
            {
                enableHighAccuracy: true
            }
        );
    }
    // Add berries to the map
    //
    generateBerries();
    console.log(g_berries);

    // Load berry locations from localstorage
    
    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    if(mapnames===null) {
        generateBerryMap();
        mapnames = JSON.parse(window.localStorage.getItem("maps"));
    }
    console.log(mapnames);
    // Pick first map
    g_currentMapName = mapnames[0];
    locations = loadData(g_currentMapName);
    console.log(locations);

    for(let i = 0; i<locations.locations.length;i++) {
        let blocation = locations.locations[i];
        console.log(blocation);   
        addBerryToMap(blocation,g_berries[0][blocation.berry].url);
    }
}

// Generate map for testing purposes, named "map1"
function generateBerryMap() {
    let tempmap = {"name":"map1", "locations":[
        {
            "latitude": 62.6,
            "longitude": 29.76,
            "berry": "blueberry",
            "rating": "2",
            "date": "not yet"
        },
        {
            "latitude": 62.6,
            "longitude": 29.755,
            "berry": "lingonberry",
            "rating": "2",
            "date": "not yet"
        }
    ]};
    // Store map
    window.localStorage.setItem("map1",JSON.stringify(tempmap));
    // Store map name
    window.localStorage.setItem("maps",JSON.stringify(["map1","empty"]));
}

// Chrome doesn't like local files
function generateBerries() {
    g_berries = [{
            "nab":{"name":"NotABerry", "url":"res/questionmark.png"},
            "blueberry":{ "name": "Blueberry", "url": "res/blueberry.png"},
            "lingonberry":{"name": "Lingonberry","url":"res/lingonberry.png"}
            }];
}

// Load data from localstorage
function loadData(mapname) {
    return JSON.parse(window.localStorage.getItem(mapname));
}

// Save data to localstorage
function saveData(mapname) {
    console.log("SAVING");
    let locations = {"locations":[]};
    for(let i = 0;i<g_markers.length;i++) {
        locations.locations.push(g_markers[i].berryLocation);
    }
    window.localStorage.setItem(mapname,JSON.stringify(locations));
    console.log("SAVING DONE");
}

// Warning! All saved data will be lost!
function clearStorage() {
    window.localStorage.clear();
}
