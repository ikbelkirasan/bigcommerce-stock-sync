import config from "./config.js";
import axios from "./axios.js";
import { Workflow } from "./workflow/workflow.js";
import { createQueue } from "./queue/index.js";

// TODO: only process the last added job
// For the others, return status: "ignored-in-favor-of-newer-data"
// TODO: Don't remove job from the list of it errored

const worker = async ({ csvFileUrl, callbackUrl }) => {
  let workflow;
  try {
    workflow = new Workflow({ csvFileUrl });
    await workflow.start();
  } finally {
    try {
      await axios.post(callbackUrl, {
        result: workflow.result,
      });
    } catch (error) {
      console.error(
        "Failed to send a request to the callback url: %s - Error: %s",
        callbackUrl,
        error.message,
      );
    }
  }
};

export const queue = createQueue({
  secretKey: config.queue.secretKey,
  worker,
});
