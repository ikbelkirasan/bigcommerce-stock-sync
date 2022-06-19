import { queue } from "../queue.js";
import config from "../config.js";

queue.process();

export default async function handleJob(req, res) {
  const { csvFileUrl, callbackUrl, secretKey } = req.body;

  if (secretKey !== config.queue.secretKey) {
    return res.code(401).send({
      error: "Invalid secret key",
    });
  }

  // Create a new job
  await queue.add({
    csvFileUrl,
    callbackUrl,
  });

  return {
    started: new Date().toISOString(),
  };
}
