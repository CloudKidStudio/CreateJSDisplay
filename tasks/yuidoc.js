module.exports = {
	compile: {
		name: '<%= build.name %>',
		description: '<%= build.description %>',
		version: '<%= build.version %>',
		url: '<%= build.url %>',
		options: {
			linkNatives: true,
			attributesEmit: true,
			helpers: ["../CloudKidTheme/path.js"],
			paths: 'src',
			themedir: '../CloudKidTheme',
			outdir: 'docs'
		}
	}
};