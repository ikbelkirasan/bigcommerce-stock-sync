import { queue } from "../queue.js";

queue.process();

export default async function handleJob(req) {
  const { csvFileUrl, callbackUrl } = req.body;

  // Create a new job
  await queue.add({
    csvFileUrl,
    callbackUrl,
  });

  return {
    started: new Date().toISOString(),
  };
}
