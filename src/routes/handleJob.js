import { Workflow } from "../workflow/workflow.js";
import axios from "../axios.js";

export default async function handleJob(req) {
  const { csvFileUrl, callbackUrl } = req.body;

  const workflow = new Workflow({ csvFileUrl });
  const promise = workflow
    .start()

    .finally(() => {
      axios
        .post(callbackUrl, {
          result: workflow.result,
        })
        .catch(error => {
          console.error(
            "Failed to send a request to the callback url: %s - Error: %s",
            callbackUrl,
            error.message,
          );
        });
    });

  const response = {
    started: new Date().toISOString(),
  };

  Object.defineProperty(response, "jobPromise", {
    value: promise,
    enumerable: false,
  });

  return response;
}
