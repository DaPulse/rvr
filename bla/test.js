var MPlayer = require('mplayer');

var player = new MPlayer();

player.setOptions({
	fullscreen: true,
	loop: 1000
});
player.openFile('video.mp4');
