import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'

const external = [
  'path',
  'electron'
]

const devDependencies = require('./app/package').dependencies

for (const dependency in devDependencies) {
  if (!{}.hasOwnProperty.call(devDependencies, dependency)) {
    continue
  }

  external.push(dependency)
}

export default {
  entry: './src/electron/index.js',
  dest: './app/dist/electron.js',
  plugins: [
    json(),
    babel({
      plugins: [
        'transform-async-to-generator'
      ]
    })
  ],
  format: 'cjs',
  external
}
