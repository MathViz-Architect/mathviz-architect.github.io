// Type declarations for Electron API exposed via preload

export interface ElectronAPI {
  // File dialogs
  openFile: () => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
  saveFile: (defaultName?: string) => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;
  exportImage: (format: 'png' | 'jpg') => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;

  // File system
  readFile: (filePath: string) => Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }>;
  writeFile: (filePath: string, data: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // App paths
  getPath: (name: string) => Promise<string>;

  // Menu event listeners
  onMenuNewProject: (callback: () => void) => () => void;
  onMenuOpenProject: (callback: (filePath: string) => void) => () => void;
  onMenuSaveProject: (callback: () => void) => () => void;
  onMenuSaveProjectAs: (callback: () => void) => () => void;
  onMenuExportPng: (callback: (filePath: string) => void) => () => void;
  onMenuExportPdf: (callback: (filePath: string) => void) => () => void;
  onMenuUndo: (callback: () => void) => () => void;
  onMenuRedo: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
