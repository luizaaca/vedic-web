declare global {
  interface ReactNativeWebView {
    postMessage(message: string): void;
  }

  interface Window {
    readonly ReactNativeWebView?: ReactNativeWebView;
  }  
}
export {};
