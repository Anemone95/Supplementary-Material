reasy.match('http/*.js', {
	packTo: 'http.js'
})
.extend('pack')
.match('require.js', {
	packOrder: -101
})
.match('conf.js', {
	packOrder: -100
})
.match('mime.js', {
	packOrder: -99,
	optimizer: 'uglify-js'
})
.match('index.js', {
	packOrder: 100
})

