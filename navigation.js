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
                        <button type="button" class="btn" onClick="">Rename</button>
                        <button type="button" class="btn" onClick="downloadMap('${mapname}')">DL</button>
                        <button type="button" class="close" aria-label="Close" onClick=""><span aria-hidden="true">&times;</span></button>  
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
}


