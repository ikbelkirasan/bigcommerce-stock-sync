import _ from "lodash";

export class QueueStorage {
  #queue = [];
  #storage = null;

  constructor({ storage }) {
    this.#storage = storage;
  }

  async load() {
    this.#queue = (await this.#storage.load()) || [];
  }

  async save() {
    await this.#storage.save(this.#queue);
  }

  async shift() {
    const job = this.#queue.shift();
    await this.save();
    return job;
  }

  async getFirstJob() {
    return _.first(this.#queue);
  }

  async setJobActive(job) {
    job._active = true;
    await this.save();
  }

  async remove(job) {
    const index = _.findIndex(this.#queue, j => j === job);
    if (index >= 0) {
      this.#queue.splice(index, 1);
    }
    await this.save();
  }

  async push(job) {
    this.#queue.push(job);
    await this.save();
  }
}
