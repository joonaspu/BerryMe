var map;
//
var g_currentMapName;
// Types of berries
var g_berries;
// Berry locations from current map, NOT MARKERS // Maybe somehow combine locations and markers
var g_locations;
// Markers, no use yet
var g_markers; 

var g_currentMarker;

function addBerryButton() {
    // Create a div to hold the control.
    var addBerryDiv = document.createElement('div');

    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '11px';
    controlUI.style.marginRight = '11px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to add a berry';
    addBerryDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.style.userSelect = "none"; // Disable text selection on the button
    controlText.innerHTML = 'Add Berry';
    controlUI.appendChild(controlText);

    controlUI.addEventListener("click", function() {
        var newMarker = addBerryToMap({"latitude": map.getCenter().lat(),
                                        "longitude": map.getCenter().lng(),
                                        "berry": "nab",
                                        "rating": "2",
                                        "date": "not yet"},
                                        "res/questionmark.png",true);
    });

    return addBerryDiv;
}

// Builds the HTML for the berry infoWindow
function buildInfoWindow() {
    // Get templates
    let t_window = document.querySelector("#infoWindowTemplate");
    let t_berry = document.querySelector("#infoWindowBerryTemplate");

    // Make copy of infoWindowTemplate
    let infoWindowContent = document.importNode(t_window.content, true);
    // Find div for list of berries
    let berryListDiv = infoWindowContent.querySelector(".berryList");

    // Add each berry to div
    for (let berryID in g_berries[0]) {
        let berry = g_berries[0][berryID]

        // Make copy of infoWindowBerryTemplate
        let berryElem = document.importNode(t_berry.content, true);
        // Add label
        berryElem.querySelector("label").innerHTML += `${berry.name} <img src="${berry.url}" height=32 width=32/>`;
        // Add value to radio input
        berryElem.querySelector("input").value = berryID;

        berryListDiv.appendChild(berryElem);
    }

    // Event listeners for save and remove buttons
    infoWindowContent.querySelector(".saveButton").addEventListener("click", function(event) {
        // Get selected berry
        let selectedBerry = event.target.parentNode.querySelector("input[name='berry']:checked").value;
        if (selectedBerry !== null) {
            console.log("Saved " + selectedBerry);
            g_currentMarker.setIcon({
                url: g_berries[0][selectedBerry].url,
                size:new google.maps.Size(40,40),
                scaledSize:new google.maps.Size(40,40),
                origin:new google.maps.Point(0,0),
                anchor:new google.maps.Point(20,20)
            })
            
            g_currentMarker.berryLocation.berry = selectedBerry;
            saveData(g_currentMapName);
        }
    });

    infoWindowContent.querySelector(".removeButton").addEventListener("click", function(event) {
        // Remove this berry 
        // TODO
    });

    return infoWindowContent;
}

// Add berry to the map.
// TODO: more parameters?
function addBerryToMap(berryLocation, imageurl, isnewberry=false) {
        // Berry marker
        var icon= {
            url: imageurl,
            size:new google.maps.Size(40,40),
			scaledSize:new google.maps.Size(40,40),
			origin:new google.maps.Point(0,0),
			anchor:new google.maps.Point(20,20)
        }

        var newMarker = new google.maps.Marker({
            position: { "lat":berryLocation.latitude,"lng":berryLocation.longitude },
            animation: google.maps.Animation.DROP,
            draggable: true,
            icon: icon,
            map: map,
            berryLocation: berryLocation
        });
        // Save new berry to localstorage, testing
        if(isnewberry) {             
            g_locations.locations.push(berryLocation);
            saveData(g_currentMapName);
        }
        // Build info window HTML
        let infoWindowContent = buildInfoWindow();
        var infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        if(isnewberry)
            infoWindow.open(map, newMarker);
        g_currentMarker = newMarker;
        // Click berry to open the infoWindow
        newMarker.addListener("click", function(){
            // Build info window HTML
            let infoWindowContent = buildInfoWindow();
            var infoWindow = new google.maps.InfoWindow({
                content: infoWindowContent
            });
            infoWindow.open(map, newMarker);
            g_currentMarker = newMarker;
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
    var myPositionCircle = new google.maps.Circle({
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
    var myPositionMarker = new google.maps.Marker({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10
        },
        map: map,
        visible: false,
        clickable: false
    });

    // Geolocation
    var geolocation = null;
    geolocation = window.navigator.geolocation;
    if (geolocation != null) {
        // Get initial position
        geolocation.getCurrentPosition(position=>{
            var newCoords = {lat: 0, lng: 0};
            newCoords.lat = position["coords"].latitude;
            newCoords.lng = position["coords"].longitude;

            map.setCenter(newCoords);
            map.setZoom(13);

            console.log(position);
        });
        
        // Update position if it changes
        geolocation.watchPosition(
            function(position) {
                var newCoords = {lat: 0, lng: 0};
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
    loadData(g_currentMapName);
    console.log(g_locations);

    for(let i = 0; i<g_locations.locations.length;i++) {
        let blocation = g_locations.locations[i];
        console.log(blocation);

        addBerryToMap(blocation, g_berries[0][blocation.berry].url);
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
    g_locations = JSON.parse(window.localStorage.getItem(mapname));
}

// Save data to localstorage
function saveData(mapname) {
    console.log("SAVING");
    window.localStorage.setItem(mapname,JSON.stringify(g_locations));
    console.log("SAVING DONE");
}

// Warning! All saved data will be lost!
function clearStorage() {
    window.localStorage.clear();
}
