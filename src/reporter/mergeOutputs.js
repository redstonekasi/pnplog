import * as Rx from "rxjs";
import { filter, map, mergeAll, scan } from "rxjs/operators";

export default function mergeOutputs(outputs) {
  let blockNo = 0;
  let fixedBlockNo = 0;
  let started = 0;
  let previousOutput = null;

  return Rx.merge(...outputs).pipe(
    map((log) => {
      let currentBlockNo = -1;
      let currentFixedBlockNo = -1;
      return log.pipe(
        map((msg) => {
          if (msg["fixed"]) {
            if (currentFixedBlockNo === -1) {
              currentFixedBlockNo = fixedBlockNo++;
            }
            return {
              blockNo: currentFixedBlockNo,
              fixed: true,
              msg: msg.msg,
            };
          }
          if (currentBlockNo === -1) {
            currentBlockNo = blockNo++;
          }
          
          return {
            blockNo: currentBlockNo,
            fixed: false,
            msg: typeof msg === "string" ? msg : msg.msg,
            prevFixedBlockNo: currentFixedBlockNo,
          };
        }),
      );
    }),
    mergeAll(),
    scan(
      (acc, log) => {
        if (log.fixed) {
          acc.fixedBlocks[log.blockNo] = log.msg;
        } else {
          delete acc.fixedBlocks[log["prevFixedBlockNo"]];
          acc.blocks[log.blockNo] = log.msg;
        }
        return acc;
      },
      { fixedBlocks: [], blocks: [] },
    ),
    map((sections) => {
      const fixedBlocks = sections.fixedBlocks.filter(Boolean);
      const nonFixedPart = sections.blocks.filter(Boolean).join("\n");
      if (fixedBlocks.length === 0) {
        return nonFixedPart;
      }
      const fixedPart = fixedBlocks.join("\n");
      if (!nonFixedPart) {
        return fixedPart;
      }
      return `${nonFixedPart}\n${fixedPart}`;
    }),
    filter((msg) => {
      if (started) {
        return true;
      }
      if (msg === "") return false;
      started = true;
      return true;
    }),
    filter((msg) => {
      if (msg !== previousOutput) {
        previousOutput = msg;
        return true;
      }
      return false;
    }),
  );
}
