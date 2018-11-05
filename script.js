var map;

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
    controlText.innerHTML = 'Add Berry';
    controlUI.appendChild(controlText);

    controlUI.addEventListener("click", function() {
        // TODO
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
    });

    // Position marker
    var myPositionMarker = new google.maps.Marker({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10
        },
        map: map,
        visible: false,
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

            map.setCenter(coords);
            map.setZoom(13);

            console.log(coords);
        });

        // Update position if it changes
        geolocation.watchPosition(function(position) {
            var newCoords = {lat: 0, lng: 0};
            newCoords.lat = position["coords"].latitude;
            newCoords.lng = position["coords"].longitude;

            myPositionCircle.setVisible(true);
            myPositionCircle.setCenter(newCoords);
            myPositionCircle.setRadius(position.coords.accuracy);

            myPositionMarker.setVisible(true);
            myPositionMarker.setPosition(newCoords);

            console.log(position);
        });
    }

}