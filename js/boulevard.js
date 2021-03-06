var Boulevard = function() {
	this.namespace = 'Boulevard';
	this.currentImage = 0;
	this.timer;
};

Boulevard.prototype = {
	bindImages: function() {
		var self = this;
		requestAnimationFrame(function() {
			self.getImages()
				.css('cursor', 'pointer')
				.off(self.namespace)
				.on('click.' + self.namespace, function(e) {
					e.preventDefault();

					if ( !($('body').hasClass('k-source-album') || $('body').hasClass('k-source-favorites')) ) return true;
					// var _index = (!$('#album-intro').length) ? $(this).closest('.cell').index() + 1 : $(this).closest('.cell').index();
					// if ( _index < self.currentImage ) {
					// 	self.currentImage--;
					// } else if ( _index >= self.currentImage ) {
					// 	self.currentImage++;
					// }
					// self.laneScrollTo();
				});

			$(window).trigger('resize');
		});
	},
	checkLane: function() {
		(!$('#lane .cell').length) ? $('#next,#prev').hide() && $('#lane').width('auto') : $('#next,#prev').show();
	},
	easeOut: function(x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	getImages: function() {
		return $('#lane img:not(.__overlay__),#lane .cell.video');
	},
	getCurrentImageInView: function() {
		var self = this;
		if ($(window).scrollLeft() <= 0) {
			this.currentImage = 0;
			return;
		}
		this.getImages().each(function(i) {
			if ($(this).closest('.cell').offset().left > $(window).scrollLeft()) {
				self.currentImage = ++i;
				return false;
			}
		});
	},
	getMediaQueryHeight: function() {
		var e = window, a = 'inner';

		if (!('innerWidth' in window )) {
		    a = 'client';
		    e = document.documentElement || document.body;
		}

		var _width = e[ a+'Width' ],
			_height = e[ a+'Height' ],
			_hBreakpoint;

		if (_height >= 1200) {
			_hBreakpoint = 800;
		} else if (_width < 767) {
			_hBreakpoint = 165;
		} else {
			_hBreakpoint = 600;
		}

		return _hBreakpoint;
	},
	laneScrollTo: function() {
		var _totalImages = this.getImages().length;

		if (this.currentImage >= _totalImages) {
			this.currentImage = _totalImages;
		} else if ( this.currentImage < 0 ) {
			this.currentImage = 0;
		}

		var newLeftPos = (this.currentImage === 0 && $('#album-intro').length) ? 0 : $('#lane .cell:eq(' + this.currentImage + ')').offset().left;

		$('html,body').stop().animate({
			scrollLeft: ( newLeftPos - 240 )
		}, 400, this.easeOut);
	},
	lazyHold: function() {
		var self = this;
		$K.responsiveImages(this.getImages(), function() {
			self.updateLaneWidth();
			self.getCurrentImageInView();
			requestAnimationFrame(function() {
				$('[data-lazy-hold]').attr('data-lazy-hold', null);
			});
		});
	},
	ready: function() {
		window.scrollTo(0,0);
		this.currentImage = 0;
		this.lazyHold();
		this.updateLaneProperties();
		this.checkLane();
		this.bindImages();
		this.shortenPlaces();
		this.blogHeight();
		this.fixPlacesLinks();
	},
	updateLaneProperties: function() {
		$('#lane').css({
			// top: ( $('header').css('display') === 'none' || $('header').css('visibility') === 'hidden' ) ? '0px' : $('header').height() + 'px',
			top: laneOffsetTop,
			width: '99999px' // prevents jumpiness when defining width after images load
		});
	},
	updateLaneWidth: function() {
		var width = 0,
			offset = ( $('#album-intro').length <= 0 ) ? 10 : $('#album-intro').outerWidth(true); // Adjust for albums which have a text box at the beginning
		if (this.getImages().length <= 0) return;
		this.getImages().each(function() {
			width += $(this).closest('.cell').outerWidth(true);
		});
		$('#lane').css('width', (width+offset) + 'px');

		// Check if captions are longer than their images and if so set the width of the caption to the image width
		$('span.caption').each(function() {
			var imageWidth = $(this).closest('div').find('img').width(),
				captionWidth = $(this).width();
			if ((captionWidth > imageWidth) && (imageWidth > 0)) $(this).width(imageWidth);
		});
	},
	updateVimeo: function() {
		var self = this;
		$('iframe[src^="//player.vimeo.com"]').each(function() {
			var cell = $(this).parents('.cell');
			cell.find('.max-width-video-wrapper').css('max-width', '');
			cell.width(self.getMediaQueryHeight() * cell.data('aspect'));
			cell.attr('data-vimeo', true);
			self.updateLaneWidth();
		});
	},
	shortenPlaces: function() {
		var $places = $('.albums--grouped');
		var button = '<div class="item item--teaser"><button type="button">Show more</button></div>';

		var filterAlbums = function(index) {
			var album = $places.eq(index);

			if (album.find('.item').length > 3) {
				album.append(button);

				window.setTimeout(function() {
					album.find('.item--teaser').addClass('is-visible');
				}, 0);
			}
		}

		$places.on('click', '.item--teaser button', function() {
			$(this).closest('.albums--grouped').addClass('show-all');
			$(this).parent().remove();
		});

		$places.each(filterAlbums);
	},
	blogHeight: function() {
		var w_height = $(window).height();

		$('.blog-iframe').height(w_height);
	},
	fixPlacesLinks: function() {
		var $places = $('.albums--grouped');

		$places.on('click', '.item > a', function() {
			return false;
		});
	}
}

Boulevard = new Boulevard();

var laneOffsetTop = '50px';

if ($(window).width() < 480) {
	laneOffsetTop = '120px';
}

$(function() {

	var blvd = window.Boulevard;

	$('nav ul').tinyNav({ header: 'Navigation' });

	if ($('#site-title img').length) {
		$('#site-title img').on('load', function() {
			$('#lane').css('top', 0);
		});
	}

	$(window)
		.on('resize', function() {
			clearTimeout(blvd.timer);
			blvd.timer = setTimeout(function() {
				clearTimeout(blvd.timer);
				blvd.lazyHold();
				blvd.updateVimeo();
			}, 250);
		})
		.on('k-infinite-loaded', function() {
			blvd.lazyHold();
		})

	$(document)
		.off(blvd.namespace)
		.on('k-pjax-end.' + blvd.namespace, blvd.checkLane)
		.on('k-image-loading.' + blvd.namespace, function() {
			blvd.updateLaneWidth();
		})
		.on('pjax:complete.' + blvd.namespace, function() {
			if ($('#album-intro').length > 0) $('#site-title h2').html( '/&nbsp;' + $('#album-intro h1').text().trim());
			blvd.ready();
			$K.ready();
		})
		.on('click.' + blvd.namespace, '#next,#prev', function(e) {
			e.preventDefault();
			blvd.currentImage += ( $(this).attr('id') === 'next' ) ? 1 : -1;
			blvd.laneScrollTo();
		});

	if ($.support.pjax) {
		$(document)
			.on('click.' + blvd.namespace, '#lane a', function() {
				if (!$('body').hasClass('k-source-album')) {
					if ($('#lane').length) {
						var self = $(this);

						var text = $(this).text().trim().length ? $(this).text().trim() : $(this).find('img').attr('alt');

						// Write the album title or remove it
						if ( $(this).closest('#lane').length > 0 ) {
							$('#site-title h2').html( '/&nbsp;' + text);
						} else {
							$('#site-title h2').html('');
						}
						//

						$.pjax({
							url: self.attr('href'),
							container: '#lane'
						});

						return false;
					}
				}
			});
	}

	$('#lane')
		.on('mousewheel', function(e) {
			if ($(e.target).closest('#album-intro').length) return true;
			e.preventDefault();
			$(document).scrollLeft($(document).scrollLeft() + (e.deltaFactor * e.deltaY) * -1);
			blvd.getImages().each(function(i,img) {
				if ( $(this).closest('.cell').offset().left > $(window).scrollLeft() ) {
					blvd.currentImage = i;
					return false;
				}
			});
		});

	$('#lane iframe').attr('scrolling', 'no');

	window.addEventListener( 'orientationchange', function() {
		window.setTimeout(function() {
			// $('#lane').css( 'top', ( $('header').css('display') === 'none' || $('header').css('visibility') === 'hidden' ) ? '0px' : $('header').height() + 'px' );
			$('#lane').css( 'top', laneOffsetTop);
		},500)
		return false;
	});

	blvd.ready();

});