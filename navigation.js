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
                        <button type="button" class="btn" onClick="downloadMap('${mapname}')">Download</button>
                    </li>`;
        html += el;
    } 
    document.getElementById("mapList").innerHTML = html;
});

//TODO: What we need to save
function downloadMap(mapname) {
    let data = new Blob([JSON.stringify(loadData(mapname))],{type: "text/plain"});
    console.log("Trying to download");
    let anchor = document.createElement("a");
    anchor.download = mapname+".txt";
    anchor.href = window.URL.createObjectURL(data)
    anchor.click();
}

