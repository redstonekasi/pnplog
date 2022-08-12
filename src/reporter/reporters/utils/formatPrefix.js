import path from 'path'
import normalize from 'normalize-path'

export default function formatPrefix (cwd, prefix) {
  prefix = formatPrefixNoTrim(cwd, prefix)

  if (prefix.length <= 40) {
    return prefix
  }

  const shortPrefix = prefix.slice(-40 + 3)

  const separatorLocation = shortPrefix.indexOf('/')

  if (separatorLocation <= 0) {
    return `...${shortPrefix}`
  }

  return `...${shortPrefix.slice(separatorLocation)}`
}

export function formatPrefixNoTrim (cwd, prefix) {
  return normalize(path.relative(cwd, prefix) || '.')
}