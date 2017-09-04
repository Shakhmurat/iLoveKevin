// GULPFILE (last updated on 14.01.2017)
// ***
// 'gulp serve'
// server project on localhost from .tmp and frontend folders
// ***
// 'gulp serve:web'
// serve project on localhost from web/ folder with builded files
// ***
// 'gulp'
// clean .tmp/ and web/ folders and then 'gulp build'
// ***
// 'gulp build'
// build project (with html files and pics folder, without admin styles and scripts)
// ***
// 'gulp size'
// get size of web/ folder (without media/ folder)
// ***
// 'gulp size:all'
// get size of everuthing in web/ folder
// ***
// 'gulp size:detailed'
// get size of styles/, scripts/, images/, fonts/ inside web/

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const del = require('del');

const cssnext = require('postcss-cssnext');
const hexrgba = require('postcss-hexrgba');
const colorRgbaFallback = require('postcss-color-rgba-fallback');
const cssnano = require('cssnano');

// directories config object
const PATHS = {
  tmp: '.tmp',
  src: 'frontend',
  build: 'web'
};


// variable for production mode
var productionMode;
var isBuild = false;


// VIEWS
// nunjucks:)
gulp.task('views',['favicon'], () => {
  return gulp.src(PATHS.src + '/views/*.njk')
    .pipe($.plumber()).on('error', function(err) { console.error(err); })
    .pipe($.nunjucksRender({
      path: PATHS.src + '/views',
      data: { markup: !productionMode }
    }))
    .pipe(gulp.dest(PATHS.tmp))
    .pipe($.if(browserSync.active, reload({stream: true, once: true})));
});


//favicon

gulp.task('favicon', () => {
  return gulp.src('./' + PATHS.src + '/favicon.ico')
    .pipe(isBuild ? gulp.dest(PATHS.build + '/') : gulp.dest(PATHS.tmp + '/'));
})



// STYLES
gulp.task('styles', () => {
  return gulp.src(PATHS.src + '/styles/*.scss')
    .pipe($.plumber()).on('error', function(err) { console.error(err); })
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      cssnext({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
      hexrgba(),
      colorRgbaFallback()
    ]))
    .pipe(gulp.dest(PATHS.tmp + '/styles'))
    // injecting the renewed .css file into the page without reloading
    .pipe(browserSync.stream());
});



// SCRIPTS
// with webpack for frontend files
gulp.task('scripts', () => {
  // put all entries for bundles here like this
  // let bundleEntries = [
  //   './' + PATHS.src + '/scripts/main/main.js',
  //   './' + PATHS.src + '/scripts/test/test.js'
  // ];
  let bundleEntries = [
    './' + PATHS.src + '/scripts/main/main.js'
  ];
  // becuse of that we need to wrap every modules files into a folder with the same name
  // for example - 'main.js' entry file leaves inside 'main' folder
  // it can import any js file both from its parent folder and from outside
  return gulp.src(bundleEntries)
    .pipe($.plumber()).on('error', function(err) { console.error(err); })
    .pipe(named())
    .pipe(webpack({
      output: {
        filename: '[name].js'
      },
      module: {
        loaders: [
          {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
      },
      // dont log any info to console
      quiet: true
    }))
    .pipe(gulp.dest(PATHS.tmp + '/scripts'))
    .pipe($.if(browserSync.active, reload({stream: true, once: true})));
});




// USEREF
// concat and move styles and scripts files
// found in .tmp/*.html <!-- build -->...<!-- endbuild --> blocks to web/ folder,
// move html files found in .tmp/ to web/ folder
gulp.task('useref-assets', ['views', 'styles', 'scripts'], () => {
  // look at useref blocks only in one file - index.html
  // build only assets found there
  // to speed up build process
  return gulp.src(PATHS.tmp + '/index.html')
    .pipe($.useref({searchPath: [PATHS.tmp, PATHS.src, '.']}))
    .pipe( $.if('*.js', $.uglify({compress: { drop_console: true }})
      .on('error', function(err) { console.error(err); })) )
    .pipe( $.if('*.css', $.postcss([cssnano({ safe: true, autoprefixer: false })])) )
    .pipe( $.if('!*.html', gulp.dest(PATHS.build)) )
});

gulp.task('useref', ['useref-assets'], () => {
  // build only htmls
  return gulp.src(PATHS.tmp + '/*.html')
    .pipe($.prettify({indent_size: 2, eol: '\r\n'}))
    .pipe($.useref({noAssets: true}))
    .pipe( productionMode ? $.if('!*.html', gulp.dest(PATHS.build)) : gulp.dest(PATHS.build) )
});


// FONTS


gulp.task('fonts', () => {
  return gulp.src(PATHS.src + '/fonts/**/*')
    .pipe(gulp.dest(PATHS.build + '/fonts'))
    .pipe($.if(browserSync.active, reload({stream: true, once: true})));
});


// IMAGES
gulp.task('images', () => {
  return gulp.src(PATHS.src + '/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest(PATHS.build + '/images'))
    .pipe($.if(browserSync.active, reload({stream: true, once: true})));
});


// PICS
gulp.task('pics', () => {
  return gulp.src(PATHS.src + '/pics/**/*')
    .pipe(gulp.dest(PATHS.build + '/pics'))
    .pipe($.if(browserSync.active, reload({stream: true, once: true})));
});



// clear cache for images tasks
gulp.task('cache-clean', (done) => {
  return $.cache.clearAll(done);
});


// OPTIMIZE IMAGES IN MEDIA FOLDER (if nedded)
gulp.task('optimize-media', () => {
  return gulp.src(PATHS.build + '/media/**/*.{gif,jpeg,jpg,png}')
    .pipe($.size({title: 'before build', gzip: true}))
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })).on('error', function(err) { console.log(err); this.end(); }))
    .pipe($.size({title: 'after build', gzip: true}))
    .pipe(gulp.dest(PATHS.build + '/media/'));
});


// EXTRAS
gulp.task('extras', () => {
  return gulp.src([
    PATHS.src + '/*.*'
  ], {
    dot: true
  }).pipe(gulp.dest(PATHS.build));
});


// ESLINT
gulp.task('eslint', () => {
  return gulp.src([PATHS.src + '/scripts/**/*.js'])
    .pipe($.eslint({
      fix: false
    }))
    .pipe($.eslint.format('codeframe'))
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
});

// STYLELINT
gulp.task('stylelint', () => {
  return gulp.src([
    PATHS.src + '/styles/**/*.scss',
    '!' + PATHS.src + '/styles/main.scss',
    '!' + PATHS.src + '/styles/_fonts.scss'
  ])
  .pipe( $.stylelint({
    failAfterError: !browserSync.active ? true : false,
    reporters: [{
      formatter: 'string',
      console: true
    }],
    debug: true
  }));
});


// CLEAN
gulp.task('clean', del.bind(null, [
  // add paths to files and folders
  // that we don't want to remove from web/
  '.tmp',
  'web/**',
  '!web',
  '!web/css/**',
  '!web/js/**',
  '!web/*.php',
  '!web/assets/**',
  '!web/media/**',
  '!web/i/**'
]));


// set production mode needed for useref task
gulp.task('productionModeTrue', () => {
  productionMode = true;
});

gulp.task('productionModeFalse', () => {
  productionMode = false;
});


// SERVE
gulp.task('serve', ['views', 'styles', 'scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    // tunnel: true,
    server: {
      baseDir: [PATHS.tmp, PATHS.src],
      routes: {
        '/node_modules': 'node_modules'
      }
    },
    logPrefix: 'Shahmurat',
    // logLevel: 'debug',
    logConnections: true,
    ghostMode: false
  });

  // reloading assets and pages on change
  gulp.watch(PATHS.src + '/views/**/*.njk', ['views']);
  gulp.watch(PATHS.src + '/styles/**/*.scss', ['styles', 'stylelint']);
  gulp.watch(PATHS.src + '/scripts/**/*.js', ['scripts', 'eslint']);
  gulp.watch(PATHS.src + '/images/**/*', ['images']);
  gulp.watch(PATHS.src + '/pics/**/*', ['pics']);
  gulp.watch(PATHS.src + '/fonts/**/*', ['fonts']);
});

gulp.task('serve:web', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [PATHS.build]
    }
  });
});


// BUILD
// build for markup
gulp.task('build-markup', [
  'productionModeFalse',
  'views',
  'useref',
  'images',
  'pics',
  'fonts',
  'extras'
  ], () => {
  return gulp.src([PATHS.build + '/**/*', '!' + PATHS.build + '/media/**/*'])
    .pipe($.size({
      title: 'build',
      gzip: true
    }));
});


gulp.task('build', ['clean'], ()=>{
  gulp.start('build-markup');
});


// SIZE
// get sizes of build assets
// ***
// get total size of web/ except media/ folder
gulp.task('size', () => {
  return gulp.src([
      PATHS.build + '/**/*',
      '!' + PATHS.build + '/media/**/*'
    ])
    .pipe($.size({
      title: 'web/',
      gzip: true
    }));
});

// get total size of web/
gulp.task('size:all', () => {
  return gulp.src([
      PATHS.build + '/**/*'
    ])
    .pipe($.size({
      title: 'web/',
      gzip: true
    }));
});

// get total size of styles/ in web/
gulp.task('size:styles', () => {
  return gulp.src([
      PATHS.build + '/styles/**/*'
    ])
    .pipe($.size({
      title: 'styles',
      showFiles: true,
      gzip: true
    }));
});

// get total size of scripts/ in web/
gulp.task('size:scripts', () => {
  return gulp.src([
      PATHS.build + '/scripts/**/*'
    ])
    .pipe($.size({
      title: 'scripts',
      showFiles: true,
      gzip: true
    }));
});

// get total size of images/ in web/
gulp.task('size:images', () => {
  return gulp.src([
      PATHS.build + '/images/**/*'
    ])
    .pipe($.size({
      title: 'images',
      gzip: true
    }));
});

// get total size of fonts/ in web/
gulp.task('size:fonts', () => {
  return gulp.src([
      PATHS.build + '/fonts/**/*'
    ])
    .pipe($.size({
      title: 'fonts',
      gzip: true
    }));
});

// get size of media/ in web/
gulp.task('size:media', () => {
  return gulp.src([
      PATHS.build + '/media/**/*'
    ])
    .pipe($.size({
      title: 'media',
      gzip: true
    }));
});

gulp.task('size:detailed', () => {
  gulp.start('size:styles', 'size:scripts', 'size:images', 'size:fonts');
});

// default 'gulp' task
// builds for markup with html files and pics/ folder
gulp.task('default', () => {
  isBuild = true;
  gulp.start('build');
});
