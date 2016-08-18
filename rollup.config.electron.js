import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'

const external = [
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
    nodeResolve({
      jsnext: true,
      main: true,
      module: true
    }),
    babel({
      plugins: [
        'transform-async-to-generator'
      ]
    })
  ],
  format: 'cjs',
  external
}
