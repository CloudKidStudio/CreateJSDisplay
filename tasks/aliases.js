module.exports = function(grunt)
{
	grunt.registerTask(
		'default', 
		'Default task to build all the library in minified, debug and combined modes', [
			'clean:all',
			'jshint',
			'uglify:release',
			'replace:release',
			'uglify:development',
			'replace:development',
			'combine'
		]
	);

	grunt.registerTask(
		'combine',
		'Builds a combined library file without minification', [
			'concat:combine',
			'replace:combine'
		]
	);

	grunt.registerTask(
		'dev',
		'Development mode to build the library',
		['watch']
	);

	grunt.registerTask(
		'clean',
		'Remove all build files',
		['clean:all']
	);

	grunt.registerTask(
		'docs',
		'Auto generate the documentation',
		['clean:docs','yuidoc']
	);

	grunt.registerTask(
		'docs-live',
		'Generate documentation and push to gh-pages branch',
		['clean:docs', 'yuidoc', 'gh-pages']
	);
};