export default class WebWorker extends Worker {
  constructor(worker) {
    const code = worker.toString();
    const blob = new Blob([`(${code})()`]);
    const objectUrl = URL.createObjectURL(blob);
    const workerInstance = new Worker(objectUrl);
    workerInstance.objectUrl = objectUrl;
    return workerInstance;
  }
}
