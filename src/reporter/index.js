import * as Rx from "rxjs";
import { map, mergeAll } from "rxjs/operators";
import createDiffer from "ansi-diff";
import mergeOutputs from "./mergeOutputs.js";
import reporters from "./reporters/index.js";

export default function (opts) {
  const outputMaxWidth = opts.reportingOptions?.outputMaxWidth ?? (process.stdout.columns && process.stdout.columns - 2) ?? 80
  const output$ = toOutput$({
    ...opts,
    reportingOptions: {
      ...opts.reportingOptions,
      outputMaxWidth,
    },
  });

  if (opts.reportingOptions?.appendOnly) {
    const writeNext = opts.useStderr ? console.error.bind(console) : console.log.bind(console);
    const subscription = output$.subscribe({
      complete() {},
      error: (err) => console.error(err.message),
      next: writeNext,
    });
    return () => subscription.unsubscribe();
  }

  const diff = createDiffer({
    height: process.stdout.rows,
    outputMaxWidth,
  });

  const subscription = output$.subscribe({
    complete() {},
    error: (err) => logUpdate(err.message),
    next: logUpdate,
  });

  const write = opts.useStderr
    ? process.stderr.write.bind(process.stderr)
    : process.stdout.write.bind(process.stdout);

  function logUpdate(view) {
    if (!view.endsWith("\n")) view += "\n";
    write(diff.update(view));
  }

  return () => subscription.unsubscribe();
}

export function toOutput$(opts) {
  opts ??= {};
  
  const progressPushStream = new Rx.Subject();
  const testPushStream = new Rx.Subject();

  const otherPushStream = new Rx.Subject();

  setTimeout(() => {
    opts.streamParser["on"]("data", (log) => {
      switch (log.name) {
        case "pnp:progress":
          progressPushStream.next(log);
          break;
        case "pnp:test":
          testPushStream.next(log);
          break;
        case "pnp":
        case "pnp:global":
          otherPushStream.next(log);
          break;
      }
    });
  }, 0);

  const log$ = {
    progress: Rx.from(progressPushStream),
    test: Rx.from(testPushStream),
    other: Rx.from(otherPushStream),
  };

  const outputs = reporters(log$, {
    appendOnly: opts.reportingOptions?.appendOnly,
    logLevel: opts.reportingOptions?.logLevel,
    width: opts.reportingOptions?.outputMaxWidth,
  });

  if (opts.reportingOptions?.appendOnly) {
    return Rx.merge(...outputs).pipe(
      map((log) => log.pipe(map((msg) => msg.msg))),
      mergeAll(),
    );
  }

  return mergeOutputs(outputs);
}
