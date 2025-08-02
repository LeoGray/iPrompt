interface TauriDialogOptions {
  defaultPath?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
  multiple?: boolean
  directory?: boolean
  title?: string
}

interface TauriInvokeArgs {
  [key: string]: unknown
}

declare global {
  interface Window {
    __TAURI__?: {
      invoke: <T = unknown>(command: string, args?: TauriInvokeArgs) => Promise<T>
      dialog: {
        save: (options?: TauriDialogOptions) => Promise<string | null>
        open: (options?: TauriDialogOptions) => Promise<string | string[] | null>
      }
      fs: {
        writeTextFile: (path: string, contents: string) => Promise<void>
        readTextFile: (path: string) => Promise<string>
      }
    }
  }
}

export {}