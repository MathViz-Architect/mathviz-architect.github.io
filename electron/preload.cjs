const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  exportImage: (format) => ipcRenderer.invoke('dialog:exportImage', format),

  // File system
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),

  // App paths
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),

  // Menu event listeners
  onMenuNewProject: (callback) => {
    ipcRenderer.on('menu-new-project', callback);
    return () => ipcRenderer.removeListener('menu-new-project', callback);
  },
  onMenuOpenProject: (callback) => {
    ipcRenderer.on('menu-open-project', (event, filePath) => callback(filePath));
    return () => ipcRenderer.removeListener('menu-open-project', callback);
  },
  onMenuSaveProject: (callback) => {
    ipcRenderer.on('menu-save-project', callback);
    return () => ipcRenderer.removeListener('menu-save-project', callback);
  },
  onMenuSaveProjectAs: (callback) => {
    ipcRenderer.on('menu-save-project-as', callback);
    return () => ipcRenderer.removeListener('menu-save-project-as', callback);
  },
  onMenuExportPng: (callback) => {
    ipcRenderer.on('menu-export-png', (event, filePath) => callback(filePath));
    return () => ipcRenderer.removeListener('menu-export-png', callback);
  },
  onMenuExportPdf: (callback) => {
    ipcRenderer.on('menu-export-pdf', (event, filePath) => callback(filePath));
    return () => ipcRenderer.removeListener('menu-export-pdf', callback);
  },
  onMenuUndo: (callback) => {
    ipcRenderer.on('menu-undo', callback);
    return () => ipcRenderer.removeListener('menu-undo', callback);
  },
  onMenuRedo: (callback) => {
    ipcRenderer.on('menu-redo', callback);
    return () => ipcRenderer.removeListener('menu-redo', callback);
  }
});

// Log that preload script has loaded
console.log('Preload script loaded');
