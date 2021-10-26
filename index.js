const {ipcRenderer} = require('electron');

//let bibData = undefined;
let focusedBibId = "";
let focusedTagId = "";


window.onload = function() {
    // Render bibliography
    const bibData = ipcRenderer.sendSync("get_bibData");
    showBibList(bibData);

    // Render a tag list
    const tags = ipcRenderer.sendSync("extract_tags");
    showTagList(tags);

    // Register events for infoViewer
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


function showBibList(bibData) {
    // Load a viewer element
    const oldListViewer = document.getElementById("biblio-table");
    const listViewer = oldListViewer.cloneNode(false);
    oldListViewer.parentNode.replaceChild(listViewer, oldListViewer);

    for (let id in bibData) {
        // Setup elements
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        const td3 = document.createElement("td");

        // Register elements
        listViewer.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        // Setup information
        tr.setAttribute("id", "item_" + id);
        td1.innerText = bibData[id].AUTHOR;
        td2.innerText = bibData[id].TITLE;
        td3.innerText = bibData[id].YEAR;

        // Setup events
        tr.onclick = function(e) {
            setFocusedBibId(tr.id);
        };
    }
}


function showTagList(tags) {
    // Load a viewer element and renew it
    const oldTagViewer = document.getElementById("tag-list");
    const tagViewer = oldTagViewer.cloneNode(false);
    oldTagViewer.parentNode.replaceChild(tagViewer, oldTagViewer);

    // Add "All" element
    const itemAll = document.createElement("div");
    tagViewer.appendChild(itemAll);
    itemAll.setAttribute("id", "tags_all");
    itemAll.innerText = "All";

    // Setup an event for "All" element
    const tags_all = document.getElementById("tags_all");
    tags_all.onclick = function(e) {
        setFocusedTagId(tags_all.id);
    };

    // Add tags to the viewer
    tags.forEach(tag => {
        // Add an item
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
        showBibList(bibData);
        setFocusedBibId(focusedBibId);
    }
    else {
        const bibData = ipcRenderer.sendSync("filter_by_tag", tag);
        showBibList(bibData);
        setFocusedBibId(focusedBibId);
    }

    const tags = ipcRenderer.sendSync("extract_tags");
    showTagList(tags);
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
    showBibList(bibData);
    setFocusedBibId("");
}
