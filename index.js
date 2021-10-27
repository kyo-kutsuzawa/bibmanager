const {ipcRenderer} = require('electron');

//let bibData = undefined;
let focusedBibId = "";
let focusedTagId = "";


window.onload = function() {
    // Render bibliography
    const bibData = ipcRenderer.sendSync("get_bibData");
    updateBibList(bibData);

    // Render a tag list
    const tags = ipcRenderer.sendSync("extract_tags");
    updateTagList(tags);

    // Register on-change events for the info viewer
    const keyTable = {
        "bib-entry-type": "entryType",
        "bib-title": "TITLE",
        "bib-author": "AUTHOR",
        "bib-tags": "MENDELEY-TAGS",
        "bib-year": "YEAR",
        "bib-key": "CITATION-KEY",
        "bib-file": "FILE",
        "note-editor": "ANNOTE"
    }
    for (let elementId in keyTable) {
        const element = document.getElementById(elementId);
        element.tabIndex = -1;
        element.addEventListener("change", function(e) {
            const key = keyTable[elementId];
            updateInfo(key, element.value);
        });
    }
}


function updateBibList(bibData) {
    // Load and clear the bibliography table
    const oldBibViewer = document.getElementById("biblio-table");
    const bibViewer = oldBibViewer.cloneNode(false);
    oldBibViewer.parentNode.replaceChild(bibViewer, oldBibViewer);

    // Add items to the bibliography table
    for (let id in bibData) {
        // Create a row
        const tr = document.createElement("tr");
        tr.setAttribute("id", "item_" + id);
        bibViewer.appendChild(tr);
        tr.onclick = function(e) {
            setFocusedBibId(tr.id);
        };

        // Add "author" item
        const td1 = document.createElement("td");
        td1.innerText = bibData[id].AUTHOR;
        tr.appendChild(td1);

        // Add "title" item
        const td2 = document.createElement("td");
        td2.innerText = bibData[id].TITLE;
        tr.appendChild(td2);

        // Add "publication year" item
        const td3 = document.createElement("td");
        td3.innerText = bibData[id].YEAR;
        tr.appendChild(td3);
    }
}


function updateTagList(tags) {
    // Load and clear the tag viewer
    const oldTagViewer = document.getElementById("tag-list");
    const tagViewer = oldTagViewer.cloneNode(false);
    oldTagViewer.parentNode.replaceChild(tagViewer, oldTagViewer);

    // Add "All" element
    const tagAll = document.createElement("div");
    tagViewer.appendChild(tagAll);
    tagAll.setAttribute("id", "tags_all");
    tagAll.innerText = "All";
    tagAll.onclick = function(e) {
        setFocusedTagId(tagAll.id);
    };

    // Add tag items to the tag viewer
    tags.forEach(tag => {
        // Create an item
        const item = document.createElement("div");
        tagViewer.appendChild(item);

        // Setup information
        item.setAttribute("id", "tag_" + tag);
        item.innerText = tag;

        // Setup events
        item.onclick = function(e) {
            setFocusedTagId(item.id);
        };
    });

    // Set the initial focus to "All" item
    focusedTagId = "tags_all";
    document.getElementById("tags_all").setAttribute("class", "focused");
}


function showInfo(id) {
    // Load a bibliography data
    const data = ipcRenderer.sendSync("get_info", id);

    // Output to the information viewer
    const items = {
        "entryType": "bib-entry-type",
        "TITLE": "bib-title",
        "AUTHOR": "bib-author",
        "MENDELEY-TAGS": "bib-tags",
        "YEAR": "bib-year",
        "CITATION-KEY": "bib-key",
        "FILE": "bib-file"
    }
    for (let item in items) {
        if (data[item] != undefined) {
            const element = document.getElementById(items[item]);
            element.value = data[item];
        }
    }

    // Output notes to the note editor
    const noteEditor = document.getElementById("note-editor");
    const note = data.ANNOTE;
    if (note != undefined) {
        noteEditor.value = note;
    }
    else {
        noteEditor.value = "";
    }
}


function updateInfo(key, newContent) {
    const id = focusedBibId.slice(5);
    ipcRenderer.sendSync("change_info", id, key, newContent);

    if (focusedTagId == "tags_all") {
        const bibData = ipcRenderer.sendSync("get_bibData");
        updateBibList(bibData);
        setFocusedBibId(focusedBibId);
    }
    else {
        const bibData = ipcRenderer.sendSync("filter_by_tag", tag);
        updateBibList(bibData);
        setFocusedBibId(focusedBibId);
    }

    const tags = ipcRenderer.sendSync("extract_tags");
    updateTagList(tags);
}


function setFocusedBibId(newId) {
    // Unfocus the previously-focused item
    if (focusedBibId != "") {
        const prev_item = document.getElementById(focusedBibId);
        if (prev_item != null) {
            prev_item.removeAttribute("class");
        }
    }

    // Set focus to the current item
    focusedBibId = newId;
    if (newId == "") {
        return;
    }

    const element = document.getElementById(focusedBibId);
    element.setAttribute("class", "focused");

    // Show bibliography information
    const id = focusedBibId.slice(5);
    showInfo(id);
}


function setFocusedTagId(newTagId) {
    // Unfocus the previously-focused item
    if (focusedTagId != "") {
        const prev_item = document.getElementById(focusedTagId);
        if (prev_item != null) {
            prev_item.removeAttribute("class");
        }
    }

    // Set focus to the current item
    focusedTagId = newTagId;
    const element = document.getElementById(focusedTagId);
    element.setAttribute("class", "focused");

    // Show a list of bibliography
    let bibData = null;
    if (newTagId == "tags_all") {
        bibData = ipcRenderer.sendSync("get_bibData");
    }
    else {
        const tag = focusedTagId.slice(4);
        bibData = ipcRenderer.sendSync("filter_by_tag", tag);
    }
    updateBibList(bibData);
    setFocusedBibId("");
}
