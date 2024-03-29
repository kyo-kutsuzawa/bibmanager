const electron = require("electron");
const {ipcMain} = require("electron")
const bibtex_parser = require("bibtex-parser");
const fs = require("fs");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow = null;

const bibFileName = "library-short.bib";
let bibData = undefined;
let focusedBibId = "";


// Load a bib file
function loadbibData() {
    const rawbibData = fs.readFileSync(bibFileName, "utf-8");
    bibData = bibtex_parser(rawbibData);
    for (let id in bibData) {
        bibData[id]["CITATION-KEY"] = id;
    }
}


// Save a bib file
function savebibData() {
}


ipcMain.on("get_bibData", (event) => {
    event.returnValue = bibData;
})


ipcMain.on("get_info", (event, id) => {
    event.returnValue = bibData[id];
})


ipcMain.on("change_info", (event, id, item, value) => {
    if (!bibData[id]) {
        event.returnValue = false;
        return;
    }

    // NotImplemented: check duplication of citation keys

    bibData[id][item] = value;
    event.returnValue = true;
})


ipcMain.on("extract_tags", (event) => {
    let tagArray = [];

    Object.keys(bibData).forEach(function(key) {
        // Get tags in each reference
        const tag = bibData[key]["MENDELEY-TAGS"];

        // Add the tags to a list
        if (tag != undefined) {
            Array.prototype.push.apply(tagArray, tag.split(","));
        }
    });

    // Remove duplicates
    const tagList = Array.from(new Set(tagArray));

    // Sort the tag list
    tagList.sort();

    event.returnValue = tagList;
})


ipcMain.on("filter_by_tag", (event, tag) => {
    let bibList = {};
    for (let id in bibData) {
        const item = bibData[id];
        const tags = item["MENDELEY-TAGS"];
        if (tags === undefined) {
            continue;
        }
        if (tags.includes(tag)) {
            bibList[id] = item;
        }
    }

    event.returnValue = bibList;
})


ipcMain.on("open_pdf", (event, id) => {
    const data = bibData[id];
    const filename = data["FILE"];

    console.log(filename);

    electron.shell.openPath(filename);
})


app.on("ready", () => {
    // Create the main window (here you can also set the window size, whether the Kiosk mode enables, etc.)
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

    // Specify html file to show in Electron by absolute path (note that relative path does not work)
    mainWindow.loadURL("file://" + __dirname + "/index.html");

    // Open a dev tool of Chromium
    if (process.argv[process.argv.length - 1] == "--debug") {
        mainWindow.webContents.openDevTools();
    }

    // Maximize the window
    mainWindow.maximize();

    mainWindow.on("closed", function() {
        mainWindow = null;
    });

    loadbibData();
});
