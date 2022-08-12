import bole from "bole";
import ndjson from "ndjson";

export default createStreamParser();

export function createStreamParser() {
  const sp = ndjson.parse();
  bole.output([
    {
      level: "debug",
      stream: sp,
    },
  ]);
  return sp;
}
