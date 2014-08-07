module.exports = function(grunt) {

	var path = require('path');

	require('load-grunt-config')(grunt, {
		
		// Path to tasks
		configPath: path.join(process.cwd(), 'tasks'),

		// auto grunt.initConfig()
		init: true,

		// Data based into config
		data: {

			// The name of the library from the build file
			build: grunt.file.readJSON('build.json'),

			// The name of the output file
			outputFile: 'cloudkid-createjs-display',

            // The deploy folder is the content that actually is for distribution
			distFolder: 'dist',
        }
	});
};