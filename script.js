var map;

var g_berries;

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
        // Icon could be question mark when user has not selected berry
        // Also remove hardcoded sizes
        var icon= {
            url: "res/blueberry.png", // change this
            size:new google.maps.Size(40,40),
			scaledSize:new google.maps.Size(40,40),
			origin:new google.maps.Point(0,0),
			anchor:new google.maps.Point(20,20)
        }

        var newMarker = new google.maps.Marker({
            position: map.getCenter(),
            animation: google.maps.Animation.DROP,
            draggable: true,
            icon: icon,
            map: map,
        });

        var infoWindowHTML = `<div class="infoWindow">
            <h3>Type of berry</h3><br>
            <input type="radio" name="berry" id="value1">
            <label for="value1">Strawberry</label>
            <br>
            <input type="radio" name="berry" id="value2">
            <label for="value2">Blueberry</label>
            <br>
            <input type="radio" name="berry" id="value3">
            <label for="value3">Mushroom</label>
            <br>
            <button>Save</button>
            <button>Remove</button>
        </div>
        `

        var infoWindow = new google.maps.InfoWindow({
            content: infoWindowHTML
        });

        infoWindow.open(map, newMarker);
    });

    return addBerryDiv;
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
    window.localStorage.clear(); // For testing purposes.
    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    if(mapnames===null) {
        generateBerryMap();
        mapnames = JSON.parse(window.localStorage.getItem("maps"));
    }
    console.log(mapnames);

    // Pick first map
    let mapdata = JSON.parse(window.localStorage.getItem(mapnames[0]));
    console.log(mapdata);
    for(let i = 0; i<mapdata.locations.length;i++) {
        let blocation = mapdata.locations[i];
        console.log(blocation);

        // Make berry icon
        var icon= {
            url: g_berries[0][blocation.berry].url,
            size:new google.maps.Size(40,40),
			scaledSize:new google.maps.Size(40,40),
			origin:new google.maps.Point(0,0),
			anchor:new google.maps.Point(20,20)
        }

        // Add berry to the map
        var berryMarker = new google.maps.Marker({
            position: {"lat": blocation.latitude, "lng": blocation.longitude},
            icon: icon,
            animation: google.maps.Animation.DROP,
            draggable: true,
            map: map,
        });
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
            "blueberry":{ "name": "Blueberry", "url": "res/blueberry.png"},
            "lingonberry":{"name": "Lingonberry","url":"res/lingonberry.png"}
            }];
}
