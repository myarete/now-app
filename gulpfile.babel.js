import gulp from 'gulp'
import babel from 'gulp-babel'
import cache from 'gulp-cached'

const path = 'src/**/*'

gulp.task('transpile', () => {
  return gulp.src(path)
  .pipe(cache('transpile'))
  .pipe(babel())
  .pipe(gulp.dest('app/dist/back'))
})

gulp.task('watch', () => gulp.watch(path, ['transpile']))
gulp.task('default', ['watch', 'transpile'])
