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

gulp.task('watch', () => {
  gulp.watch(paths.back, ['back'])
})

gulp.task('default', ['watch', 'back'])
