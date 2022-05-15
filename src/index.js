import Fastify from "fastify";
import handleJob from "./routes/handleJob.js";

const fastify = Fastify({
  logger: {
    prettyPrint: true,
  },
});

fastify.post("/jobs", handleJob);

fastify.listen(5000);
