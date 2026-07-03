import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

/**
 * Strategy interface to customize/isolate how Monaco Web Workers are loaded.
 */
export interface WorkerLoader {
  getWorker(workerId: string, label: string): Worker;
}

/**
 * Default implementation of WorkerLoader that uses Vite's worker import syntax.
 */
export class DefaultWorkerLoader implements WorkerLoader {
  public getWorker(_workerId: string, label: string): Worker {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "less" || label === "scss") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  }
}
