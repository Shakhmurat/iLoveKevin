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
// 'gulp build:prod'
// build project for production (without html files and pics folder, with admin styles and scripts)
// use for deploy
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
const reload  = browserSync.reload;
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const mainBowerFiles = require('main-bower-files');
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

// put all the admin css plugins here
const adminStylesPlugins = [
  'bower_components/nifty-modal/lib/nifty.min.css',
  'bower_components/bootstrap/dist/css/bootstrap.css',
  'bower_components/font-awesome/css/font-awesome.min.css',
  'bower_components/animate.css/animate.min.css',
  'bower_components/PACE/themes/green/pace-theme-minimal.css',
  'bower_components/Jcrop/css/Jcrop.css',
  PATHS.src + '/styles/admin/fontello.css'
];

// put all the admin js plugins here
const adminScriptsPlugins = [
  'bower_components/bootstrap/dist/js/bootstrap.min.js',
  'bower_components/jquery-ui/ui/widget.js',
  'bower_components/jquery-file-upload/js/jquery.fileupload.js',
  'bower_components/imagesloaded/imagesloaded.pkgd.min.js',
  'bower_components/jcrop/js/jquery.Jcrop.js',
  'bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved.js',
  'bower_components/fastclick/lib/fastclick.js',
  'bower_components/blockUI/jquery.blockUI.js',
  'bower_components/bootbox.js/bootbox.js',
  'bower_components/nifty-modal/lib/nifty.min.js',
  'bower_components/PACE/pace.min.js',
  'bower_components/Jcrop/js/Jcrop.min.js'
];

// variable for production mode
var productionMode;


// VIEWS
// nunjucks:)
gulp.task('views', () => {
  return gulp.src(PATHS.src + '/views/*.njk')
    .pipe($.plumber()).on('error', function(err) { console.error(err); })
    .pipe($.nunjucksRender({
      path: PATHS.src + '/views', 
      data: { markup: !productionMode } 
    }))
    .pipe(gulp.dest(PATHS.tmp))
    .pipe($.if(browserSync.active, reload({stream: true, once: true})));
});


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

gulp.task('styles-admin-main', () => {
  return gulp.src(PATHS.src + '/styles/admin/*.css')
    .pipe($.concat('admin-main.css'))
    .pipe($.postcss([
      cssnano()
    ]))
    .pipe(gulp.dest(PATHS.build + '/styles'));
});

gulp.task('styles-admin-plugins', () => {
  return gulp.src(adminStylesPlugins)
    .pipe($.concat('admin-plugins.css'))
    .pipe($.postcss([
      cssnano()
    ]))
    .pipe(gulp.dest(PATHS.build + '/styles'));
});

//build admin styles (two tasks) 
gulp.task('styles-admin', function() {
  gulp.start('styles-admin-main', 'styles-admin-plugins');
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

gulp.task('scripts-admin-main', () => {
  return gulp.src(PATHS.src + '/scripts/admin/*.js')
    .pipe($.babel({
      presets: ['es2015']   
    }))
    .pipe($.concat('admin-main.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(PATHS.build + '/scripts'));
});

gulp.task('scripts-admin-plugins', () => {
  return gulp.src(adminScriptsPlugins)
    .pipe($.concat('admin-plugins.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(PATHS.build + '/scripts'));
});

//build admin scripts (two tasks) 
gulp.task('scripts-admin', function() {
  gulp.start('scripts-admin-main', 'scripts-admin-plugins');
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
// copy fonts from Bootstrap and font-awesome as they don't include their fonts in their bower.json file
gulp.task('copy-bs-fonts', function() {
  return gulp.src('bower_components/bootstrap-sass/assets/fonts/bootstrap/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(PATHS.src + '/fonts/'));
});

gulp.task('copy-fa-fonts', function() {
  return gulp.src('bower_components/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(PATHS.src + '/fonts/'));
});

// this task should be called manually if we need bs or fa fonts
// it copies these fonts to fonts/ folder
gulp.task('put-fonts', () => {
  gulp.start('copy-bs-fonts', 'copy-fa-fonts');
});

gulp.task('fonts', () => {
  return gulp.src(mainBowerFiles('**/*.{eot,svg,ttf,woff,woff2}', function(err) {
    if (err !== null) console.log(err);
  }).concat(PATHS.src + '/fonts/**/*'))
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


// COPY I/ FOLDER (TODO: maybe remove it or unite with other task)
gulp.task('icons', () => {
  return gulp.src(PATHS.src + '/i/**/*')
    .pipe(gulp.dest(PATHS.build + '/i'));
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
  return gulp.src([PATHS.src + '/scripts/**/*.js', '!' + PATHS.src + '/scripts/admin/*.js'])
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
    '!' + PATHS.src + '/styles/admin/*.css',
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
        '/bower_components': 'bower_components'
      }
    },
    logPrefix: 'RocketfirmDev',
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

gulp.task('build', ['clean'], () => {
  gulp.start('build-markup');
});

// build for production
gulp.task('build-production', [
  'productionModeTrue',
  'useref', 
  'images', 
  'icons',
  'fonts',
  'styles-admin', 
  'scripts-admin',
  'extras'
  ], () => {
  return gulp.src([PATHS.build + '/**/*.*', '!' + PATHS.build + '/media/**/*.*'])
    .pipe($.size({
      title: 'build', 
      gzip: true
    }));
});

gulp.task('build:prod', ['clean'], () => {
  gulp.start('build-production');
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
gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
