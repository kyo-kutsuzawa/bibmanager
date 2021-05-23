const {ipcRenderer} = require('electron');

let bibData = undefined;
let focusedBibId = "";
let focusedTagId = "";


window.onload = function() {
    bibData = ipcRenderer.sendSync("get_bibData");
    showBib(bibData);

    const tags = ipcRenderer.sendSync("extract_tags");
    showTags(tags);

    registerInfoEvents();
}


function showBib(bibData) {
    const listViewer = document.getElementById("biblio-table");

    for (var key in bibData) {
        // Setup item elements
        const tr = document.createElement("tr");
        listViewer.appendChild(tr);
        registerBibList(tr, key);
    }
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

    // Set the initial focus to "All" item
    focusedTagId = "tags_all";
    document.getElementById("tags_all").setAttribute("class", "focused");
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


function registerBibList(tr, key) {
    // Setup item elements
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");

    // Add items to the list viewer
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);

    // Setup information
    tr.setAttribute("id", "item_" + key);
    td1.innerText = bibData[key].AUTHOR;
    td2.innerText = bibData[key].TITLE;
    td3.innerText = bibData[key].YEAR;

    // Setup events
    tr.onclick = function(e) {
        // Unfocus the previously-focused item
        if (focusedBibId != "") {
            const prev_item = document.getElementById(focusedBibId);
            prev_item.removeAttribute("class");
        }

        // Set focus to the current item
        focusedBibId = tr.id;
        tr.setAttribute("class", "focused");

        // Show bibliography information
        showInfo(bibData, key, false);
    };
}


function addTagClickHandler(element) {
    element.addEventListener("click", function(e) {
        // Unfocus the previously-focused item
        if (focusedTagId != "") {
            const prev_item = document.getElementById(focusedTagId);
            prev_item.removeAttribute("class");
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
        "bib-key": "citation key",
        "note-editor": "ANNOTE"
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
        tr.innerHTML = "";
        focusedBibId = "item_" + newKey;
        registerBibList(tr, newKey);
    }
    else {
        bibData[key][item] = newContent;
        const tr = document.getElementById("item_" + key);
        tr.innerHTML = "";
        registerBibList(tr, key);
    }
}
