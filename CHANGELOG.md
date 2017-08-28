# Changelog

## 2.2.1

* Fix browser reload and stream update after error in scripts. Edit webpack task. Add new `vinyl-named` npm package for webpack entry file names
* Fix browser reloading after change in nunjucks files. Add reloading in the end of `gulp views` task 


## 2.2.0 (can use js modules now, with webpack)

* Change babel plugin for compiling scripts for webpack bundler. It helps to use modules easily. For gulp we use webpack-stream, webpack version that supports streams and piping.
To make a new module, create a new folder (inside /scripts folder) with a module name, inside create a main entry file with the same name as folder, then add a line to webpack task in gulpfile.js
* Add an intermediate folder in scripts. It now looks like this - scripts/main/main.js, scripts/bundleA/bundleA.js. Main files that will be bundled need to be inside parent folder with the same name, read example in gilpfile.js webpack task. If you need more modules to be bundled, just crete another folder in /scripts with same named file inside
* Add `clean cache` task for images cache plugin
* Tune browsersync reloading process, move it from gulp serve task to every separate task where it is needed. Also added condition for reloading browsers - only if it is active, not for build tasks
* Upgrade package.json
* Add .babelrc file for js code compiling configs
* Upgrade .eslintrc
* Add modules import and export example files in scripts folder
* Add more of commonly used css modules in styles folder


## 2.1.0

* Speed up build process! Tune Useref task, make it only build necessary file once (from index.html) and not for every .html file. 
* Also Divided Useref task for building assets at first and then .html files


## 2.0.3

* Change glob wildcard (from `'/**/*'` to `'/**/*.*'`) for gulp size task in build-production (line 393) because of Ubuntu 16.04.1 LTS bug 
```[18:29:43] Starting 'build-production'...
events.js:160
      throw er; // Unhandled 'error' event
      ^
Error: EISDIR: illegal operation on a directory, read
    at Error (native)```


## 2.0.2

* Change path for building admin styles and scripts. Now they build into the styles/ and scripts/ folder with frontend files. 
It was needed becaus admin styles file import fonts from ../fonts.
* Add plumber to views task for not stopping the serve when ther is a mistake in .njk files


## 2.0.1

* Add variable to .njk files via data object in the 'views' gulp task to determine build mode
* Add constants with array of admin styles and scripts plugins
* Tune browsersync injection of styles and reloading of scripts 


## 2.0.0

* Migrate template from Grunt to Gulp (Gulp 3)
* Update npm to 3 version, include babel, include postcss
* Remove assets.json. All necessary paths are now in gulpfile
* Add pics/ folder for image samples that are not used on production
* Introduce two methods of building project - for production and for markup
* Create tasks for checking size of built project (several types)
* Use nunjucks templates instead of handlebars (https://mozilla.github.io/nunjucks/)
* Use linters for css (stylelint) and for js (eslint) for checking code syntax
* Put all the template pages into views/ folder
* Remove libs/ folder. Previously it was used for admin plugins. Now all they are installed via Bower
