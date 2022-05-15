import Fastify from "fastify";
import config from "./config.js";
import handleJob from "./routes/handleJob.js";

const fastify = Fastify({
  logger: {
    prettyPrint: true,
  },
});

fastify.post("/jobs", handleJob);

const { host, port } = config.web;
fastify.listen(port, host);
