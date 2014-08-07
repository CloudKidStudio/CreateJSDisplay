module.exports = {
	combine: {
		src: ['<%= distFolder %>/<%= outputFile %>.js'],
		overwrite: true,
		replacements: [
			{ from: "DEBUG", to: "true" },
			{ from: "RELEASE", to: "false" },
			{ from: "${version}", to: "<%= build.version %>"}
		]
	},
	release : {
		src: ['<%= distFolder %>/<%= outputFile %>.min.js'],
		overwrite: true,
		replacements: [
			{ from: "${version}", to: "<%= build.version %>"}
		]
	},
	development: {
		src: ['<%= distFolder %>/<%= outputFile %>.debug.js'],
		overwrite: true,
		replacements: [
			{ from: "${version}", to: "<%= build.version %>"}
		]
	}
};