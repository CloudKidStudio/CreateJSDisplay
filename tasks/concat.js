module.exports = {
	combine: {
		src: ['<%= build.main %>'],
		dest: '<%= distFolder %>/<%= outputFile %>.js'
	},
	options: {
		banner: '/*! <%= build.name %> <%= build.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	}
};