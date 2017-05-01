let gulp = require('gulp');
    htmlmin = require('gulp-htmlmin'),
    cleanCSS = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    jsmin = require('gulp-jsmin'),
    rename = require('gulp-rename'),
    image = require('gulp-image'),
    webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    browserSync = require('browser-sync').create();

gulp.task('html', ()=>{
    return gulp.src('./app/*.html')
        //.pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('css',  () => {
  return gulp.src('./app/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});
 

gulp.task('js',  () => {
  return gulp.src('./app/js/*.js')
    .pipe(concat('all.js'))
    //.pipe(babel({
    //        presets: ['es2015']
    //}))
    //.pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream());
});
 
gulp.task('img',  () => {
  return gulp.src('./app/img/*')
    //pipe(image())
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('browser-sync', ['css', 'js', 'img', 'html'],function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    gulp.watch("app/css/*.css", ['css']).on('change', browserSync.reload);
    gulp.watch("app/js/*.js", ['js']).on('change', browserSync.reload);
    gulp.watch("app/*.html", ['html']).on('change', browserSync.reload);
});

gulp.task('default', ['html', 'css', 'js', 'img', 'browser-sync']);