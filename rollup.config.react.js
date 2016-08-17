import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './app/react/index.js',
  dest: './app/dist/react.js',
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: [
        'node_modules/**'
      ]
    }),
    babel({
      babelrc: false,
      presets: [
        'react',
        'es2015-rollup'
      ]
    })
  ],
  format: 'cjs'
}
