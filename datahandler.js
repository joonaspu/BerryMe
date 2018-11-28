// datahandler.js
// localStorage operations

// Clear storage
// Warning! All (saved) data will be lost!
function clearStorage() {
    window.localStorage.clear();
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
// Load data from localstorage
function loadMap(mapname) {
    return JSON.parse(window.localStorage.getItem(mapname));
}
// Save given map to localStorage
function saveMap(map) {
    let mapnames = loadMapNames();
    if(mapnames.includes(map.name)) {
        window.localStorage.setItem(map.name,JSON.stringify(map));
    } else {
        mapnames.push(map.name);
        saveMapNames(mapnames);
        window.localStorage.setItem(map.name,JSON.stringify(map));
    }
}

// Save the name of the last used map to localstorage
function saveLastMapName(mapname) {
    window.localStorage.setItem("lastmap",mapname);
}
// Load the name of the last used map from localstorage
function loadLastMapName() {
    return window.localStorage.getItem("lastmap");
}