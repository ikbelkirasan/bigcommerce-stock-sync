import Fastify from "fastify";
import config from "./config.js";
import handleJob from "./routes/handleJob.js";

const startDate = new Date();
const { host, port } = config.web;

const fastify = Fastify({
  logger: {
    prettyPrint: true,
  },
});

fastify.get("/heartbeat", () => ({
  status: "ok",
  upSince: startDate.toISOString(),
}));

fastify.post("/jobs", handleJob);

try {
  await fastify.listen(port, host);
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
