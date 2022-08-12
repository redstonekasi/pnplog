import { filter, map } from "rxjs/operators";

export default (log$) => {
  const lastStatus = {};
  return log$.progress.pipe(
    filter((log) => log.status === "started"),
    map((started) => {
      return log$.progress.pipe(
        filter((log) => log.level === started.level),
        map((log) => {
          const done = log.status === "finished";
          const status = !done ? `${log.resolved} resolved, ${log.fetched} fetched, ${log.installed} installed` : lastStatus[log.level]
          lastStatus[log.level] = status;
          return {
            fixed: !done,
            msg: `${status}${done ? ", done" : ""}`
          }
        })
      )
    })
  )
}