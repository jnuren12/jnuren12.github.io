var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()
var del = require('del')
var runSequence = require('run-sequence')
var browserSync = require('browser-sync')

var reload = browserSync.reload

gulp.task('clean', () => {
  return del(['dist'])
})

gulp.task('browser-sync', () => {
  browserSync({
    server: 'dist',
    port: 8080,
    open: false,
    notify: false
  })
})

gulp.task('html', () => {
  return gulp.src([ 'src/*.html' ])
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.htmlmin({
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true
      }))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('dist'))
    .pipe(reload({ stream: true }))
})

gulp.task('misc', () => {
  return gulp.src([
    'src/**',
    '!src/{js/js/**}'
  ]).pipe(gulp.dest('dist'))
})

gulp.task('build', () => {
  return runSequence('clean', [ 'html', 'misc' ])
})

gulp.task('default', ['build'])
