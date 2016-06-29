'use strict'

var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var through = require('through2')
var browserSync = require('browser-sync')
var browserify = require('browserify')
var globby = require('globby')
var del = require('del')
var runSequence = require('run-sequence')

var reload = browserSync.reload

gulp.task('clean', () => {
  return del(['./dist'])
})

gulp.task('browser-sync', () => {
  browserSync({
    server: './dist',
    port: 8080,
    open: false,
    notify: false
  })
})

gulp.task('html', () => {
  return gulp.src(['./src/*.html'])
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.htmlmin({
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true
      }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
    .pipe(reload({stream: true}))
})

gulp.task('js', function () {
  var bundledStream = through()

  bundledStream
    .pipe(source('bundle.js'))
    // streaming is not supported for sourcemaps, use buffer instead
    .pipe(buffer())
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
      .pipe(plugins.uglify())
      .on('error', plugins.util.log)
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(reload({stream: true}))

  // globby make the stream readable for Browserify
  globby([
    './src/js/*.js'
  ]).then(entries => {
    var b
    if (plugins.util.env.production) {
      b = browserify()
    } else {
      b = browserify({
        fullPaths: true,
        debug: true
      })
    }

    b.add(entries)
    // pipe the Browserify stream into the bundledStream
    b.bundle().pipe(bundledStream)
  }).catch(err => {
    bundledStream.emit('error', err)
  })

  return bundledStream
})

gulp.task('misc', () => {
  return gulp.src([
    './src/**',
    '!./src/js/*.js'
  ]).pipe(gulp.dest('./dist'))
    .pipe(reload({stream: true}))
})

gulp.task('watch', ['build'], () => {
  gulp.watch(['./src/*.html'], ['html'])
  // TODO: watch individually the js files, not as a whole,
  // simply use watchify instead
  gulp.watch(['./src/js/*.js'], ['js'])
})

gulp.task('build', () => {
  return runSequence('clean', ['html', 'js', 'misc'])
})

gulp.task('serve', ['browser-sync', 'watch'])
gulp.task('default', ['build'])
