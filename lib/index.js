const fs = require('fs')
const path = require('path')

const writeFile = (filePath, json, newVersion) => {
  fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', () => {
    console.log('The version has been successfully updated.')
    console.log(newVersion)

    process.exit()
  })
}

const getObjValue = (obj, path) => {
  const split = path.split('.')

  if (split[0]) {
    const newObj = obj[split[0]]

    if (!newObj && newObj !== 0) {
      throw new Error('Invalid path !')
    }

    return getObjValue(newObj, split.slice(1).join('.'))
  }

  return obj
}

const setObjValue = (obj, path, value) => {
  const split = path.split('.')
  let i = 0

  for (i = 0; i < split.length - 1; i++) {
    obj = obj[split[i]]
  }

  obj[split[i]] = value
}

const increment = () => {
  const argv = require('minimist')(process.argv.slice(2))

  const helpArg = argv['h'] || argv['help']

  if (helpArg) {
    console.log('Usage json-version-inc [options]\n')
    console.log('Options:')
    console.log(' -h, --help', '  prints this help message')
    console.log(' -j, --json', '  path to the json file (required)')
    console.log(
      ' -p, --path',
      '  path to the json property you want to increment e.g. `expo.ios.bundleNumber` (required)'
    )
    console.log(' -t, --type', '  version increment type MAJOR, MINOR, PATCH (required)\n')
    console.log('Note: if the provided json property is a number it will simply increment, regardless the type argument')

    return
  }

  const pathArg = argv['p'] || argv['path']

  if (!pathArg && typeof pathArg !== 'string') {
    throw new Error('Object path as string is required')
  }

  const jsonArg = argv['j'] || argv['json']

  if (!jsonArg && typeof jsonArg !== 'string') {
    throw new Error('Json path as string is required')
  }

  const typeArg = argv['t'] || argv['type']

  if (!typeArg) {
    throw new Error('Type is required')
  }

  if (typeArg !== 'MAJOR' && typeArg !== 'MINOR' && typeArg !== 'PATCH') {
    throw new Error('Type should be one of MAJOR, MINOR, PATCH')
  }

  const json = require(path.resolve(jsonArg))

  if (typeof json !== 'object' || json === null) {
    throw new Error('The provided file is not a json')
  }

  const versionNumber = getObjValue(json, pathArg)

  if (!versionNumber && versionNumber !== 0) {
    throw new Error('Invalid object path provided')
  }

  if (typeof versionNumber === 'number') {
    setObjValue(json, pathArg, versionNumber + 1)

    writeFile(jsonArg, json, versionNumber + 1)

    return
  }

  if (typeof versionNumber !== 'string') {
    throw new Error('Invalid object path provided')
  }

  const versionSplit = versionNumber.split('.')

  if (versionSplit.length !== 3) {
    throw new Error('Provided version format is invalid it must be in the from of `1.0.0`')
  }

  const patchVersion = typeArg === 'PATCH' ? parseInt(versionSplit[2], 10) + 1 : versionSplit[2]

  const minorVersion = typeArg === 'MINOR' ? parseInt(versionSplit[1], 10) + 1 : versionSplit[1]

  const majorVersion = typeArg === 'MAJOR' ? parseInt(versionSplit[0], 10) + 1 : versionSplit[0]

  const newVersion = [majorVersion, minorVersion, patchVersion].join('.')

  setObjValue(json, pathArg, newVersion)

  writeFile(jsonArg, json, newVersion)
}

exports.increment = increment
