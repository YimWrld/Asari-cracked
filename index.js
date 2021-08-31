const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    let win = new BrowserWindow({
        width: 1250,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.removeMenu();
    win.loadFile('./index.html');
    win.webContents.openDevTools();
}

app.on('ready', createWindow);