module.exports = function(grunt) {
	
	// We'll use underscore utilitites
	var _ = require('underscore-contrib');

	// Filter an array of files and only return the javascript files
	var isJS = function(file){ return /\.js$/.test(file); };

	// Filter an array of files and only return CSS and LESS files
	var isCSS = function(file){ return /\.(less|css)$/.test(file); };

	// Load the build file which contains the list of 
	// library and game files to build
	var build = grunt.file.readJSON('build.json');

	grunt.initConfig({

		// Get the name & version of the package
		name: build.name,
		version: build.version,

		outputFile: 'cloudkid-createjs-display',

		// The deploy folder is the content that actually is for distribution
		distFolder: 'dist',

		// Build folder contains lists and configuration files for building
		buildFolder: 'build',

		// The output folders
		jsFolder: '<%= distFolder %>',

		// The collection of source files
		jsMain: _.filter(build.main, isJS),

		// The collection of source files
		jsMainDebug: _.filter(build.mainDebug || build.main, isJS),
		
		// Minify the JavaScript files
		uglify: {
			release: {
				files: {
					'<%= jsFolder %>/<%= outputFile %>.min.js': '<%= jsMain %>'
				},
				options: {
					compress: {
						global_defs: {
							"DEBUG": false,
							"RELEASE": true
						},
						dead_code: true
					}
				}
			},
			development: {
				files: {
					'<%= jsFolder %>/<%= outputFile %>.debug.js': '<%= jsMainDebug %>'
				},
				options: {
					compress: {
						global_defs: {
							"DEBUG": true,
							"RELEASE": false
						},
						dead_code: true
					},
					banner: '/*! <%= name %> <%= version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
					sourceMap: true
				}
			}
		},

		concat: {
			combine: {
				src: ['<%= jsMain %>'],
				dest: '<%= jsFolder %>/<%= outputFile %>.js'
			},
			options: {
				banner: '/*! <%= name %> <%= version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}
		},

		replace: {
			combine: {
				src: ['<%= jsFolder %>/<%= outputFile %>.js'],
				overwrite: true,
				replacements: [
					{ from: "DEBUG", to: "true" },
					{ from: "RELEASE", to: "false" }
				]
			}
		},

		// Provide hinting errors
		jshint: {
			all: [
				'Gruntfile.js',
				'<%= jsMain %>'
			]
		},

		// Watch changes in files and update
		watch: {
			// global watch options
			options: {
				reload: true,
				atBegin: true
			},
			js: {
				files: [
					'Gruntfile.js',
					'<%= jsMain %>',
					'build.json'
				],
				tasks: [
					'jshint', 
					'uglify:development',
					'combine'
				]
			}
		},

		// Bower install
		"bower-install-simple": {
			options: {
				color:       true,
				production:  false,
				directory:   'components'
			}
		},

		// Clean all of the build files
		clean: {
			js: [
				'<%= jsFolder %>/<%= outputFile %>.debug.js.map',
				'<%= jsFolder %>/<%= outputFile %>.debug.js',
				'<%= jsFolder %>/<%= outputFile %>.min.js',
				'<%= jsFolder %>/<%= outputFile %>.js'
			],
			components: [
				'components'
			]
		}
	});

	// Load the plugins dynamically
	require('load-grunt-tasks')(grunt);

	grunt.registerTask(
		'default', 
		'Default task to build all the game code', [
			'clean:js',
			'jshint',
			'uglify:release',
			'uglify:development',
			'combine'
		]
	);

	grunt.registerTask(
		'combine',
		'Builds a combined library file without minification',
		[
			'concat:combine',
			'replace:combine'
		]
	);

	grunt.registerTask(
		'dev',
		'Development mode to build the game',
		['watch']
	);

	grunt.registerTask(
		'clean-all',
		'Remove all build files and components',
		['clean']
	);

	grunt.registerTask(
		'libs', 
		'Import external client-side dependencies using Bower', [
			'bower-install-simple'
		]
	);
};