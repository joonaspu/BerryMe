let g_map;
//
let g_currentMapName;
// Types of berries
let g_berries;
// Markers
let g_markers = []; 

let g_nextid = 0;

let g_serverurl = "https://berryme.herokuapp.com";
//let g_serverurl = "http://localhost:8000/api/locations";
let g_enableNearbyUsers = true;
let g_otherUsers = [];

let g_mapMoved = false;
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
    let selectedBerry = event.currentTarget.parentNode.querySelector("button.berryButton.active").value;
    let newRating = event.currentTarget.parentNode.querySelector("input[type='number']").value;
    let id = event.currentTarget.parentNode.querySelector("#markerId").value;
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
        saveCurrentMap(g_currentMapName);
    }

}

// Called when "Remove" button is clicked in the infoWindow
function removeBerryListener(event) {
    let id = event.currentTarget.parentNode.querySelector("#markerId").value;

    // Remove marker from the map
    findMarkerByID(id).setMap(null);

    // Remove the element from g_markers
    g_markers = g_markers.filter(marker => marker.id != id);

    // Save map
    saveCurrentMap(g_currentMapName);
}

// Colors 0-5 stars in the given "stars" div
function colorStars(starsElem, starsNum) {
    for (let i = 0; i < 5; i++) {
        if (i < starsNum)
            starsElem.querySelector(".star" + i).src = "res/star.svg";
        else
            starsElem.querySelector(".star" + i).src = "res/star_empty.svg";
    }
}

// Selects a berryID in the given berryList div
function selectBerryButton(berryList, berryID) {
    berryList.querySelectorAll("button").forEach(e => e.classList.remove("active"));
    berryList.querySelector("button[value='"+berryID+"']").classList.add("active");
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
        berryElem.querySelector("button").innerHTML += `<img src="${berry.url}" height=32 width=32/> ${berry.name}`;
        // Add value to the button
        berryElem.querySelector("button").value = berryID;

        // Mark the correct berry as selected
        if (berryID == marker.berryLocation.berry)
            berryElem.querySelector("button").classList.add("active");
        else
            berryElem.querySelector("button").classList.remove("active");

        // Add click handler to the button
        berryElem.querySelector("button").addEventListener("click", e => {
            selectBerryButton(berryListDiv, berryID);
        })

        // Don't show "not a berry" type
        if (berryID == "nab") {
            berryElem.querySelector("button").hidden = true;
        }

        berryListDiv.appendChild(berryElem);
    }

    // Add rating stars
    let starsDiv = infoWindowContent.querySelector(".stars");
    for (let starNum = 0; starNum < 5; starNum++) {
        let star = document.createElement("img");
        star.src = "res/star_empty.svg";
        star.width = 28;
        star.height = 28;
        star.className = "star" + starNum;

        // Change rating input on click
        star.addEventListener("click", e => {
            let parent = e.target.parentNode.parentNode;
            parent.querySelector("input[type='number']").value = starNum + 1;
            colorStars(parent.querySelector(".stars"), starNum + 1);
        }); 
        starsDiv.appendChild(star);
    }
    // Add rating
    infoWindowContent.querySelector("input[type='number']").value = marker.berryLocation.rating;

    // Color stars
    colorStars(infoWindowContent.querySelector(".stars"), marker.berryLocation.rating);

    // Add date
    let date = new Date(marker.berryLocation.date);
    let dateString = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    infoWindowContent.querySelector(".date").innerHTML += dateString;

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

    // Set g_mapMoved to true if the user interacts with the map
    g_map.addListener("drag", () => g_mapMoved = true);
    g_map.addListener("zoom_changed", () => g_mapMoved = true);

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

            // Don't change map center if user has moved the map already
            if (g_mapMoved === false) {
                g_map.setCenter(newCoords);
                g_map.setZoom(13);
            }
            
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
                if(g_enableNearbyUsers) {
                    updateNearbyUsers(newCoords.lat,newCoords.lng);
                }
                

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

    // Get last used mapname
    let lm = loadLastMapName();
    if(lm==null) {
        lm = "Map1";
        saveLastMapName(lm);
    }
    // Load berry locations from localstorage and add them to the map
    loadBerryLocations(lm);

}

function loadBerryLocations(mapname) {
    let mapnames = loadMapNames();
    if(mapnames===null) {
        generateBerryMap();
        mapnames = loadMapNames();
    }
    if(mapnames.includes(mapname)) {
        g_currentMapName = mapname;
        map = loadMap(mapname);
        for(let i = 0; i<map.locations.length;i++) {
            let blocation = map.locations[i];
            addBerryToMap(blocation,g_berries[0][blocation.berry].url);
        }
        saveLastMapName(mapname);

        document.getElementById("navbar-mapname").innerHTML = "Current map: "+mapname;
    }
}

// Load another map's locations 
function changeMap(mapname) {
    for(let i=0;i<g_markers.length;i++) {
        let mark = g_markers[i];
        mark.setMap(null);
    }
    g_markers = [];
    loadBerryLocations(mapname);

    // Remove TSP path from map
    resetTSP();
}
// Download map as txt-file
function downloadMap(mapname) {
    let data = new Blob([JSON.stringify(loadMap(mapname))],{type: "text/plain"});
    console.log("Trying to download");
    let anchor = document.createElement("a");
    anchor.download = mapname+".txt";
    anchor.href = window.URL.createObjectURL(data)
    anchor.click();
}
// Import txt file and add it to the maps
function importMap(event) {
    let files = document.getElementById("file-input").files;
    if(files[0]==null) {
        return;
    }
    console.log(files[0]);
    reader = new FileReader();

    reader.onload = function(file) {
        let tempmap = JSON.parse(file.target.result);
        let mapnames = loadMapNames();
        if(!mapnames.includes(tempmap.name)) {
            saveMap(tempmap)
            mapnames.push(tempmap.name);
            saveMapNames(mapnames);
            document.getElementById("file-input-label").innerHTML = "Choose File";
            $("#myMaps").modal("hide");
        } else {
            console.log("Map name in use!");
        }
    }

    reader.readAsText(files[0]);
    document.getElementById("file-input").value = "";
}

// Remove map from localStorage
// TODO: What if no maps left
function removeMap(mapname) {
    localStorage.removeItem(mapname);
    let mapnames = loadMapNames();
    let index = mapnames.indexOf(mapname);
    mapnames.splice(index,1);
    saveMapNames(mapnames);
    if(mapname === g_currentMapName) {
        g_currentMapName = null;      
        changeMap(loadMapNames()[0]);
    }
}

// Creates new map and loads it
function createNewMap(newMapName) {
    let tempmap = {"name":newMapName, "locations":[]};
    let maps = loadMapNames();
    maps.push(newMapName);
    saveMapNames(maps);
    saveMap(tempmap);
    changeMap(newMapName);
    console.log("Created and loaded new map: "+newMapName);
}

// Rename map
function renameMap(mapname, newMapName) {
    let map = loadMap(mapname);
    map.name = newMapName;
    let maps = loadMapNames();
    let index = maps.indexOf(mapname);
    maps.splice(index,0,newMapName);
    saveMapNames(maps);
    saveMap(map);
    removeMap(mapname);
    if(g_currentMapName === mapname) {
        g_currentMapName = newMapName;
    }
}

// Save data to localstorage
function saveCurrentMap(mapname) {
    let map = {"name":mapname,"locations":[]};
    for(let i = 0;i<g_markers.length;i++) {
        map.locations.push(g_markers[i].berryLocation);
    }
    saveMap(map)
    console.log(mapname + " saved");
}

function updateNearbyUsers(lat, lng) {
    let uniqueid = window.localStorage.getItem("uniqueid");
    $.ajax({
        type: 'POST',
        url: g_serverurl, 
        contentType: "application/json",
        dataType: "json",
        crossDomain: true,       
        data: JSON.stringify({id:uniqueid,nick:"testi",lat:lat,lng:lng}),  
        success: updateOthers
    });


    function updateOthers(data) {    
        console.log("POST REQUEST REC");console.log(data);
        if(!uniqueid) {
            window.localStorage.setItem("uniqueid",data.id);
            let uniqueidnew = window.localStorage.getItem("uniqueid");              
            console.log("ID after ajax: "+uniqueidnew);
            return;
        }
        // Stupid! Fix this!
        // Remove other user locations
        for(let i = 0;i<g_otherUsers.length;i++) {
            let mark = g_otherUsers[i];
            mark.setMap(null);
        }
        // Create new other user locations
        for(let i = 0;i<data.length;i++) {
            let user = data[i];
            if(user.id == uniqueid) {
                continue;
            }
            let otherPositionMarker = new google.maps.Marker({
                icon: {
                    //path: "google.maps.SymbolPath.CIRCLE",
                    url: "res/radu_marker.png", // Change this
                    scale: 1,
                    size:new google.maps.Size(40,40),
                    scaledSize:new google.maps.Size(40,40),
                },
                map: g_map,
                visible: false,
                clickable: false
            });
            otherPositionMarker.setVisible(true);
            otherPositionMarker.setPosition({lat:user.lat,lng:user.lng});
            g_otherUsers.push(otherPositionMarker);
        }
    }
}

// Toggle visibility of the TSP path
function toggleOptimalPath() {
    if (isTSPShown())
        resetTSP();
    else
        getTSP(g_markers, g_map);
}