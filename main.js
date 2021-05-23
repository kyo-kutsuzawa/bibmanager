const electron = require("electron");
const bibtex_parser = require("bibtex-parser");
const fs = require("fs");
const { get } = require("http");

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
}

// Save a bib file
function savebibData() {
}


const {ipcMain} = require("electron")

ipcMain.on("get_bibData", (event) => {
    event.returnValue = bibData;
})

ipcMain.on("set_focus", (event, key) => {
    focusedBibId = key;
})

ipcMain.on("get_focused_item", (event) => {
    focusedBibId = key;
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


app.on("ready", () => {
    // Create the main window (here you can also set the window size, whether the Kiosk mode enables, etc.)
    mainWindow = new BrowserWindow({width: 1280, height: 800,
        webPreferences: {
            nodeIntegration: true
          }
    });

    // Specify html file to show in Electron by absolute path (note that relative path does not work)
    mainWindow.loadURL("file://" + __dirname + "/index.html");

    // Open a dev tool of Chromium
    //mainWindow.webContents.openDevTools();

    mainWindow.on("closed", function() {
        mainWindow = null;
    });

    loadbibData();
});
