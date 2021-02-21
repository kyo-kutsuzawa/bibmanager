const bibtex_parser = require("bibtex-parser");
const fs = require("fs");

const bibfilename = "library-short.bib";

let focused_bib_id = "";
let focused_tag_id = "";


window.onload = function() {
    // Load and parse bibliography
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
        // Get tags in a reference
        t = bibdata[key]["MENDELEY-TAGS"];

        // Add the tags to a list
        if (t != undefined) {
            Array.prototype.push.apply(tag_list, t.split(","));
        }
    });

    // Remove duplicates
    const tags = Array.from(new Set(tag_list));

    return tags;
}


function show_info(bibdata, key) {
    // Get viewers
    const infoviewer = document.getElementById("info-viewer");
    const noteeditor = document.getElementById("note-editor");

    // Output to the information viewer
    const items = {
        entryType: "bib-entry-type",
        TITLE: "bib-title",
        AUTHOR: "bib-author",
        "MENDELEY-TAGS": "bib-tags",
        YEAR: "bib-year",
    }
    for (var item in items) {
        if (bibdata[key][item] != undefined) {
            const element = document.getElementById(items[item]);
            element.innerHTML = bibdata[key][item];
        }
    }
    const element = document.getElementById("bib-key");
    element.innerHTML = key;

    // Output notes to the note editor
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
        // Setup item elements
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        const td3 = document.createElement("td");

        // Add items to the list viewer
        listviewer.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        // Setup information
        tr.setAttribute("id", "item_" + key);
        td1.innerText = bibdata[key].AUTHOR;
        td2.innerText = bibdata[key].TITLE;
        td3.innerText = bibdata[key].YEAR;

        // Setup events
        addBibClickHandler(tr, bibdata, key);
    }
}


function addBibClickHandler(element, bibdata, key) {
    element.addEventListener("click", function(e) {
        // Unfocus the previously-focused item
        if (focused_bib_id != "") {
            const prev_item = document.getElementById(focused_bib_id);
            prev_item.setAttribute("class", "unfocused");
        }

        // Set focus to the current item
        focused_bib_id = element.id;
        element.setAttribute("class", "focused");

        // Show bibliography information
        show_info(bibdata, key, false);
    });
}


function write_tags(tags) {
    const tagviewer = document.getElementById("tag-viewer");

    tags.forEach(tag => {
        // Setup tag items
        const item = document.createElement("div");
        tagviewer.appendChild(item);
        item.setAttribute("id", "tag_" + tag);
        item.innerText = tag;

        // Setup events
        addTagClickHandler(item);
    });

    // Setup events to "All" item
    addTagClickHandler(document.getElementById("tags_all"));
}


function addTagClickHandler(element) {
    element.addEventListener("click", function(e) {
        // Unfocus the previously-focused item
        if (focused_tag_id != "") {
            const prev_item = document.getElementById(focused_tag_id);
            prev_item.setAttribute("class", "unfocused");
        }

        // Set focus to the current item
        focused_tag_id = element.id;
        element.setAttribute("class", "focused");
    });
}
