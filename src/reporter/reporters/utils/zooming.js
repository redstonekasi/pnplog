import rightPad from 'right-pad'
import formatPrefix from './formatPrefix.js'

export function autozoom (currentPrefix, logPrefix, line, opts) {
  if (!logPrefix || !opts.zoomOutCurrent && currentPrefix === logPrefix) {
    return line
  }
  return zoomOut(currentPrefix, logPrefix, line)
}

export function zoomOut (currentPrefix, logPrefix, line) {
  return `${rightPad(formatPrefix(currentPrefix, logPrefix), 40)} | ${line}`
}