// Do not touch this file if you do not know what these functions do

// Generate map for testing purposes, named "map1"
function generateBerryMap() {
    let tempmap = {"name":"Map1",
                    "locations":[   new Location(62.6,29.76,"blueberry",2,Date.now()),
                                    new Location(62.6,29.755,"lingonberry",2,Date.now())
                                ]};
    let tempmap2 = {"name":"Map2",
                    "locations":[   new Location(62.65,29.8,"lingonberry",2,Date.now()),
                                    new Location(62.6,29.755,"lingonberry",2,Date.now())
                                ]};
    // Store maps
    window.localStorage.setItem("Map1",JSON.stringify(tempmap));
    window.localStorage.setItem("Map2",JSON.stringify(tempmap2));
    // Store map names
    window.localStorage.setItem("maps",JSON.stringify(["Map1","Map2"]));
}

// Generate n amount of random berry locations
// Usage: 1. clearStorage(); 2. Refresh the page; 3. generateStressMap(2500); 4. Load map;
function generateStressMap(n) {
    let amount = n;
    let tempmap = {"name":"map3", "locations":[]};
    let keys = Object.keys(g_berries[0]);
    for(let i = 0;i<amount;i++) {
        let temploc = new Location(62.6+(Math.random()*2-1),29.76+(Math.random()*2-1),
                                    keys[Math.floor(Math.random()*keys.length)],3,Date.now());
        //console.log(temploc);
        tempmap.locations.push(temploc);
    }
    window.localStorage.setItem("StressMap",JSON.stringify(tempmap));

    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    mapnames.push("StressMap");
    window.localStorage.setItem("maps", JSON.stringify(mapnames));

    //console.log(window.localStorage.getItem("maps"));
}