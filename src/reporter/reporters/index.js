import reportMisc, { LOG_LEVEL_NUMBER } from "./reportMisc.js";
import reportProgress from "./reportProgress.js";

export default function(log$, opts) {
  const cwd = process.cwd();
  const width = opts.width ?? process.stdout.columns ?? 80

  const outputs = [
    reportMisc(log$),
  ];

  // logLevelNumber: 0123 = error warn info debug
  const logLevelNumber = LOG_LEVEL_NUMBER[opts.logLevel ?? 'info'] ?? LOG_LEVEL_NUMBER['info'];

  if (logLevelNumber >= LOG_LEVEL_NUMBER.info) {
    outputs.push(reportProgress(log$, { cwd }));
  }

  return outputs;
}