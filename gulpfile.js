{
  'use strict';
  const { src, dest, watch, series, parallel, lastRun } = require('gulp');// taskは非推奨,lastRun:差分のみコンパイルするように
  // pre,postProcessor
  const sass = require('gulp-sass');
  const sassGlob = require('gulp-sass-glob');// フォルダごとにインポートできるように
  const plumber = require('gulp-plumber');// エラーが発生してもプログラムを終了させない
  const postcss = require('gulp-postcss');
  const autoprefixer = require('autoprefixer');// ベンダープレフィックス自動付与
  const cssdeclsort = require('css-declaration-sorter');// プロパティ自動並び替え
  const mqpacker = require("css-mqpacker");// メディアクエリをまとめる
  const rename = require('gulp-rename');// コンパイル時に名前変更
  const ejs = require('gulp-ejs');// ejsコンパイル
  const sourcemaps = require('gulp-sourcemaps');// ソースマップ
  const using = require('gulp-using');//開発時のみ
  //静的解析ツール
  const htmlhint = require('gulp-htmlhint');// HTML構文チェック
  const w3cjs = require("gulp-w3cjs");
  const stylelint = require('stylelint')// CSS構文チェック
  // 画像圧縮
  const imagemin = require('gulp-imagemin');
  const imageminJpg = require('imagemin-jpeg-recompress');
  const imageminPng = require('imagemin-pngquant');
  const imageminGif = require('imagemin-gifsicle');
  // ブラウザ同期
  const browserSync = require('browser-sync');
  //差分コンパイル
  const changed = require('gulp-changed');
  const cached = require('gulp-cached');

  //結合圧縮
  const concat = require('gulp-concat');//
  const uglify = require('gulp-uglify');//

  const replace = require('gulp-replace');//文字列置換
  const minimist = require('minimist');//gulp実行時にパラメータを渡す
  //ファイルやディレクトリの操作
  const fs = require('fs');
  const data = require('gulp-data');
  const config = require('./config');

  //バッチ起動フォルダ名をパラメータとして受け取り、パスにつなげる
  let env = minimist(process.argv.slice(2));
  let setting = config(env.file);

  const plumberOpt = {
    errorHandler: function (err) {
      console.log(err.messageFormatted);
      this.emit('end');
    }
  }

  //各タスク
  const imageMin = () =>
    src(setting.path.img.src + '*.+(jpg|jpeg|png|gif|svg)', {
      // since: lastRun(imageMin)
    })
      .pipe(changed(setting.path.img.dest))
      // .pipe(using())
      .pipe(imagemin([
        imageminPng({
          quality: [.65, .8],//<0~1, 0~1>
          strip: true,// Remove metadata
          speed: 5 //1(brute-force) to 11(fastest)
        }),
        imageminJpg({
          quality: 'medium'//low, medium, high and veryhigh
        }),
        imageminGif({
          optimizationLevel: 2,//1~3
          colors: 180//2~256
        }),
        imagemin.svgo()
      ]))
      // .pipe(imagemin()) //圧縮したpngがMacで暗くなる場合
      .pipe(dest(setting.path.img.dest))

  const sassTask = () =>
    src(setting.path.scss.src + '**/*.scss')
      .pipe(plumber(plumberOpt))
      // .pipe(cached(sassTask))
      // .pipe(using())
      .pipe(sassGlob())
      .pipe(sourcemaps.init())
      .pipe(sass({
        outputStyle: 'compressed'
      }))
      .pipe(postcss([
        autoprefixer({ grid: true }),//default grid:false
        cssdeclsort({ order: 'smacss' }),
        mqpacker()
      ]))
      .pipe(sourcemaps.write(setting.path.scss.sourcemaps))
      .pipe(dest(setting.path.scss.dest));

  const ejsTask = () =>
    src([setting.path.ejs.src + '**/*.ejs', '!' + setting.path.ejs.src + '**/_*.ejs'], {
      // since: lastRun(ejsTask)
    })
      .pipe(plumber(plumberOpt))
      // .pipe(cached(ejsTask))
      // .pipe(using())
      .pipe(
        data(file => {
          const absolutePath = `/${file.path
            .split('src\\' + env.file + '\\ejs')
          [file.path.split('src\\' + env.file + '\\ejs').length - 1].replace('.ejs', '.html')
            .replace(/index\.html$/, '')}`;
          const relativePath = '../'.repeat([absolutePath.split('\\').length - 2]);
          return {
            absolutePath,
            relativePath
          };
        }),
        )
      .pipe(ejs({
        site: JSON.parse(fs.readFileSync(`${setting.path.root.src}site.json`)),
      }))
      .pipe(replace('[template_url]/', 'assets/'))//WPで使うショートコードを変換
      .pipe(replace('[url]/', '/'))
      .pipe(rename({ extname: '.html' }))
      .pipe(dest(setting.path.ejs.dest));

  const cssTask = () =>
    src(setting.path.css.src + '*.css')
      .pipe(dest(setting.path.css.dest));

  const scriptTask = () =>
    src(setting.path.script.src + '*.js')
      .pipe(plumber(plumberOpt))
      .pipe(uglify({
        output: {
          comments: /^!/
        }
      }))
      // .pipe(concat())
      .pipe(dest(setting.path.script.dest));

  const validateHtml = () =>
    src(setting.path.ejs.dest + '*.html')
      .pipe(htmlhint('.htmlhintrc'))
      .pipe(w3cjs({
        showInfo: true
      }))
      .pipe(htmlhint.reporter());

  const validateCss = () =>
    src(setting.path.scss.dest + '*.css')
      .pipe(postcss([
        stylelint()
      ]));

  const syncBrowser = done => {
    browserSync.init({
      server: {
        baseDir: setting.path.ejs.dest,
        index: 'index.html'
      },
      reloadOnRestart: true
    });
    done();
  }

  const reloadBrowser = done => {
    browserSync.reload();
    done();
  }

  const watchTask = done => {
    watch(setting.path.scss.src + '**/*.scss', series(sassTask, validateCss, reloadBrowser));
    watch(setting.path.img.src, series(imageMin, reloadBrowser));
    watch([setting.path.ejs.src + '**/*.ejs', setting.path.root.src + 'site.json'], series(ejsTask, validateHtml, reloadBrowser));
    watch(setting.path.script.src + '*.js', series(scriptTask, reloadBrowser));
    watch(setting.path.css.src + '*.css', series(cssTask, reloadBrowser));
    done();
  }

  exports.default = series(parallel(sassTask, imageMin, ejsTask, cssTask, scriptTask), parallel(watchTask, syncBrowser, validateHtml, validateCss));
}
