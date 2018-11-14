let g_map;
//
let g_currentMapName;
// Types of berries
let g_berries;
// Markers
let g_markers = []; 

let g_nextid = 0;

//TODO: organize code better

function addBerryButton() {
    // Create a new div and add the template content to it
    let t_addBerryDiv = document.querySelector("#addBerryTemplate");
    let addBerryDiv = document.createElement('div');
    addBerryDiv.appendChild(document.importNode(t_addBerryDiv.content, true));

    // Add event listener for click
    addBerryDiv.querySelector(".addBerryButton").addEventListener("click", () => {
        addBerryToMap( new Location(g_map.getCenter().lat(),g_map.getCenter().lng(),
                                    "nab",3,Date.now()),
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
    let newRating = event.target.parentNode.querySelector("input[type='number']").value;
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
        marker.berryLocation.rating = newRating;

        marker.berryLocation.date = Date.now();

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

        // Mark the correct berry as checked
        if (berryID == marker.berryLocation.berry)
            berryElem.querySelector("input").checked = true;

        // Don't show "not a berry" type
        if (berryID == "nab")
            berryElem.querySelector("label").hidden = true;

        berryListDiv.appendChild(berryElem);
    }

    // Add rating
    infoWindowContent.querySelector("input[type='number']").value = marker.berryLocation.rating;

    // Add date
    let date = new Date(marker.berryLocation.date);
    let dateString = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    infoWindowContent.querySelector(".date").innerHTML = dateString;

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

    let draggable = false;
    let animation = null;
    if (isnewberry) {
        draggable = true;
        animation = google.maps.Animation.DROP;
    } 

    let newMarker = new google.maps.Marker({
        position: {"lat":berryLocation.latitude, "lng":berryLocation.longitude},
        animation: animation,
        draggable: draggable,
        icon: icon,
        map: g_map,
        berryLocation: berryLocation,
        id: g_nextid++
    });

    console.log(g_markers.push(newMarker));

    // Disable dragging when infoWindow is closed
    // and restore marker position
    let windowCloseListener = () => {
        newMarker.setDraggable(false);
        newMarker.setPosition({
            lat: newMarker.berryLocation.latitude,
            lng: newMarker.berryLocation.longitude
        });

        // Remove marker if the Save button wasn't clicked
        // (TODO: Better way to do this than checking for "nab"?)
        if (newMarker.berryLocation.berry == "nab") {
            newMarker.setMap(null);
            g_markers = g_markers.filter(marker => marker != newMarker);
        }

        console.log("WINDOW CLOSED");
    };

    // Build info window HTML for new berries
    if(isnewberry) {
        let infoWindowContent = buildInfoWindow(newMarker.id);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.open(g_map, newMarker);
        infoWindow.addListener("closeclick", windowCloseListener);
    }

    // Click berry to open the infoWindow
    newMarker.addListener("click", function(){
        // Build info window HTML
        let infoWindowContent = buildInfoWindow(newMarker.id);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.open(g_map, newMarker);

        infoWindow.addListener("closeclick", windowCloseListener);

        // Make marker draggable when infoWindow is opened
        newMarker.setDraggable(true);
    });

    return newMarker;
}

function initMap() {
    // Create Map
    g_map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 62, lng: 26},
        zoom: 6,
        streetViewControl: false,
        fullscreenControl: false
    });

    // "Add berry" button to map
    g_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(addBerryButton());

    // Position circle
    let myPositionCircle = new google.maps.Circle({
        map: g_map,
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
        map: g_map,
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

            g_map.setCenter(newCoords);
            g_map.setZoom(13);

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
    // Load berry types
    generateBerries();
    console.log(g_berries);

    // Load berry locations from localstorage and add them to the map
    loadBerryLocations("map1");

}

function loadBerryLocations(mapname) {
    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    if(mapnames===null) {
        generateBerryMap();
        mapnames = JSON.parse(window.localStorage.getItem("maps"));
    }
    console.log(mapnames);
    if(mapnames.includes(mapname)) {
        g_currentMapName = mapname;
        locations = loadData(g_currentMapName);
        console.log(locations);
    
        for(let i = 0; i<locations.locations.length;i++) {
            let blocation = locations.locations[i];
            console.log(blocation);   
            addBerryToMap(blocation,g_berries[0][blocation.berry].url);
        }
    }
}

// Create berry types
//TODO: more modular solution
function generateBerries() {
    g_berries = [{
            "nab":{"name":"NotABerry", "url":"res/questionmark.png"},
            "blueberry":{ "name": "Blueberry", "url": "res/blueberry.png"},
            "lingonberry":{"name": "Lingonberry","url":"res/lingonberry.png"},
            "testberry1":{"name": "testberry1","url":"res/lingonberry.png"},
            "testberry2":{"name": "testberry2","url":"res/lingonberry.png"},
            "testberry3":{"name": "testberry3","url":"res/lingonberry.png"},
            "testberry4":{"name": "testberry4","url":"res/lingonberry.png"},
            }];
}

// Load data from localstorage
function loadData(mapname) {
    return JSON.parse(window.localStorage.getItem(mapname));
}

// Save data to localstorage
function saveData(mapname) {
    console.log("SAVING");
    let locations = {"name":mapname,"locations":[]};
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

// Load another map's locations 
function changeMap(mapname) {
    for(let i=0;i<g_markers.length;i++) {
        let mark = g_markers[i];
        mark.setMap(null);
    }
    g_markers = [];
    loadBerryLocations(mapname);
}

//TODO: What we need to save
function downloadMap(mapname) {
    let data = new Blob([JSON.stringify(loadData(mapname))],{type: "text/plain"});
    console.log("Trying to download");
    let anchor = document.createElement("a");
    anchor.download = mapname+".txt";
    anchor.href = window.URL.createObjectURL(data)
    anchor.click();
}
//TODO: check again for any bugs
function importMap(event) {
    let files = document.getElementById("file-input").files;
    if(files[0]==null) {
        return;
    }
    console.log(files[0]);


    reader = new FileReader();

    reader.onload = function(file) {
        let tempmap = JSON.parse(file.target.result);
        let mapnames = JSON.parse(window.localStorage.getItem("maps"));
        if(!mapnames.includes(tempmap.name)) {
            window.localStorage.setItem(tempmap.name,JSON.stringify(tempmap));
            let temp = JSON.parse(window.localStorage.getItem("maps"))
            temp.push(tempmap.name);
            console.log(temp);
            window.localStorage.setItem("maps",JSON.stringify(temp));
            $("#myMaps").modal("hide");
        } else {
            console.log("Map name in use!");
        }
    }

    reader.readAsText(files[0]);
    document.getElementById("file-input").value = "";
}

// Load map names as an array from localStorage
function loadMapNames() {
    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    return mapnames;
}
// Save mapname array to localStorage
function saveMapNames(mapnames) {
    window.localStorage.setItem("maps", JSON.stringify(mapnames));
}
// Save given map to localStorage
function saveMap(map) {
    window.localStorage.setItem(map.name,JSON.stringify(map));
}
// Remove map from localStorage
function removeMap(mapname) {
    localStorage.removeItem(mapname);
    let mapnames = loadMapNames();
    let index = mapnames.indexOf(mapname);
    mapnames.splice(index,1);
    saveMapNames(mapnames);
}

//
function createNewMap(newMapName) {
    let tempmap = {"name":newMapName, "locations":[]};
    let maps = loadMapNames();
    maps.push(newMapName);
    saveMapNames(maps);
    saveMap(tempmap);
    changeMap(newMapName);
    console.log("Created and loaded new map: "+newMapName);
}