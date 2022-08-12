import * as Rx from "rxjs"
import { map } from "rxjs/operators"

export const LOG_LEVEL_NUMBER = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

export default (log$) => {
  return log$.other.pipe(
    map((log) => {
      return Rx.of({ msg: "misc: " + log["message"] });
    })
  )
}