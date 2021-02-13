const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow = null;


app.on('ready', () => {
    // Create the main window (here you can also set the window size, whether the Kiosk mode enables, etc.)
    mainWindow = new BrowserWindow({width: 400, height: 300});
    // Specify html file to show in Electron by absolute path (note that relative path does not work)
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Open a dev tool of Chromium
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
