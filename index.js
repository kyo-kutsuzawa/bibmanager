const bibtex_parser = require("bibtex-parser");
const fs = require("fs");

const bibfilename = "library-short.bib";

let focused_bib_id = "";
let focused_tag_id = "";


window.onload = function() {
    const bibdata_raw = fs.readFileSync(bibfilename, "utf-8");
    const bibdata = parse_bib(bibdata_raw);
    const tags = get_tags(bibdata);

    write_bib(bibdata);
    write_tags(tags);
}


function parse_bib(data) {
    const bibdata = bibtex_parser(data);
    return bibdata;
}


function get_tags(bibdata) {
    let tag_list = [];
    let t = [];

    Object.keys(bibdata).forEach(function(key) {
        t = bibdata[key]["MENDELEY-TAGS"];

        if (t != undefined) {
            Array.prototype.push.apply(tag_list, t.split(","));
        }
    });

    const tags = Array.from(new Set(tag_list));
    return tags;
}

function show_info(bibdata, key) {
    const infoviewer = document.getElementById("info-viewer");
    const noteeditor = document.getElementById("note-editor");

    const s = bibdata[key].AUTHOR + "<br>\n" +
        bibdata[key].TITLE + "<br>\n" +
        bibdata[key].YEAR + "\n";
    infoviewer.innerHTML = s;

    const note = bibdata[key].ANNOTE;
    if (note != undefined) {
        noteeditor.value = note;
    }
    else {
        noteeditor.value = "";
    }
}

function write_bib(bibdata) {
    const listviewer = document.getElementById("biblio-table");

    for (var key in bibdata) {
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        const td3 = document.createElement("td");

        listviewer.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        tr.setAttribute("id", "item_" + key);
        td1.innerText = bibdata[key].AUTHOR;
        td2.innerText = bibdata[key].TITLE;
        td3.innerText = bibdata[key].YEAR;

        addBibClickHandler(tr, bibdata, key);
    }
}


function addBibClickHandler(element, bibdata, key) {
    element.addEventListener("click", function(e) {

        if (focused_bib_id != "") {
            const prev_item = document.getElementById(focused_bib_id);
            prev_item.setAttribute("class", "unfocused");
        }

        focused_bib_id = element.id;
        element.setAttribute("class", "focused");

        show_info(bibdata, key, false);
    });
}


function write_tags(tags) {
    const tagviewer = document.getElementById("tag-viewer");

    tags.forEach(tag => {
        const item = document.createElement("div");
        tagviewer.appendChild(item);
        item.setAttribute("id", "tag_" + tag);
        item.innerText = tag;
        addTagClickHandler(item);
    });

    addTagClickHandler(document.getElementById("tags_all"));
}


function addTagClickHandler(element) {
    element.addEventListener("click", function(e) {
        if (focused_tag_id != "") {
            const prev_item = document.getElementById(focused_tag_id);
            prev_item.setAttribute("class", "unfocused");
        }

        focused_tag_id = element.id;
        element.setAttribute("class", "focused");
    });
}
