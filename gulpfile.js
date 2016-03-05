// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');

// Lint Task
gulp.task('lint', function() {
  return gulp.src('src/*.js')
      .pipe(jshint({
        multistr: true,
        validthis: true,
        evil: true
      }))
      .pipe(jshint.reporter('default'));
});

// Add templates to templateCache
gulp.task('templates', function() {
  return gulp.src('src/templates/*.html')
      .pipe(templateCache({
        root: 'cn-forms/templates',
        module: 'cn.forms'
      }))
      .pipe(gulp.dest('src'));
});

// Concatenate & Minify JS
gulp.task('scripts', ['lint', 'templates'], function() {
  return gulp.src('src/*.js')
      .pipe(concat('all.js'))
      .pipe(gulp.dest('dist'))
      .pipe(rename('all.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('src/templates/*.html', ['templates']);
  gulp.watch('src/*.js', ['lint', 'scripts']);
});

// Build Task
gulp.task('build', ['lint', 'templates', 'scripts']);

// Default Task
gulp.task('default', ['build', 'watch']);