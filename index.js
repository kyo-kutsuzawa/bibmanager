const bibtex_parser = require("bibtex-parser");
const fs = require("fs");

const bibFileName = "library-short.bib";

let bibData = undefined;
let focusedBibId = "";
let focusedTagId = "";


window.onload = function() {
    // Load and parse bibliography
    loadbibData();
    const tags = extractTags(bibData);

    showBib(bibData);
    showTags(tags);
    registerInfoEvents();
}


function loadbibData() {
    const rawbibData = fs.readFileSync(bibFileName, "utf-8");
    bibData = bibtex_parser(rawbibData);
}


function extractTags(bibData) {
    let tagList = [];
    let t = [];

    Object.keys(bibData).forEach(function(key) {
        // Get tags in a reference
        t = bibData[key]["MENDELEY-TAGS"];

        // Add the tags to a list
        if (t != undefined) {
            Array.prototype.push.apply(tagList, t.split(","));
        }
    });

    // Remove duplicates
    const tags = Array.from(new Set(tagList));

    return tags;
}


function showInfo(bibData, key) {
    // Get viewers
    const infoViewer = document.getElementById("info-viewer");
    const noteEditor = document.getElementById("note-editor");

    // Output to the information viewer
    const items = {
        entryType: "bib-entry-type",
        TITLE: "bib-title",
        AUTHOR: "bib-author",
        "MENDELEY-TAGS": "bib-tags",
        YEAR: "bib-year",
    }
    for (var item in items) {
        if (bibData[key][item] != undefined) {
            const element = document.getElementById(items[item]);
            element.value = bibData[key][item];
        }
    }
    const element = document.getElementById("bib-key");
    element.value = key;

    // Output notes to the note editor
    const note = bibData[key].ANNOTE;
    if (note != undefined) {
        noteEditor.value = note;
    }
    else {
        noteEditor.value = "";
    }
}


function showBib(bibData) {
    const listViewer = document.getElementById("biblio-table");

    for (var key in bibData) {
        // Setup item elements
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        const td3 = document.createElement("td");

        // Add items to the list viewer
        listViewer.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        // Setup information
        tr.setAttribute("id", "item_" + key);
        td1.innerText = bibData[key].AUTHOR;
        td2.innerText = bibData[key].TITLE;
        td3.innerText = bibData[key].YEAR;

        // Setup events
        addBibClickHandler(tr, key);
    }
}


function addBibClickHandler(element, key) {
    element.onclick = function(e) {
        // Unfocus the previously-focused item
        if (focusedBibId != "") {
            const prev_item = document.getElementById(focusedBibId);
            prev_item.setAttribute("class", "unfocused");
        }

        // Set focus to the current item
        focusedBibId = element.id;
        element.setAttribute("class", "focused");

        // Show bibliography information
        showInfo(bibData, key, false);
    };
}


function showTags(tags) {
    const tagViewer = document.getElementById("tag-viewer");

    tags.forEach(tag => {
        // Setup tag items
        const item = document.createElement("div");
        tagViewer.appendChild(item);
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
        if (focusedTagId != "") {
            const prev_item = document.getElementById(focusedTagId);
            prev_item.setAttribute("class", "unfocused");
        }

        // Set focus to the current item
        focusedTagId = element.id;
        element.setAttribute("class", "focused");
    });
}


function registerInfoEvents() {
    idList = [
        "bib-title",
        "bib-author",
        "bib-key",
        "bib-entry-type",
        "bib-year",
        "bib-tags",
        "note-editor"
    ]
    idList.forEach(id => {
        const element = document.getElementById(id);
        element.tabIndex = -1;
        element.addEventListener("change", function(e) {
            updateInfo(id, element.value);
        });
    });
}


function updateInfo(id, newContent) {
    const itemList = {
        "bib-entry-type": "entryType",
        "bib-title": "TITLE",
        "bib-author": "AUTHOR",
        "bib-tags": "MENDELEY-TAGS",
        "bib-year": "YEAR",
        "bib-key": "citation key"
    }

    const item = itemList[id];
    const key = focusedBibId.slice(5);

    if (id == "bib-key") {
        const newKey = newContent;

        // Check duplicate
        if (newKey in bibData) {
            return;
        }

        // Update bibData
        bibData[newKey] = bibData[key];
        delete bibData[key];

        // Update bibliography list
        const tr = document.getElementById("item_" + key);
        tr.setAttribute("id", "item_" + newKey);
        focusedBibId = "item_" + newKey;

        // Setup events
        addBibClickHandler(tr, newKey);
    }
    else {
        bibData[focusedBibId.slice(5)][item] = newContent;
    }
}
