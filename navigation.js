// When document is ready, create content for the maps modal
$(document).on("show.bs.modal","#myMaps",function(event) {
    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    console.log(mapnames[0]);

    //Create list of maps
    let html = "";
    for(let i = 0;i<mapnames.length;i++) {
        let mapname = mapnames[i];
        let el = `<li class="list-group-item px-1">
                        <button type="button" class="btn mx-0 px-1 map-item-button-name" onClick="changeMap('${mapname}')">${mapname}</button>                                            
                        <button type="button" class="btn btn-danger float-right ml-1" onClick="openRemoveWindow('${mapname}')"><i class="fas fa-trash-alt"></i></button>  
                        <button type="button" class="btn btn-primary float-right ml-1" onClick="downloadMap('${mapname}')"><i class="fas fa-download"></i></button>
                        <button type="button" class="btn btn-primary float-right ml-1" onClick="openRenameWindow('${mapname}')" ><i class="fas fa-edit"></i></button>
                    </li>`;
        html += el;
    } 
    document.getElementById("mapList").innerHTML = html;
    document.getElementById("file-input-label").innerHTML = "Choose file";
    // Import
    $("input[type=file]").on("change", function() {
        console.log(this.files[0].name);
        document.getElementById("file-input-label").innerHTML = this.files[0].name;      
    });

    // Check if new map name is valid every time user writes something
    // Colors?
    $("#new-map-input").on("keyup",event=>{
        
        let name = document.getElementById('new-map-input').value;

        let mapnames = loadMapNames();
        if(mapnames.includes(name)) {
            $("#new-map-input").addClass("bg-danger text-light");
            return;
        }
        $("#new-map-input").removeClass("bg-danger text-light");
    });
});

// Used when clicked New Map button
function newMapButtonClick() {
    let name = document.getElementById('new-map-input').value;
    if(!name.length>0) {
        return;
    }
    let mapnames = loadMapNames();
    if(mapnames.includes(name)) {
        return;
    }
    createNewMap(name);
    document.getElementById('new-map-input').value = "";
    $("#myMaps").modal("hide");
    createSuccessAlert(`New map ${name} created!`);
}



// Confirm remove action
function openRemoveWindow(mapname) {

    let el = `  <h2 class="text-light">Remove: "${mapname}" permanently?</h2>
                <button type="button" class="btn btn-lg btn-block btn-danger yesButton">Yes <i class="fas fa-trash-alt"></i></button>
                <br>
                <button type="button" class="btn btn-lg btn-block btn-dark noButton">No</button>`;
                
    document.getElementById("genericWindowContent").innerHTML = el;

    document.getElementById("genericWindowContent").querySelector(".yesButton").addEventListener("click", function() {
        removeMap(mapname);
        console.log("Removed map: "+mapname);
        $("#genericWindow").modal("hide");
        $("#myMaps").modal("hide");
        createSuccessAlert(`Map ${mapname} successfully removed!`);
    });
    document.getElementById("genericWindowContent").querySelector(".noButton").addEventListener("click", function() {
        $("#genericWindow").modal("hide");
    });

    $("#genericWindow").modal("show");
  
}

function openRenameWindow(mapname) {
    let el = `  <h2 class="text-light">Rename the map: ${mapname}</h2>
                <div class="input-group">
                    <input class="form-control" placeholder="New Name..." id="rename-map-input"> 
                    <div class="input-group-append">
                        <button class="btn btn-success renameButton" type="button">Rename</button>
                    </div>
                </div>`;
    document.getElementById("genericWindowContent").innerHTML = el;

    // Check if new map name is valid every time user writes something
    // Colors?
    $("#rename-map-input").on("keyup",event=>{       
        let name = document.getElementById('rename-map-input').value;
        let mapnames = loadMapNames();
        if(mapnames.includes(name)) {
            $("#rename-map-input").addClass("bg-danger text-light");
            return;
        }
        $("#rename-map-input").removeClass("bg-danger text-light");
    });

    document.getElementById("genericWindowContent").querySelector(".renameButton").addEventListener("click", function() {
        let name = document.getElementById("genericWindowContent").querySelector("#rename-map-input").value;
        if(!name.length > 0) {
            return;
        }
        let mapnames = loadMapNames();
        if(mapnames.includes(name)) {
            return;
        }
        renameMap(mapname,name);
        $("#genericWindow").modal("hide");
        $("#myMaps").modal("hide");
        createSuccessAlert(`${mapname} renamed to ${name}!`);
    });
    $("#genericWindow").modal("show");  
}
// Success or danger
function toggleNearbyUsers() {
    if($("#navbar-nearbyusers").hasClass("btn-success")) {
        $("#navbar-nearbyusers").removeClass("btn-success");
        $("#navbar-nearbyusers").addClass("btn-outline-danger");
        g_enableNearbyUsers = false;
        // Stupid! Fix this!
        // Remove other user locations
        for(let i = 0;i<g_otherUsers.length;i++) {
            let mark = g_otherUsers[i];
            mark.setMap(null);
        }
    } else {
        $("#navbar-nearbyusers").addClass("btn-success");
        $("#navbar-nearbyusers").removeClass("btn-outline-danger");
        g_enableNearbyUsers = true;
    }
}

// When document is ready, create content for the achievements
$(document).on("show.bs.modal","#myAchievements",function(event) {
    console.log(achievements);
    let unlocked = getAchievements();
    //Create list of maps
    let html = "";
    //<img src="${ach.url}" height=32 width=32/>${ach.name} - ${ach.description}
    for(let i = 0;i<achievements.length;i++) {
        let ach = achievements[i];
        let el;
        if(unlocked.includes(ach.id)) {
            el = `<li class="list-group-item list-group-item-success text-dark">                       
                    <img src="${ach.url}" height=32 width=32/> ${ach.name} - ${ach.description}
                </li>`;
        } else {
            el = `<li class="list-group-item list-group-item-dark">                       
                    <i class="fas fa-lock"></i> ${ach.name} - ${ach.description}
                </li>`;
        }

        html += el;
    } 
    document.getElementById("achievementsList").innerHTML = html;
});

// When document is ready and weather window opens, create content for the weather
$(document).on("show.bs.modal","#weather",function(event) {
    let html = "";
    /*
    let el = `<li class="list-group-item">
                <span id="current-weather"></span>
            </li>`
    html += el;*/
    for(let i = 0;i<=g_FORECAST_COUNT;i++) {
        el =    `<li class="list-group-item">
                    <span id="forecast-weather-${i}"></span>
                </li>`;
            html += el;
    }

    document.getElementById("weatherList").innerHTML = html; 
    //getCurrentWeather(g_myPosition.lat,g_myPosition.lng);
    getForecastWeather(g_myPosition.lat,g_myPosition.lng);   
});

function createSuccessAlert(message) {
    //console.log(g_map.controls[google.maps.ControlPosition.TOP_CENTER]);
    // Empty controls from alert windows
    let controls = g_map.controls[google.maps.ControlPosition.TOP_CENTER];
    if(controls.j) {
        if(controls.j.length > 0) {
            $("#success-alert").remove();
            controls.j.length = 0;
        }
    }
    let t_alert = document.querySelector("#alert-success-template");
    let alert = document.importNode(t_alert.content,true);
    let alertdiv = document.createElement('div');
    alertdiv.setAttribute("id","success-alert");
    alertdiv.appendChild(alert);
    g_map.controls[google.maps.ControlPosition.TOP_CENTER].push(alertdiv);
    $(alertdiv).find("#success-alert-content").html(message);
    $(alertdiv).delay(2000).fadeOut(1000, function() {
        $(this).remove();

    });
}

function createDangerAlert(message) {
    // Empty controls from alert windows
    let controls = g_map.controls[google.maps.ControlPosition.TOP_CENTER];
    if(controls.j) {
        if(controls.j.length > 0) {
            $("#danger-alert").remove();
            controls.j.length = 0;
        }
    }
    let t_alert = document.querySelector("#alert-danger-template");
    let alert = document.importNode(t_alert.content,true);
    let alertdiv = document.createElement('div');
    alertdiv.setAttribute("id","danger-alert");
    alertdiv.appendChild(alert);
    g_map.controls[google.maps.ControlPosition.TOP_CENTER].push(alertdiv);
    $(alertdiv).find("#danger-alert-content").html(message);
    $(alertdiv).delay(2000).fadeOut(1000, function() {
        $(this).remove();

    });
}