import babel from 'rollup-plugin-babel'

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
  format: 'cjs'
}
