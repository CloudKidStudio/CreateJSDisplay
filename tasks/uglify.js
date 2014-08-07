module.exports = {
	release: {
		files: {
			'<%= distFolder %>/<%= outputFile %>.min.js': '<%= build.main %>'
		},
		options: {
			compress: {
				global_defs: {
					"DEBUG": false,
					"RELEASE": true
				},
				dead_code: true
			},
			banner: '/*! <%= build.name %> <%= build.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		}
	},
	development: {
		files: {
			'<%= distFolder %>/<%= outputFile %>.debug.js': '<%= build.main %>'
		},
		options: {
			compress: {
				global_defs: {
					"DEBUG": true,
					"RELEASE": false
				},
				dead_code: true
			},
			banner: '/*! <%= build.name %> <%= build.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		}
	}
};