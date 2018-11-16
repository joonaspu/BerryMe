// When document is ready, create content for the maps modal
$(document).on("shown.bs.modal","#myMaps",function(event) {
    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    console.log(mapnames[0]);

    //Create list of maps
    let html = "";
    for(let i = 0;i<mapnames.length;i++) {
        let mapname = mapnames[i];
        let el = `<li class="list-group-item">
                        <button type="button" class="btn" onClick="changeMap('${mapname}')">${mapname}</button>                                            
                        <button type="button" class="btn" onClick="openRenameWindow('${mapname}')" ><i class="fas fa-edit"></i></button>
                        <button type="button" class="btn" onClick="downloadMap('${mapname}')"><i class="fas fa-download"></i></button>
                        <button type="button" class="btn close" onClick="openRemoveWindow('${mapname}')"><i class="fas fa-trash-alt"></i></button>  
                    </li>`;
        html += el;
    } 
    document.getElementById("mapList").innerHTML = html;
});

// Used when clicked New Map button
function newMapButtonClick() {
    let name = document.getElementById('new-map-input').value;
    if(!name.length>0) {
        return;
    }
    createNewMap(name);
    document.getElementById('new-map-input').value = "";
    $("#myMaps").modal("hide");
}

// Confirm remove action
// TODO: make window/popup/popover
function openRemoveWindow(mapname) {
    removeMap(mapname);
    changeMap(loadMapNames()[0]);
    console.log("Removed map: "+mapname);
    $("#myMaps").modal("hide");
}

//TODO: make window
function openRenameWindow(mapname) {
    renameMap(mapname,"Renamed map");
    $("#myMaps").modal("hide");
}


