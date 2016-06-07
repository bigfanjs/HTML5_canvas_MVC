/*

	Implementing the MVC design pattern in HTML5 canvas.

	No classical inheritance being used! It's all simple prototypal OO.

	I preferred to make it very simple, because there still a lot
	of other stuff the controller for exapmle has to take care of.

	copyright(c) Adel 2016
*/

const body = {
	x: 0,
	y: 0,
	width: 50,
	height: 50,
	color: '#555',
	isFull: true,
	border: false,
	strokeColor: '#000',
	action: null,
	type: 'rect',
	draw( ctx ) {
		ctx.beginPath();
		if ( this.type == 'rect' ) {
			ctx.rect(
				this.x,
				this.y,
				this.width,
				this._height
			);
		} else if ( this.type == 'circle' ) {
			ctx.arc(
				this._x,
				this.y,
				this.radius,
				0,
				Math.PI * 2,
				false
			);
		} else {
			ctx.drawImage( Model.image, this.x, this.y, this.width, this.height );
		}
		if ( this.isFull && this.type != 'image' ) {
			ctx.fillStyle = this.color;
			ctx.fill();
		}
		if ( ctx.border && this.type != 'image' ) {
			ctx.strokeStyle = this.strokeColor;
			ctx.stroke();
		}
	},
	update() {
		this._height = this.height;
		if ( this.id == 'volume' ) {
			this.y = this.height - ( this._height = this.height * Model.volume );
		} else if ( this.id == 'volumeSlider' ) {
			this.y = this.heightOrigin - ( this.heightOrigin * Model.volume );
		}
		if ( this.type == 'circle' ) {
			if ( !this.isStatic ) this._x = this.currX = this.offsetX + ( this.x / Model.duration ) * Model.currentTime;
			else this._x = this.x;
		}
	}
};

const line = {
	x1: 0,
	y1: 0,
	x2: 0,
	y2: 0,
	lineWidth: 8,
	lineCap: 'round',
	color: '#6BB3CC',
	isStatic: true,
	setStart( x, y ) {
		this.x1 = x;
		this.y1 = y;
	},
	setTarget( x, y ) {
		this.x2 = x;
		this.y2 = y;
	},
	draw( ctx ) {
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.lineWidth = this.lineWidth;
		ctx.lineCap = this.lineCap;
		ctx.moveTo( this.x1, this.y1 );
		ctx.lineTo(
			this._x2,
			this.y2
		);
		ctx.stroke();
	},
	update() {
		if ( !this.isStatic ) {
			this._x2 = this.offsetX + ( this.x2 / Model.duration ) * Model.currentTime;
		} else {
			this._x2 = this.x2;
		}
	}
};

const text = {
	x: 0,
	y: 0,
	text: 'text',
	color: '#454545',
	fontSize: 16,
	fontFamilly: 'tahoma',
	baseline: 'middle',
	rotation: 0,
	draw( ctx ) {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.font = this.fontSize + 'px ' + this.fontFamilly;
		ctx.textBaseline = this.baseline;
		ctx.fillText( this.minutes + ':' + this.seconds, this.x, this.y );
	},
	update() {

		if ( this.id == 'time' ) {
			this.seconds = Model.currentTime.toFixed( 0 );
			this.minutes = Math.floor( this.seconds / 60 );

			if ( this.seconds >= 60 ) {
				this.seconds -= this.minutes * 60;
			}

			var value1 = this.seconds < 10 ? '0' : '';
			var value2 = this.minutes < 10 ? '0' : '';

			this.seconds = value1 + this.seconds;
			this.minutes = value2 + this.minutes;

			if ( Model.ended && this.one ) Controller.whenEnded();
		}

	}
};

const Factory = function Factory( options ) {
	const obj = {};

	const compose = function ( _factory ) {
		if ( typeof _factory === 'function' ) {
			compose( _factory() );
		} else if ( Object.prototype.toString.call( _factory ) === '[object Object]' ) {
			Object.assign(obj, _factory);
		}

		Object.assign(obj, options);

		return obj;
	};

	Object.setPrototypeOf(obj, { compose });

	return obj;
};

const View = {
	setUp() {
		var mainElement = Model.canvas;
		var w = mainElement.width = 460;
		var h = mainElement.height = 60;

		this.state = Model;
		this.elems = [];

		var playBtnC = Factory({
			width: 100,
			height: 60,
			color: '#F44336',
			id: 'play_button_container'
		}).compose( body );

		var playBtn = Factory({
			x: ( playBtnC.x + playBtnC.width / 2 ) - 15 / 2,
			y: ( playBtnC.y + playBtnC.height / 2 ) - 15 / 2,
			width: 15,
			height: 15,
			action: 'play',
			type: 'image',
			image: Model.image,
			id: 'play_button'
		}).compose( body );

		var slidBtnContainer = Factory({
			x: playBtnC.width,
			width: 360,
			height: 60,
			color: '#80D6F4',
			id: 'slider_container'
		}).compose( body );

		var playBackWidth = slidBtnContainer.width - 120;

		var sliderC = Factory({
			offsetX: playBtnC.x + playBtnC.width + 60,
			color: '#6BB3CC',
			type: 'line',
			action: 'jump',
			id: 'play_back'
		}).compose( line );

		sliderC.offsetX = playBtnC.x + playBtnC.width + 60;
		sliderC.setStart( sliderC.offsetX, playBtnC.height / 2 );
		sliderC.setTarget( sliderC.offsetX + playBackWidth, playBtnC.height / 2 );

		var slider = Factory({
			offsetX: playBtnC.x + playBtnC.width + 60,
			color: '#F44336',
			isStatic: false,
			currentTime: Model.currentTime || 0
		}).compose( line );

		slider.setStart( slider.offsetX, playBtnC.height / 2 );
		slider.setTarget( playBackWidth, playBtnC.height / 2 );

		var crl = Factory({
			offsetX: slider.offsetX,
			isStatic: false,
			color: '#FFF',
			type: 'circle',
			radius: 7,
			y: playBtnC.height / 2,
			x: playBackWidth,
			currX: slider.offsetX,
			action: 'slide',
			currentTime: Model.currentTime || 0,
			id: 'crl'
		}).compose( body );

		var currentTime = Factory({
			x: playBtnC.width + 7,
			y: playBtnC.height / 2,
			seconds: Model.currentTime || 0,
			minutes: 0,
			one: true,
			id: 'time'
		}).compose( text );

		var minutes = Math.floor( Model.duration / 60 );
		var seconds = ( ( Model.duration / 60 ) - minutes ).toFixed( 2 ) * 60;

		var endTime = Factory({
			x: playBtnC.width + playBackWidth + 60 + 9,
			y: playBtnC.height / 2,
			minutes: ( minutes < 10 ? '0' : '' ) + minutes,
			seconds: ( seconds < 10 ? '0' : '' ) + seconds,
			one: true,
			id: 'endTime'
		}).compose( text );

		var volumeBar = Factory({
			x: playBtnC.width + 60 + playBackWidth + 53,
			type: 'rect',
			color: '#6BB3CC',
			width: 7,
			height: playBtnC.height,
			id: 'volume_bar',
			action: 'turnUpDown'
		}).compose( body );

		var volume = Factory({
			x: playBtnC.width + 60 + playBackWidth + 53,
			type: 'rect',
			color: '#F44336',
			width: 7,
			height: Model.volume * playBtnC.height,
			id: 'volume'
		}).compose( body );

		var volumeSlider = Factory({
			x: playBtnC.width + 60 + playBackWidth + 53,
			type: 'rect',
			color: '#FFF',
			width: 7,
			height: 5,
			id: 'volumeSlider',
			action: 'slide',
			heightOrigin: volumeBar.height
		}).compose( body );

		mainElement.addEventListener('mousedown', e => {
			Controller.handle( e, playBtn, crl, sliderC, volumeBar, volumeSlider );
		}, 'false');
		window.addEventListener('mouseup', e => { Controller.handle( e, crl, volumeSlider ) }, 'false');
		mainElement.addEventListener('mousemove', e => { Controller.handle( e, crl, playBtn, volumeSlider ) }, 'false');

		this.elems.push(
			currentTime,
			endTime,
			volumeSlider,
			volume,
			volumeBar,
			crl,
			slider,
			sliderC,
			playBtn,
			slidBtnContainer,
			playBtnC
		);
	},
	update() {
		var ctx = Model.canvas.getContext('2d');
		var w = Model.canvas.width;
		var h = Model.canvas.height;

		ctx.clearRect( 0, 0, w, h );

		var l = this.elems.length;

		while ( l-- ) {
			let obj = this.elems[ l ];

			obj.update();
			obj.draw( ctx ); 
		}
	},
	getElement( id ) {
		return this.elems.find(elem => {
			return elem.id == id;
		});
	}
};

const Controller = (function () {
	var slide;
	var offsetX;

	const mouse = {
		x: 0,
		y: 0,
		is_down: false,
		id: null
	};

	function updateImg( action ) {
		Model.images.forEach(image => {
			if ( image.method == action ) Model.playPause_img = image;
		});
	}

	function isContaine( object, o ) {
		return !(
			o.x < object.x ||
			o.y < object.y ||
			o.x > object.x + object.width ||
			o.y > object.y + object.height
		);
	}

	function containesPoint( object, o ) {

		switch ( object.type ) {
			case 'circle':
				let x = object._x - o.x,
					y = object.y - o.y,
					dist = Math.sqrt( x * x + y * y );

				return dist < object.radius;
			case 'line':
				return !(
					o.x < object.x1 ||
					o.y < object.y1 - object.lineWidth / 2 ||
					o.x > object.x2 ||
					o.y > object.y1 + object.lineWidth / 2
				);
			default:
				if ( object.type == 'rect' || object.type == 'image' )
					return isContaine( object, o );
		}
	}

	function down( event, elems ) {
		mouse.x = event.clientX - Model.rect.left;
		mouse.y = event.clientY - Model.rect.top;

		elems.forEach(function ( elem, idx ) {
			if ( containesPoint( elem, mouse ) ) {
				if ( elem.action === 'play' ) {
					if ( Model.isRunning ) {
						Model.audio.pause();
						Model.isRunning = false;
						updateImg('play');
					} else {
						Model.audio.play();
						Model.isRunning = true;
						View.getElement('time').one = true;
						updateImg('pause');
					}
				} else if ( elem.action === 'slide' ) {
					mouse.id = elem.id;
					if ( mouse.is_down ) return;
					mouse.is_down = true;
				} else if ( elem.action === 'jump' ) {
					Model.audio.currentTime = ( mouse.x - offsetX ) / ( slide.x2 - slide.x1 ) * Model.duration;
				} else if ( elem.action === 'turnUpDown' ) {
					let height;
					Model.audio.volume = (
						( height = View.getElement('volume_bar').height ) - mouse.y
					) / height;
				}
			}
		});
	}

	function up( event ) {
		if ( !mouse.is_down ) return;
		mouse.is_down = false;
		event.preventDefault();
	}

	function move( event, elems ) {
		var activate = false;
		var height;

		mouse.x = event.clientX - Model.rect.left;
		mouse.y = event.clientY - Model.rect.top;

		elems.forEach(( elem ) => {
			if ( containesPoint( elem, mouse ) ) {
				Model.canvas.style.cursor = 'pointer';
				activate = true;
			}
		});

		if ( activate == false ) Model.canvas.style.cursor = 'auto';

		if ( !mouse.is_down ) return;

		let item;

		if ( ( item = elems.find(( o ) => o.id == mouse.id ) ) != null ) {
			let id = item.id;

			if ( id == 'crl' ) {
				Model.audio.currentTime = ( mouse.x - offsetX ) / ( slide.x2 - slide.x1 ) * Model.duration;
			} else if ( id == 'volumeSlider' ) {
				Model.audio.volume = (
					( height = View.getElement('volume_bar').height ) - mouse.y
				) / height;
			}
		}
	}

	return {
		handle( event, ...elems ) {
			offsetX = View.getElement('play_button_container').width + 60
			slide = View.getElement('play_back');

			switch ( event.type ) {
				case 'mousedown':
					down( event, elems );
					break;
				case 'mouseup':
					up( event );
					break;
				case 'mousemove':
					move( event, elems );
					break;
			}
		},
		whenEnded() {
			if ( !Model.loop ) {
				View.getElement('time').one = false;
				Model.audio.pause();
				Model.isRunning = false;
				updateImg('play');
			}
		}
	};
})();

const Model = {
	setUp( resources ) {
		var audio = this.audio = document.getElementById('audio');
		var canvas = this.canvas = document.getElementById('canvas');

		var s = {
			images: resources,
			playPause_img: resources.find( v => v.method == 'play' )
		};

		({  autoplay: s.autoplay,
			duration: s.duration,
			loop: s.loop,
			volume: s.volume,
			muted: s.muted
		} = audio);

		Object.assign( this, s );

		View.setUp();
		this.notify();
	},
	notify: function notify() {
		this.currentTime = this.audio.currentTime;
		this.image = this.playPause_img;
		this.rect = canvas.getBoundingClientRect();
		this.ended = this.audio.ended;
		this.volume = this.audio.volume;

		View.update( this );

		window.requestAnimationFrame( notify.bind( this ) );
	}
};

window.onload = function () {
	var methods = [ 'play', 'pause' ];
	var dfds = [];

	methods.forEach(( method, idx ) => {
		let image = new Image();

		image.src = './images/' + method + '.png';
		image.method = method;

		let promise = new Promise(( res, rej ) => {
			image.onload = () => { res( image ); };
		});

		dfds.push( promise );
	});

	Promise.all( dfds ).then(args => {
		Model.setUp( args );
	});
};
