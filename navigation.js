// When document is ready, create content for the maps modal
$(document).on("show.bs.modal","#myMaps",function(event) {
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
// TODO: Success confirmation
function openRemoveWindow(mapname) {

    let el = `  <h2>Remove map ${mapname} permanently?</h2>
                <button type="button" class="btn yesButton">Yes</button>
                <button type="button" class="btn noButton">No</button>`;

    document.getElementById("genericWindowContent").innerHTML = el;
    document.getElementById("genericWindowContent").querySelector(".yesButton").addEventListener("click", function() {
        removeMap(mapname);
        console.log("Removed map: "+mapname);
        $("#genericWindow").modal("hide");
        $("#myMaps").modal("hide");
    });
    document.getElementById("genericWindowContent").querySelector(".noButton").addEventListener("click", function() {
        $("#genericWindow").modal("hide");
    });
    $("#genericWindow").modal("show");

    
    
}

//TODO: make window
function openRenameWindow(mapname) {
    renameMap(mapname,"Renamed map");
    $("#myMaps").modal("hide");
}


