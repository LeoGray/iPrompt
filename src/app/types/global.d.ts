declare global {
  interface Window {
    __TAURI__?: {
      invoke: (command: string, args?: any) => Promise<any>
      dialog: {
        save: (options?: any) => Promise<string | null>
        open: (options?: any) => Promise<string | string[] | null>
      }
      fs: {
        writeTextFile: (path: string, contents: string) => Promise<void>
        readTextFile: (path: string) => Promise<string>
      }
    }
  }
}

export {}