import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import cache from 'gulp-cached'

import rollup from 'rollup-stream'
import rollupBabel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

import source from 'vinyl-source-stream'

const paths = {
  back: 'src/**/*',
  front: 'app/react/index.js'
}

gulp.task('back', () => {
  return gulp.src(paths.back)
  .pipe(cache('back'))
  .pipe(gulpBabel())
  .pipe(gulp.dest('app/dist/back'))
})

gulp.task('front', () => {
  return rollup({
    entry: paths.front,
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
      rollupBabel({
        babelrc: false,
        presets: [
          'react',
          'es2015-rollup'
        ]
      })
    ],
    format: 'cjs'
  })
  .pipe(source('app.js'))
  .pipe(gulp.dest('app/dist/front'))
})

gulp.task('watch', () => {
  gulp.watch(paths.front, ['front'])
  gulp.watch(paths.back, ['back'])
})

gulp.task('default', ['watch', 'front', 'back'])
