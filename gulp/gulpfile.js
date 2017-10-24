
var browserify = require('browserify'),
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    angularFileSort = require('gulp-angular-filesort'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    cssMin = require('gulp-cssmin'),
      //minifycss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    htmlreplace = require('gulp-html-replace'),
    useref = require('gulp-useref'),
    del = require('del'),
    strip = require('gulp-strip-comments'),
    gutil = require("gulp-util"),
    templateCache = require('gulp-angular-templatecache'),
    gulpSequence = require('gulp-sequence'),
    gulpif = require('gulp-if'),
    jsonminify = require('gulp-jsonminify'),
    stripJsonComments = require('gulp-strip-json-comments'),
    importCss = require('gulp-import-css'),
    eslint = require('gulp-eslint'),
    sass = require('gulp-sass'),
    //karmaServer = require('karma').Server,
    historyApiFallback = require('connect-history-api-fallback'),
    source = require('vinyl-source-stream');
    //autoPrefixer = require('gulp-autoprefixer');


var d = '010119700000';

var scriptLibFile = 'script.lib.min.',
    scriptUserFile = 'script.user.min.',
    cssUserFile = 'css.user.min.',
    cssLibFile = 'css.lib.min.',
    appAccessJson = 'user-app-access.';

var dest = './dist/',
    tempTemplates = './app/temp';

gulp.task('production', function () {
    d = new Date().getTime();
});

//Angular apps
gulp.task('script-lib', ['clean-script-lib'], function () {
    gulp.src(['./lib/jquery-2.1.4.min.js',
        './lib/moment.js',
        '/lib/angular-drag-and-drop-lists.js',
        './lib/masonry.pkgd.min.js',
        './lib/masonry/masonry.js',
        './lib/masonry/doc-ready.js',
        './lib/masonry/matches-selector.js',
        './lib/masonry/utils.js',
        './lib/masonry/get-style-property.js',
        './lib/masonry/get-size.js',
        './lib/masonry/eventie.js',
        './lib/masonry/EventEmitter.min.js',
        './lib/masonry/item.js',
        './lib/masonry/outlayer.js',
        './lib/imagesloaded.pkgd.min.js',
        './lib/angular/angular.min.js',
        './lib/angular/angular-piwik.js',
        './lib/angular/angular-route.min.js',
        './lib/angular/angular-resource.min.js',
        './lib/angular/angular-sanitize.min.js',
        './lib/angular/angular-file-upload.min.js',
        './lib/angular/angular-animate.min.js',
        './lib/angular/angular-masonry.min.js',
        './lib/angular/angular-ui-calendar.js',
        './lib/angular/angular-messages.min.js',
        './lib/fullcalendar/*.js',
        './lib/ngTags/*.js',
        './lib/*.js',
        './lib/jsZip/*.js',
        './lib/image-crop/*.js'])
        //.pipe(strip())
        .pipe(concat(scriptLibFile + d + '.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(dest))
        .pipe(reload({stream: true}));
});

gulp.task('clean-script-lib', function(){
    del([dest + scriptLibFile + '*']);
});

gulp.task('script-user-dev', ['app-tmpl','clean-script-user'], function () {
    gulp.src(['./app/designportal.js',
            './app/common/*.js',
            './app/common/**/*.js',
            './app/components/**/*.js',
            './app/temp/*.js',
            './app/common/sit.config.js',
            '!./app/common/uat.config.js',
            '!./app/common/prod.config.js'])
            .pipe(angularFileSort())
            .pipe(concat(scriptUserFile + d + '.js'))
            .pipe(gulp.dest(dest))
            .pipe(reload({stream: true}));
});

gulp.task('script-user-uat', ['app-tmpl','clean-script-user'], function () {
    gulp.src(['./app/designportal.js',
            './app/common/*.js',
            './app/common/**/*.js',
            './app/components/**/*.js',
            './app/temp/*.js',
            '!./app/common/sit.config.js',
            './app/common/uat.config.js',
            '!./app/common/prod.config.js'])
            .pipe(angularFileSort())
            .pipe(concat(scriptUserFile + d + '.js'))
            .pipe(gulp.dest(dest))
            .pipe(reload({stream: true}));
});

gulp.task('script-user-prod', ['app-tmpl','clean-script-user'], function () {
    gulp.src(['./app/designportal.js',
            './app/common/*.js',
            './app/common/**/*.js',
            './app/components/**/*.js',
            './app/temp/*.js',
            '!./app/common/sit.config.js',
            '!./app/common/uat.config.js',
            './app/common/prod.config.js'])
            .pipe(angularFileSort())
            .pipe(concat(scriptUserFile + d + '.js'))
            .pipe(gulp.dest(dest))
            .pipe(reload({stream: true}));
});

gulp.task('clean-script-user', function(){
    del([dest + scriptUserFile + '*']);
});

gulp.task('css-user', ['clean-css-user'], function () {
    gulp.src(['./css/styles.css'])
            //.pipe(importCss())
                        // .pipe(sass().on('error', sass.logError))
            // .pipe(minifycss())
            .pipe(cleanCSS({keepSpecialComments : 0, rebase : false, removeDuplicateRules: false}))
            //.pipe(cssMin())
            .pipe(concat(cssUserFile + d + '.css'))
            .pipe(gulp.dest(dest))
            .pipe(reload({stream: true}));
});

gulp.task('sass', function() {
    gulp.src(['./css/styles.scss'])
    .pipe(sass().on('error', sass.logError))
    //.pipe(autoPrefixer())
		.pipe(concat('sass.css'))
		.pipe(gulp.dest(dest))
});

gulp.task('browserify', function() {
    return browserify('./node_modules/reusable-filters/index.js')
        .transform('html2js-browserify')
        .transform('browserify-css', { autoInject: true, inlineImages: true })
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('filters.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest(dest))
});

gulp.task('clean-css-user', function(){
    del([dest + cssUserFile + '*']);
});

gulp.task('css-lib', ['clean-css-lib'], function () {
    gulp.src('./css/lib/*.css')
            .pipe(cleanCSS({keepSpecialComments : 0}))
            .pipe(cssMin())
            .pipe(concat(cssLibFile + d + '.css'))
            .pipe(gulp.dest(dest))
            .pipe(reload({stream: true}));
});

gulp.task('clean-css-lib', function(){
    del([dest + cssLibFile + '*']);
});

gulp.task('browser-sync', function () {
    browserSync({
        //proxy: 'localhost',
        port: 85,
        ui:false,
        files: [dest + '/*.js', dest + '/*.css'],
        server: {
            baseDir: dest,
            middleware: [historyApiFallback()]
        }
        //index: 'dest/index.html'
    });
});

// to rewrite the name of the file in the index.html file. Do not use. Not fully functioning
gulp.task('replace-filenames-all', function () {
    gulp.src('index.html')
            .pipe(htmlreplace({csslib: {src: ['/' + cssLibFile + d + '.css']},
                cssuser: {src: ['/' + cssUserFile + d + '.css']},
                jslib: {src: ['/' + scriptLibFile + d + '.js']},
                jsuser: {src: ['/' + scriptUserFile + d + '.js']},
                sass: {src: ['/sass.css']},
                browserify: {src: ['/filters.js']}
                }
            ))
            .pipe(gulp.dest(dest));
});

gulp.task('replace-filenames-user', function () {
//    gutil.log(filenames.get("csslib", 'all'));

//    gulp.src('./index.html')
//            .pipe(gulp.src(dest + cssLibFile + '*.css')
//                          .pipe(filenames('csslib')))
//            .pipe(gulp.src(dest + scriptLibMainFile + '*.js')
//                          .pipe(filenames('js-lib-common')))
//            .pipe(gulp.src(dest + scriptLibSubFile + '*.js')
//                          .pipe(filenames('js-lib-component')))
//            .pipe(htmlreplace({csslib: {src: ['/' + filenames.get('csslib')[0]]},
//                cssuser: {src: ['/' + cssUserFile + d + '.css']},
//                jslib: {src: ['/' + filenames.get('js-lib-common')[0], '/' + filenames.get('js-lib-component')[0]]},
//                jsuser: {src: ['/' + scriptUserCommonFile + d + '.js', '/' + scriptUserComponentFile + d + '.js']}}))
//            .pipe(gulp.dest(dest));
});

gulp.task('replace-filenames-lib', function () {
//    gulp.src('./index.html')
//            .pipe(gulp.src(dest + cssUserFile + '*.css')
//                          .pipe(filenames('css-user')))
//            .pipe(gulp.src(dest + scriptUserCommonFile + '*.js')
//                          .pipe(filenames('js-user-common')))
//            .pipe(gulp.src(dest + scriptUserComponentFile + '*.js')
//                          .pipe(filenames('js-user-component')))
//            .pipe(htmlreplace({csslib: {src: ['/' + cssLibFile + d + '.css']},
//                cssuser: {src: ['/' + filenames.get('css-user')[0]]},
//                jslib: {src: ['/' + scriptLibMainFile + d + '.js', '/' + scriptLibSubFile + d + '.js']},
//                jsuser: {src: ['/' + filenames.get('js-user-common')[0], '/' + filenames.get('js-user-component')[0]]}}))
//            .pipe(gulp.dest(dest));
});

gulp.task('app-tmpl', ['clean-app-tmpl'], function() {
    return gulp.src(['./app/**/*.html', './app/**/*.json'])
            .pipe(gulpif('*.html', strip.html()))
            .pipe(gulpif('*.html', minifyHtml()))
            .pipe(gulpif('*.json', stripJsonComments()))
            .pipe(gulpif('*.json', jsonminify()))
            .pipe(useref())
            .pipe(templateCache('app.template.js', {module:'DesignPortal.templates', standalone:true}))
            .pipe(gulp.dest(tempTemplates));
});

gulp.task('clean-app-tmpl', function(){
    del([tempTemplates + '/*']);
});

gulp.task('watch', function () {
    gulp.watch(['./app/common/*.js', './app/common/**/*.js','./app/components/**/*.js', tempTemplates + '/app.template.js', '!./app/common/prod.config.js', '!./app/common/uat.config.js'], ['script-user-dev']);
    gulp.watch(['./css/**/*.css', '!./css/lib/*.css'], ['css-user']);
    gulp.watch(['./app/**/*.html', './app/**/*.json'], ['script-user-dev']);
    gulp.watch(['./css/**/*.scss'], ['sass']);
    gulp.watch(['./node_modules/reusable-filters/*.js', './node_modules/reusable-filters/**/*.js','./node_modules/reusable-filters/**/*.html', './node_modules/reusable-filters/**/*.css'], ['browserify']);
});

gulp.task('fonts', ['clean-fonts'], function () {
    return gulp.src('./fonts/**/*')
            //.pipe(fontmin())
            .pipe(gulp.dest(dest + 'fonts/'));
});

gulp.task('clean-fonts', function(){
    del([dest + 'fonts/*']);
});

gulp.task('images', ['clean-images'], function () {
    return gulp.src('./img/**/*')
            //.pipe(imagemin({progressive: true}))
            .pipe(gulp.dest(dest + 'img/'));
});

gulp.task('clean-images', function(){
    del([dest + 'img/*']);
});

gulp.task('icons', ['clean-icons'], function () {
    return gulp.src('./icons/**/*')
            .pipe(gulp.dest(dest + 'icons/'));
});

gulp.task('clean-icons', function(){
   del([dest + 'icons/*']);
});
// ['app/**/**/*.js', '!app/temp/**/*.*', '!app/template/**/*.js', '!node_modules/**']
// ['app/components/users-list/*.js', '!node_modules/**']
// gulp.task('lint', function() {
	// return gulp.src(['app/**/**/*.js', '!app/temp/**/*.*', '!app/template/**/*.js', '!node_modules/**'])
		// .pipe(eslint())
		// .pipe(eslint.format())
		// .pipe(eslint.failAfterError());
// });

/**§
 * Run test once and exit
 */
/*gulp.task('test', function (done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    },function() {
        done();
    });
});

gulp.task('test:unit',function(done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        browsers: ['PhantomJS']
    }, function(exitCode, exitStatus) {
        done(exitStatus ? "There are failing unit tests" : undefined);
    });

    karmaServer.start();
});

gulp.task('test:one', function (done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done()).start();
});

gulp.task('test:two', function(done) {
    karmaServer.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function(result) {
        if (result > 0) {
            return done(new Error(`Karma exited with status code ${result}`));
        }

        done();
    });
});

gulp.task('unit-test', function (done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function (exitCode) {
        done();
        process.exit(exitCode);
    }).start();
});*/

/**
 * DEV ENVIRONMENT
 */
// build only libraries
gulp.task('build-lib-dev', gulpSequence(['script-lib', 'css-lib'], 'replace-filenames-lib'));
// build only user files
gulp.task('build-user-dev', gulpSequence('app-tmpl', ['lint', 'script-user-dev', 'css-user'], 'replace-filenames-user', 'browser-sync', 'watch'));
// build complete deployment
gulp.task('build-all-dev', gulpSequence(['script-lib', 'browserify', 'css-lib', 'script-user-dev', 'css-user', 'sass', 'fonts', 'images', 'icons'], 'replace-filenames-all', 'browser-sync', 'watch'));

/**
 * SIT ENVIRONMENT
 * Same as DEV, excludes browser-sync and watch tasks
 */
// build only libraries
gulp.task('build-lib-sit', gulpSequence(['script-lib', 'css-lib'], 'replace-filenames-lib'));
// build only user files
gulp.task('build-user-sit', gulpSequence('app-tmpl', ['lint', 'script-user-dev', 'css-user'], 'replace-filenames-user'));
// build complete deployment
gulp.task('build-all-sit', gulpSequence(['script-lib', 'css-lib', 'script-user-dev', 'css-user', 'sass', 'fonts', 'images', 'icons'], 'replace-filenames-all'));

/**
 * UAT ENVIRONMENT
 */
// build only libraries for uat
gulp.task('build-lib-uat', gulpSequence('production', ['script-lib', 'css-lib'], 'replace-filenames-lib'));
// build only user files for uat
gulp.task('build-user-uat', gulpSequence('production', 'app-tmpl', ['lint', 'script-user-uat', 'css-user'], 'replace-filenames-user'));
// build complete deployment for uat
gulp.task('build-all-uat', gulpSequence('production', 'app-tmpl', ['script-lib', 'css-lib', 'script-user-uat', 'css-user', 'sass', 'fonts', 'images', 'icons'], 'replace-filenames-all'));

/**
 * PROD ENVIRONMENT
 */
// build only libraries for prod
gulp.task('build-lib-prod', gulpSequence('production', ['script-lib', 'css-lib'], 'replace-filenames-lib'));
// build only user files for prod
gulp.task('build-user-prod', gulpSequence('production', 'app-tmpl', ['lint', 'script-user-prod', 'css-user'], 'replace-filenames-user'));
// build complete deployment for prod
gulp.task('build-all-prod', gulpSequence('production', 'app-tmpl', ['script-lib', 'css-lib', 'script-user-prod', 'css-user', 'sass', 'fonts', 'images', 'icons'], 'replace-filenames-all'));
