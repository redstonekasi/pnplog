import createReporter from "../reporter/index.js";
import globalLogger, { streamParser } from "../wrapper/index.js";
import { progressLogger }  from "../loggers/index.js";

createReporter({
  useStderr: false,
  reportingOptions: {
    appendOnly: false,
    logLevel: "info",
  },
  streamParser,
});

globalLogger.info("hello world");

progressLogger.debug({
  status: "started",
});

let log = {
  status: "installing",
  installed: 0,
  fetched: 0,
  resolved: 0,
}
for (let i = 0; i < 100000; i++) {
  const prop = ["installed", "fetched", "resolved"][Math.floor(Math.random() * 3)]
  log[prop]++
  progressLogger.debug(log);

  if (i % 20000 === 0) {
    globalLogger.info("test", i)
  }
}

progressLogger.debug({
  status: "finished",
});