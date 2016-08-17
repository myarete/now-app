import babel from 'rollup-plugin-babel'

export default {
  entry: './src/index.js',
  dest: './app/dist/electron.js',
  plugins: [
    babel({
      babelrc: false,
      presets: [
        'es2015-rollup'
      ],
      plugins: [
        'transform-async-to-generator'
      ]
    })
  ],
  format: 'cjs'
}
