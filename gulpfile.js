var $ = require("gulp-load-plugins")();
var argv = require("yargs").argv;
var gulp = require("gulp");
var newer = require("gulp-newer");
var rimraf = require("rimraf");
var panini = require("panini");
var sequence = require("run-sequence");
var sassLint = require("gulp-sass-lint");

// Check for --production flag
var isProduction = !!argv.production;

var remoteServer = isProduction
  ? "/home/deployer/sites/foundation-sites-6-marketing"
  : "/home/deployer/sites/foundation6-marketing-march16";

console.log(remoteServer);

// File paths to various assets are defined here.
var paths = {
  assets: ["src/assets/**/*", "!src/assets/{img,js,scss}/**/*"],
  downloads: ["src/downloads/**/*.*"],
  sass: ["bower_components/foundation-sites/scss"],
  javascript: [
    "node_modules/jquery/dist/jquery.js",
    "bower_components/foundation-sites/dist/js/foundation.js",
    "bower_components/what-input/what-input.js",
    "bower_components/typed.js/js/typed.js",
    "bower_components/waypoints/lib/jquery.waypoints.js",
    "bower_components/chart.js/dist/Chart.js",
    "src/assets/js/**/*.js",
    "bower_components/lodash/lodash.js",
    "src/assets/js/app.js"
  ]
};

// Delete the "dist" folder
// This happens every time a build starts
gulp.task("clean", function(done) {
  rimraf("./dist", done);
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task("copy", function() {
  return gulp.src(paths.assets).pipe(gulp.dest("./dist/assets"));
});

gulp.task("downloads", function() {
  return gulp.src("src/downloads/**/*.*").pipe(gulp.dest("./dist/downloads"));
});

// Resets Panini so that we can assemble using different layouts for the iframes and building block pages
function getNewPanini(options) {
  var p = new panini.Panini(options);
  p.loadBuiltinHelpers();
  p.refresh();
  return p.render();
}
// Copy page templates into finished HTML files
gulp.task("pages", function() {
  return gulp
    .src("./src/pages/**/*.html")
    .pipe(
      newer({
        dest: "./dist",
        ext: ".html"
      })
    )
    .pipe(
      getNewPanini({
        root: "./src/pages/",
        layouts: "./src/layouts/",
        partials: "./src/partials/",
        data: "./src/data/"
      })
    )
    .pipe($.cacheBust({ type: "MD5" }))
    .pipe(gulp.dest("./dist"));
});

gulp.task("pages:reset", function(done) {
  panini.refresh();
  done();
});

// Lint the Sass
gulp.task("lint", function() {
  return gulp
    .src("src/assets/scss/**/*.s+(a|c)ss")
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

// Compile Sass into CSS
// In production, the CSS is compressed
gulp.task("sass", function() {
  var uncss = $.if(
    isProduction,
    $.uncss({
      html: ["src/**/*.html"],
      ignore: [new RegExp("^meta..*"), new RegExp("^.is-.*")]
    })
  );

  return (
    gulp
      .src("./src/assets/scss/app.scss")
      .pipe(
        $.sass({
          includePaths: paths.sass,
          outputStyle: isProduction ? "compressed" : "nested"
        }).on("error", $.sass.logError)
      )
      .pipe(
        $.autoprefixer({
          browsers: ["last 2 versions", "ie >= 9"]
        })
      )
      // .pipe(uncss)
      .pipe(gulp.dest("./dist/assets/css"))
  );
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task("javascript", function() {
  var uglify = $.if(
    isProduction,
    $.uglify({
      mangle: false
    }).on("error", function(e) {
      console.log(e);
    })
  );

  return gulp
    .src(paths.javascript)
    .pipe($.concat("app.js"))
    .pipe(uglify)
    .pipe(gulp.dest("./dist/assets/js"));
});

// Compiles HTML templates into JST
gulp.task("jst", function() {
  return gulp
    .src("src/templates/*.html")
    .pipe(
      $.jstConcat("templates.js", {
        renameKeys: ["^.*marketing/(src.*.html)$", "$1"]
      })
    )
    .pipe(gulp.dest("dist/assets/js"));
});

// Copy images to the "dist" folder
// In production, the images are compressed
gulp.task("images", function() {
  var imagemin = $.if(
    isProduction,
    $.imagemin({
      progressive: true
    })
  );

  return (
    gulp
      .src("./src/assets/img/**/*")
      // .pipe(imagemin)
      .pipe(gulp.dest("./dist/assets/img"))
  );
});

// Deploy to the live server
gulp.task("deploy", ["build"], function() {
  return gulp
    .src("./dist/**")
    .pipe(
      $.prompt.confirm("Make sure everything looks right before you deploy.")
    )
    .pipe(
      $.rsync({
        root: "./dist",
        hostname: "ADD_DEPLOYER_NAME_AND_ADDRESS",
        destination: remoteServer
      })
    );
});

// Build the "dist" folder by running all of the above tasks
gulp.task("build", function(done) {
  sequence(
    "clean",
    [
      "copy",
      "pages",
      "lint",
      "sass",
      "javascript",
      "images",
      "jst",
      "downloads"
    ],
    done
  );
});

// Start a server with LiveReload to preview the site in
gulp.task("server", ["build"], function() {
  return gulp.src("./dist").pipe(
    $.webserver({
      host: "localhost",
      port: 8000,
      livereload: true,
      open: true
    })
  );
});

// Build the site, run the server, and watch for file changes
gulp.task("default", ["build", "server"], function() {
  gulp.watch(paths.assets, ["copy"]);
  gulp.watch(["./src/pages/**/*.html"], ["pages"]);
  gulp.watch(["./src/{layouts,partials}/**/*.html"], ["pages:reset", "pages"]);
  gulp.watch(["./src/assets/scss/**/*.scss"], ["sass"]);
  gulp.watch(["./src/assets/js/**/*.js"], ["javascript"]);
  gulp.watch(
    ["bower_components/foundation-sites/dist/foundation.js"],
    ["javascript"]
  );
  gulp.watch(["./src/assets/img/**/*"], ["images"]);
  gulp.watch(["./src/templates/**/*"], ["jst"]);
});
