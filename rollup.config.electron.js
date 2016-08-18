import babel from 'rollup-plugin-babel'

const external = []
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
    babel({
      plugins: [
        'transform-async-to-generator'
      ]
    })
  ],
  format: 'cjs',
  external
}
