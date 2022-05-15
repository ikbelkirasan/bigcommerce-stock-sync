import Fastify from "fastify";
import handleJob from "./routes/handleJob.js";

const fastify = Fastify({
  logger: {
    prettyPrint: true,
  },
});

fastify.post("/jobs", handleJob);

const port = process.env.PORT || 5000;
fastify.listen(port);
