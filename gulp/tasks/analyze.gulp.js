/**
 * CODE ANALYZING TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({
  lazy: true
});
var args = require('yargs').argv;
var errorLogger = require('../utils/errorLogger.gulp');
var glob = require('glob');
var log = $.util.log;
var messageLogger = require('../utils/messageLogger.gulp')();
var runSeq = require('run-sequence');
var fs = require('fs');
var _ = require('lodash');
var util = require('gulp-util');

// Lint E2E test files
gulp.task('eslint:e2e', function () {
  var files = [].concat(
    config.test + '/e2e-protractor/squared/*_spec.js',
    config.test + '/e2e-protractor/huron/*_spec.js',
    config.test + '/e2e-protractor/mediafusion/*_spec.js'
  );
  messageLogger('Running eslint on E2E test files', files);
  return gulp
    .src(files)
    .pipe($.eslint({
      configFile: 'config/eslint.json',
      rulePaths: ['config/rules']
    }))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

// vet JS files and create coverage report
gulp.task('analyze', ['jsBeautifier:beautify'], function (done) {
  if (args.plato) {
    messageLogger('Analyzing source with ESLint, JSCS, JsonLint, and Plato');
    runSeq([
      'analyze:jscs',
      'analyze:eslint',
      'json:verify',
      'languages:verify',
      'plato',
    ], done);
  } else {
    messageLogger('Analyzing source with ESLint, JSCS and JsonLint');
    runSeq([
      'analyze:jscs',
      'analyze:eslint',
      'json:verify',
      'languages:verify',
    ], done);
  }

});

gulp.task('analyze:eslint', function () {
  var files = [].concat(
    config.appFiles.js,
    config.unsupportedDir + '/' + config.unsupported.file,
    config.testFiles.spec.all,
    config.gulpFiles
  );
  messageLogger('Running ESLint on JS files', files);
  return gulp
    .src(files)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('analyze:jscs', function () {
  messageLogger('Running JSCS on JavaScript files', config.appFiles.js);
  return gulp
    .src(config.appFiles.js)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .on('error', errorLogger);
});

// legacy, used but the build task
gulp.task('jsb', function (done) {
  runSeq(
    'jsBeautifier:beautify',
    'analyze:eslint',
    'eslint:e2e',
    'json:verify',
    'languages:verify',
    done
  );
});

gulp.task('jsb:verify', function (done) {
  runSeq(
    'jsBeautifier:verify',
    'analyze:eslint',
    'eslint:e2e',
    'json:verify',
    'languages:verify',
    done
  );
});

gulp.task('json:verify', function () {
  var jsonlint = require('gulp-jsonlint');
  return gulp.src(['./test/**/*.json', './app/**/*.json'])
    .pipe(jsonlint())
    .pipe(jsonlint.reporter())
    .pipe(jsonlint.failAfterError());
});

gulp.task('languages:verify', function (done) {
  var L10N_DIR = 'app/l10n';
  var L10N_SOURCE_REGEX = /[a-z]{2}_[A-Z]{2}/ig;
  var L10N_SOURCE = 'app/modules/core/l10n/languages.js';

  var languages = fs.readFileSync(L10N_SOURCE, 'utf8').match(L10N_SOURCE_REGEX);

  var files = fs.readdirSync(L10N_DIR).map(function (file) {
    return file.replace('.json', '');
  });

  var missingFiles = _.difference(languages, files);
  if (missingFiles.length) {
    return done(new util.PluginError({
      plugin: 'languages:verify',
      message: 'Localization files are missing for the following languages: ' + missingFiles.join(', ')
    }));
  }

  var missingRefs = _.difference(files, languages);
  if (missingRefs.length) {
    return done(new util.PluginError({
      plugin: 'languages:verify',
      message: 'The following localization files are not referenced in code: ' + missingRefs.join(', ')
    }));
  }

  done();
});

// Create a visualizer report
gulp.task('plato', function (done) {
  messageLogger('Analyzing source with Plato');
  log('Browse to /report/plato/index.html to see Plato results');
  startPlatoVisualizer(done);
});

/////////////////////////////

// Start Plato inspector and visualizer
function startPlatoVisualizer(done) {
  messageLogger('Running Plato');
  var files = glob.sync('app/**/*.js');
  var excludeFiles = /.*\.spec\.js/;
  var plato = require('plato');
  var options = {
    title: 'Plato Inspections Report',
    exclude: excludeFiles
  };
  var outputDir = 'plato';
  plato.inspect(files, outputDir, options, platoCompleted);

  function platoCompleted(report) {
    var overview = plato.getOverviewReport(report);
    if (args.verbose) {
      log(overview.summary);
    }
    if (done) {
      done();
    }
  }
}
