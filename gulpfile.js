/* jshint node:true */
'use strict';

// gulpプラグインの読み込み
// ------------------------------------------
var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    del = require('del'),
    glob = require('glob'),
    autoprefixer = require('gulp-autoprefixer'),
    cache = require('gulp-cache'),
    cmq = require('gulp-combine-media-queries'),
    filter = require('gulp-filter'),
    flatten = require('gulp-flatten'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    gulpif = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    minifyCss = require('gulp-minify-css'),
    plumber = require('gulp-plumber'),
    replace = require('gulp-replace'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss'),
    useref = require('gulp-useref'),
    runSequence = require('run-sequence'),
    mainBowerFiles = require('main-bower-files'),
    wiredep = require('wiredep').stream;


// jade to html コンパイル
// ------------------------------------------
gulp.task('jade', function() {
  return gulp.src(['dev/jade/**/*.jade', '!dev/jade/**/_*.jade'])
    // .pipe(changed('jade', {extension: '.jade'}))
    .pipe(jade({
      pretty: true,
      basedir: 'dev/jade'
    }))
    .pipe(gulp.dest('dev'));
});


// Sass コンパイル
// ------------------------------------------
gulp.task('sass', function () {
  return gulp.src('dev/scss/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({sourcemap: true}))
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dev/css'));
});


// アイコンフォント生成
// ------------------------------------------
gulp.task('iconfonts', function(){
  gulp.src(['dev/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: 'myicons',
      path: 'dev/icons/templates/_icons.scss',
      targetPath: '../scss/_icons.scss',
      fontPath: '../fonts/'
    }))
    .pipe(iconfont({
      fontName: 'myicons'
     }))
    .pipe(gulp.dest('dev/fonts'));
});


// Lint JavaScript
// ------------------------------------------
gulp.task('jshint', function () {
  return gulp.src('dev/scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});


// HTMLで参照しているCSS/JSファイルを結合・minify
// ------------------------------------------
gulp.task('html', ['sass'], function () {
  var assets = useref.assets({searchPath: 'dev'});

  return gulp.src('dev/*.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', uncss({
      html: glob.sync('dev/*.html'),
      ignore: [
        /\.mdn-/,
        /\.js-/,
        /\.open/,
        /\.active/,
        /\.collapse/,
        /\.tooltip/,
        /\.popover/,
        /\.carousel/,
        /\.in/
      ]
    })))
    .pipe(gulpif('*.css', cmq()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulpif('*.css', replace('../../bower_components/bootstrap-sass-official/assets/fonts/bootstrap','../fonts')))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('htdocs'));
});


// jpeg, png, gif, svgの最適化
// ------------------------------------------
gulp.task('images', function () {
  return gulp.src('dev/images/**/*')
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('htdocs/images'));
});


// BowerでインストールしたWebフォントをコピー
// ------------------------------------------
gulp.task('fonts', function () {
  return gulp.src(mainBowerFiles().concat('dev/fonts/**/*'))
    .pipe(filter('**/*.{eot,svg,ttf,woff}'))
    .pipe(flatten())
    .pipe(gulp.dest('htdocs/fonts'));
});


// dev -> htdocs リソースコピー
// ------------------------------------------
gulp.task('devcopy', function () {
  return gulp.src([
    'dev/*.*',
    '!dev/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('htdocs'));
});


// htdocsフォルダを初期化
// ------------------------------------------
gulp.task('clean',
  del.bind(null, ['htdocs'])
);


// BrowserSync (dev)
// ------------------------------------------
gulp.task('serve', function () {
  browserSync({
    server: {
      baseDir: 'dev',
      routes: {
        "/bower_components": "bower_components"
      }
    }
  });
});


// BowerコンポーネントのパスをHTML/CSSに自動挿入
// ------------------------------------------
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('dev/scss/*.scss')
    .pipe(wiredep({
      exclude: [
        'bootstrap-sass-official'
      ]}))
    .pipe(gulp.dest('dev/scss'));

  gulp.src('dev/jade/**/*.jade')
    .pipe(wiredep({
      directory: 'bower_components',
      ignorePath: '../../',
      exclude: [
        'bootstrap-sass-official',
        'modernizr',
        'respond'
      ]}))
    .pipe(gulp.dest('dev/jade'));
});


// 変更ファイルの監視
// ------------------------------------------
gulp.task('watch', ['serve'], function () {
  gulp.watch([
    'dev/**/*.html',
    'dev/scss/**/*.css',
    'dev/js/**/*.js',
    'dev/fonts/**/*',
    'dev/images/**/*'
  ]).on('change', browserSync.reload);
  gulp.watch('dev/jade/**/*.jade', ['jade']);
  gulp.watch('dev/scss/**/*.*', ['sass']);
  gulp.watch('dev/js/**/*.js', ['jshint']);
  gulp.watch('dev/images/**/*', ['images']);
  gulp.watch('dev/icons/**/*.svg', ['iconfonts']);
  gulp.watch('bower.json', ['wiredep']);
});
gulp.task('w', ['watch']);  // watch タスクのエイリアス


// 公開時のセットを生成
// ------------------------------------------
gulp.task('build', ['clean'], function (cb) {
  runSequence('sass', ['jshint', 'html', 'images', 'fonts', 'devcopy'], cb);
});
