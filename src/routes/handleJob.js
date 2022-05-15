import { Workflow } from "../workflow/workflow.js";
import axios from "../axios.js";

export default async function handleJob(req) {
  const { csvFileUrl, callbackUrl } = req.body;

  const workflow = new Workflow({ csvFileUrl });
  const promise = workflow
    .start()

    .finally(() => {
      axios.post(callbackUrl, {
        result: workflow.result,
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
