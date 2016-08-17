import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import cache from 'gulp-cached'

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
