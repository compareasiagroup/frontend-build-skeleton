'use strict';

/**
 *  Concatenates and minifys JS source files.
 *
 *  Example Usage:
 *  gulp scripts
 */

var gulp = require('gulp'),
    args = require('yargs').argv,
    common = require('./_common'),
    globalSettings = require('../../_global'),
    _ = require('underscore');

function _requireJS() {
    var requirejs = require('requirejs');

    for (var i = 0, length = common.requirejs.bundles.length; i < length; i++) {
        var thisBuild = common.requirejs.bundles[i],
            combinedOptions = _.extend({
                uglify2: common.uglifySettings
            }, common.requirejs.defaults, thisBuild);

        requirejs.optimize(combinedOptions, function(buildOutput) {
            console.log(buildOutput);
        });
    }
}

/**
 *  Uses Browserify API to create a stream. This is then converted into
 *  a stream that Gulp understands (via `vinyl-source-stream`).
 *
 *  This is then passed to `vinyl-buffer` where the streams contents are
 *  converteed into a Buffer. The inline source map from Browserify is
 *  extracted and added to the stream as another file / save reference
 *  in the exchange object.
 *
 *  We then filter the stream down to only target the JS file, then uglify
 *  it and generate a sourcempa based on the original data.
 */
function _browserify() {
    var browserify = require('browserify'),
        source = require('vinyl-source-stream'),
        buffer = require('vinyl-buffer'),
        extractor = require('gulp-extract-sourcemap'),
        filter = require('gulp-filter'),
        uglify = require('gulp-uglifyjs');

    var uglifySourceMapSettings = _.extend({}, common.browserify.uglifySourceMapSettings);

    for (var i = 0, length = common.browserify.bundles.length; i < length; i++) {
        var thisBundle = common.browserify.bundles[i];

        // Combining uglify defaults with custom options for sourcemapping.
        var uglifyOptions = _.extend({}, common.uglifySettings, {
            outSourceMap: true,
            output: {
                source_map: uglifySourceMapSettings
            }
        });

        // Creating a browserify instance / stream.
        var bundleStream = browserify({ debug: true });

        // If this bundle is asking to explicitly exclude certain modules, do so.
        if (thisBundle.excludes && thisBundle.excludes.length > 0) {
            for (var j = 0, excludesLength = thisBundle.excludes.length; j < excludesLength; j++) {
                bundleStream.exclude(thisBundle.excludes[j]);
            }
        }

        bundleStream
            .add(thisBundle.srcPath + thisBundle.fileName + '.js')
            .transform('hbsfy')
            .bundle()
            .on('error', function(error) {
                console.log("Browserify Failed:\n" + error.message);
            })
            .pipe(source(thisBundle.fileName + '.js'))
            .pipe(buffer())
            .pipe(extractor({
                removeSourcesContent: true
            }))
            .on('postextract', function(sourceMap) {
                uglifySourceMapSettings.orig = sourceMap;
            })
            .pipe(filter('**/*.js'))
            .pipe(uglify(thisBundle.fileName + common.browserify.buildFileSuffix, uglifyOptions))
            .pipe(gulp.dest(common.browserify.destPath))
            .on('end', function() {
                console.log('Browserify Completed: ' + thisBundle.srcPath + thisBundle.fileName + '.js');
            });
    }
}

gulp.task('scripts', function() {
    if (globalSettings.moduleFormat === 'requirejs') {
        _requireJS();
    } else {
        _browserify();
    }
});