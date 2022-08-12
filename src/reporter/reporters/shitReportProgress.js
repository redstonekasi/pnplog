import { loadavg } from "os";
import * as Rx from "rxjs"
import { map, startWith } from "rxjs/operators"
import { zoomOut } from "./utils/zooming.js";

export default (log$, opts) => {
  
  return getInstallProgress$(log$.stage, log$.progress).pipe(
    map(({ installingDone$, progress$, requirer }) => {
      const output$ = Rx.combineLatest(
        progress$,
        installingDone$,
      ).pipe(map(createStatusMessage));
      
      return output$.pipe(
        map((msg) => {
          msg["msg"] = zoomOut(opts.cwd, requirer, msg["msg"])
          return msg;
        })
      )
    })
  )
}

function getInstallProgress$(stage$, progress$) {
  const installProgressPushStream = new Rx.Subject();
  const progressStatsPushStream = getProgressStatsPushStream(progress$);

  const stagePushStream = {};

  stage$.forEach((log) => {
    if (!stagePushStream[log.prefix]) {
      stagePushStream[log.prefix] = new Rx.Subject();
      if (!progressStatsPushStream[log.prefix]) {
        progressStatsPushStream[log.prefix] = new Rx.Subject();
      }
      installProgressPushStream.next({
        installingDone$: stage$ToInstallingDone$(Rx.from(stagePushStream[log.level])),
        progress$: Rx.from(progressStatsPushStream[log.prefix]),
        requirer: log.prefix,
      });
    }
    stagePushStream[log.prefix].next(log);
    if (log.stage === "installing_done") {
      progressStatsPushStream[log.prefix].complete();
      stagePushStream[log.prefix].complete();
    }
  }).catch(() => {});

  return Rx.from(installProgressPushStream);
}

function stage$ToInstallingDone$ (stage$) {
  return stage$
    .pipe(
      filter((log) => log.stage === "installing_done"),
      mapTo(true),
      take(1),
      startWith(false),
    );
}

function getProgressStatsPushStream(progress$) {
  const progressStatsPushStream = {};
  const previousProgressStats = {}
  
  progress$.forEach((log) => {
    if (!previousProgressStats[log.requester]) {
      previousProgressStats[log.requester] = {
        resolved: 0,
        fetched: 0,
        installed: 0,
      }

      switch (log.status) {
        case "resolved":
          previousProgressStats[log.requester].resolved++
          break;
        case "fetched":
          previousProgressStats[log.requester].fetched++
          break;
        case "installed":
          previousProgressStats[log.requester].installed++
          break;
      }

      if (!progressStatsPushStream[log.requester]) {
        progressStatsPushStream[log.requester] = new Rx.Subject();
      }
      progressStatsPushStream[log.requester].next(previousProgressStats[log.requester]);
    }
  }).catch(() => {});
  return progressStatsPushStream;
}

function createStatusMessage([progress, installingDone]) {
  const msg = `test status: ${progress.resolved.toString()} resolved, ${progress.fetched.toString()} fetched, ${progress.installed.toString()} installed`;

  if (installingDone) {
    return {
      done: true,
      fixed: false,
      msg: `${msg}, done`,
    }
  }

  return {
    fixed: true,
    msg,
  }
}