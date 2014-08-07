module.exports = {
	combine: {
		src: ['<%= build.main %>'],
		dest: '<%= distFolder %>/<%= build.output %>.js'
	},
	options: {
		banner: '/*! <%= build.name %> <%= build.version %> */\n'
	}
};