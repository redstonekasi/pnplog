import bole from "bole";

bole.setFastTime();

export default bole("pnp");

const globalLogger = bole("pnp:global");

export function globalWarn(message) {
  globalLogger.warn(message);
}

export function globalInfo(message) {
  globalLogger.info(message);
}
