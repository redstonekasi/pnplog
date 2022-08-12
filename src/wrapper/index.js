import logger, { globalInfo, globalWarn } from "./logger.js";
import streamParser, { createStreamParser } from "./streamParser.js";
import writeToConsole from "./writeToConsole.js";

export default logger;

export { globalInfo, globalWarn, streamParser, createStreamParser, writeToConsole };
