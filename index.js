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
    showTags(tags);

    // Register events for infoViewer
    const keyTable = {
        "bib-entry-type": "entryType",
        "bib-title": "TITLE",
        "bib-author": "AUTHOR",
        "bib-tags": "MENDELEY-TAGS",
        "bib-year": "YEAR",
        "bib-key": "CITATION-KEY",
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


function showTags(tags) {
    // Load a viewer element
    const tagViewer = document.getElementById("tag-viewer");

    tags.forEach(tag => {
        // Setup an item element
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
        "CITATION-KEY": "bib-key"
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


function addTagClickHandler(element) {
    element.addEventListener("click", function(e) {
        setFocusedTagId(element.id);
    });
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
}


function setFocusedBibId(newId) {
    // Unfocus the previously-focused item
    if (focusedBibId != "") {
        const prev_item = document.getElementById(focusedBibId);
        prev_item.removeAttribute("class");
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
        prev_item.removeAttribute("class");
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
