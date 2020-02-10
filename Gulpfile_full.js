var gulp = require('gulp'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babelify = require('babelify'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create()

// SETTINGS
var cfg = {
  scripts: {
    src: './frontend/assets/js/**/*',
    dist: './public/assets/js/',
    filename: 'bundle.js',
    entrypoint: './frontend/assets/js/main.js',
  },
  styles: {
    src: './frontend/assets/scss/**/*',
    dist: './public/assets/css/',
  },
  img: {
    src: './frontend/assets/img/**/*',
    dist: './public/assets/img/',
  },
  fonts: {
    src: './frontend/assets/fonts/**/*',
    dist: './public/assets/fonts/',
  },
}

// SCRIPTS
gulp.task('js-rebuild', function () {
  return browserify({entries: cfg.scripts.entrypoint, debug: true})
    .transform("babelify", { presets: ["env"] })
    .bundle()
    .pipe(source(cfg.scripts.filename))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(cfg.scripts.dist))
    .pipe(browserSync.stream())
})

// COPY IMAGES
gulp.task('images-rebuild', function() {
  return gulp.src(cfg.img.src)
    .pipe(gulp.dest(cfg.img.dist))
    .pipe(browserSync.stream())
})

// STYLES
gulp.task('sass-rebuild', function () {
  gulp.src(cfg.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', function(err) {
      console.error(err.message)
      browserSync.notify(err.message, 3000)
      this.emit('end')
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cfg.styles.dist))
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(cfg.styles.dist))
    .pipe(browserSync.stream())
})

// FONTS
gulp.task('fonts-rebuild', function () {
  gulp.src(cfg.fonts.src)
    .pipe(gulp.dest(cfg.fonts.dist))
    .pipe(browserSync.stream())
})

// BROWSER SYNC
gulp.task('serve', function() {
  browserSync.init({
    server: './public'
  })

  gulp.watch('Gulpfile.js').on('change', () => process.exit(0))
})

// watch just the sass files
gulp.task('watch-sass', ['sass-rebuild'], function() {
  gulp.watch([cfg.styles.src], ['sass-rebuild'])
})

// watch just the js files
gulp.task('watch-js', ['js-rebuild'], function() {
  gulp.watch([cfg.scripts.src], ['js-rebuild'])
})

// watch just the image files
gulp.task('watch-images', ['images-rebuild'], function() {
  gulp.watch([cfg.img.src], ['images-rebuild'])
})

// watch just the font files
gulp.task('watch-fonts', ['fonts-rebuild'], function() {
  gulp.watch([cfg.fonts.src], ['fonts-rebuild'])
})

gulp.task('default', ['serve', 'watch-sass', 'watch-js', 'watch-images', 'watch-fonts'])

gulp.task('build', ['sass-rebuild', 'js-rebuild', 'images-rebuild', 'fonts-rebuild'])