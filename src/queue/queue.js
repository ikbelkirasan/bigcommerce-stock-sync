import { EventEmitter } from "node:events";
import { QueueStorage } from "./queue-storage.js";

const STATE = {
  IDLE: "idle",
  PROCESSING: "processing",
  DONE: "done",
};

export class Queue {
  /**
   * @type {QueueStorage}
   */
  #queue = null;
  /**
   * @type {Promise}
   */
  #initPromise = null;
  /**
   * @type {Function}
   */
  #worker = null;
  /**
   * @type {EventEmitter}
   */
  #emitter = null;

  constructor({ worker, storage }) {
    this.#emitter = new EventEmitter();
    this.#queue = new QueueStorage({ storage });

    this.#worker = worker;
    this.status = STATE.IDLE;
    this.#initPromise = this.#init();
  }

  async add(job, autoStart = true) {
    await this.#initPromise;
    await this.#queue.push(job);

    // Important
    if (autoStart) {
      setImmediate(async () => {
        await this.process();
      });
    }
  }

  async process() {
    await this.#initPromise;
    if (this.status === STATE.PROCESSING) {
      return;
    }

    this.#setStatus(STATE.PROCESSING);
    let job;
    do {
      job = await this.#queue.getFirstJob();
      if (!job) {
        this.#setStatus(STATE.DONE);
        break;
      }

      try {
        await this.#queue.setJobActive(job);
        await this.#worker(job);
        await this.#queue.remove(job);
      } catch (error) {
        // TODO: handle worker failure
        throw error;
      }
    } while (!!job);

    this.#setStatus(STATE.IDLE);
  }

  onDone(fn, once = false) {
    this.#listen(STATE.DONE, fn, once);
  }

  async #init() {
    await this.#queue.load();
  }

  #setStatus(status, args) {
    if (status !== this.status) {
      this.status = status;
      this.#emitter.emit(status, args);
    }
  }

  #listen(event, fn, once = false) {
    const method = once ? "once" : "on";
    this.#emitter[method](event, fn);
  }
}
