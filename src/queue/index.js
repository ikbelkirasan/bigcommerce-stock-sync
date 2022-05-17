import { ZapierStorage } from "./zapier-storage.js";
import { Queue } from "./queue.js";

export const createQueue = ({ worker, secretKey }) => {
  const storage = new ZapierStorage(secretKey);
  return new Queue({ storage, worker });
};
