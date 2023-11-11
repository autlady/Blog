// подключение gulp
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require("gulp-watch");
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gcmq = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
const pug = require('gulp-pug');
const del = require('del');

// сборка gulp файлов
gulp.task('pug', function () {
    return gulp.src('./src/pug/pages/**/*.pug')
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'Pug',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.stream())
    callback();
});


// компиляция SCSS в СSS
gulp.task('scss', function (callback) {
    return gulp.src('./src/scss/main.scss')
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass({
            indentType: 'tab',
            indentWidth: 1,
            outputStyle: "expanded"
        }))
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream())
    callback();
});

// копирование изображений
gulp.task('copy:img', function () {
    return gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./build/img'))
    callback();
});

// копирование скриптов
gulp.task('copy:js', function () {
    return gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./build/js'))
    callback();
});

// слежение за HTML и CSS и обновление браузера

gulp.task('watch', function () {

    // слежение за картинками и скриптами и обновление браузера
    watch(['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload))

    // запуск слежения и компиляции SCSS с задержкой
    watch('./src/scss/**/*.scss', function () {
        setTimeout(gulp.parallel('scss'), 1000)
    })

    // слежение за PUG и сборка
    watch('./src/pug/**/*.pug', gulp.parallel('pug'))

    // слежение за картинками и скриптами и копирование их в build
    watch('./src/img/**/*.*', gulp.parallel('copy:img'))
    watch('./src/js/**/*.*', gulp.parallel('copy:js'))
});

// задача для старта сервера из папки app

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    })
});

gulp.task('clean:build', function () {
    return del('./build')
});

gulp.task(
    'default',
    gulp.series(
        gulp.parallel('clean:build'),
        gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'),
        gulp.parallel('server', 'watch'),
    )
);