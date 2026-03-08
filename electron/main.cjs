const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Configure environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

// Logging setup
const logPath = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
}

const logFile = path.join(logPath, `app-${new Date().toISOString().split('T')[0]}.log`);

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log(logEntry.trim());
}

// Global error handlers
process.on('uncaughtException', (error) => {
  log('ERROR', 'Uncaught Exception', { message: error.message, stack: error.stack });
  dialog.showErrorBox('Ошибка приложения', `Произошла непредвиденная ошибка: ${error.message}`);
  app.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log('ERROR', 'Unhandled Rejection', { reason: String(reason) });
});

function createWindow() {
  log('INFO', 'Creating main window');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'MathViz Architect',
    backgroundColor: '#F3F4F6',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: false
    },
    show: false
  });

  // Create application menu
  const menuTemplate = [
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Новый проект',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-project')
        },
        {
          label: 'Открыть проект',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'MathViz Projects', extensions: ['mvz'] }]
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('menu-open-project', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Сохранить проект',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save-project')
        },
        {
          label: 'Сохранить как...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu-save-project-as')
        },
        { type: 'separator' },
        {
          label: 'Экспорт в PNG',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [{ name: 'PNG Image', extensions: ['png'] }]
            });
            if (!result.canceled && result.filePath) {
              mainWindow.webContents.send('menu-export-png', result.filePath);
            }
          }
        },
        {
          label: 'Экспорт в PDF',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
            });
            if (!result.canceled && result.filePath) {
              mainWindow.webContents.send('menu-export-pdf', result.filePath);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Выход' }
      ]
    },
    {
      label: 'Правка',
      submenu: [
        {
          label: 'Отменить',
          accelerator: 'CmdOrCtrl+Z',
          click: () => mainWindow.webContents.send('menu-undo')
        },
        {
          label: 'Вернуть',
          accelerator: 'CmdOrCtrl+Y',
          click: () => mainWindow.webContents.send('menu-redo')
        },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { role: 'delete', label: 'Удалить' },
        { type: 'separator' },
        { role: 'selectAll', label: 'Выделить всё' }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { role: 'reload', label: 'Перезагрузить' },
        { role: 'forceReload', label: 'Принудительная перезагрузка' },
        { role: 'toggleDevTools', label: 'Инструменты разработчика' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Сбросить масштаб' },
        { role: 'zoomIn', label: 'Увеличить' },
        { role: 'zoomOut', label: 'Уменьшить' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Полноэкранный режим' }
      ]
    },
    {
      label: 'Справка',
      submenu: [
        {
          label: 'О программе',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'О программе MathViz Architect',
              message: 'MathViz Architect v1.0.0',
              detail: 'Приложение для развития визуального мышления на уроках математики.\n\n© 2024 MiniMax Agent'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log('INFO', 'Main window shown');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    log('INFO', 'Main window closed');
  });
}

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'MathViz Projects', extensions: ['mvz'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('dialog:saveFile', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'project.mvz',
    filters: [
      { name: 'MathViz Projects', extensions: ['mvz'] }
    ]
  });
  return result;
});

ipcMain.handle('dialog:exportImage', async (event, format) => {
  const filters = format === 'png'
    ? [{ name: 'PNG Image', extensions: ['png'] }]
    : [{ name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }];

  const result = await dialog.showSaveDialog(mainWindow, {
    filters
  });
  return result;
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs:writeFile', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name);
});

// App lifecycle
app.whenReady().then(() => {
  log('INFO', 'App ready, creating window');
  createWindow();
});

app.on('window-all-closed', () => {
  log('INFO', 'All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  log('INFO', 'App quitting');
});
