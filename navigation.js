// When document is ready, create content for the maps modal
$(document).on("shown.bs.modal","#myMaps",function(event) {
    let mapnames = JSON.parse(window.localStorage.getItem("maps"));
    console.log(mapnames[0]);

    //Create list of maps
    let html = "";
    for(let i = 0;i<mapnames.length;i++) {
        let mapname = mapnames[i];
        let el = `<li class="list-group-item"><button type="button" class="btn" onClick="changeMap('${mapname}')">${mapname}</button></li>`;
        html += el;
    } 
    document.getElementById("mapList").innerHTML = html;
});

