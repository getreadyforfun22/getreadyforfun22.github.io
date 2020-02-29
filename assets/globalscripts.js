
function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}


jQuery(document).ready(function(){
	
	
		///////cookie
		;(function (factory) {
	var registeredInModuleLoader;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}

					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			var jar = {};
			var decode = function (s) {
				return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
			};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!this.json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function (key) {
			return api.call({
				json: true
			}, key);
		};
		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
	/////end of cookie
	
	
	/////////////////////////rating
	
	;(function ( $, window, document, undefined ) {

  'use strict';

  // Create the defaults once
  var pluginName = 'starRating';
  var noop = function(){};
  var defaults = {
    totalStars: 5,
    useFullStars: false,
    starShape: 'straight',
    emptyColor: 'lightgray',
    hoverColor: 'orange',
    activeColor: '#ff8216',
    ratedColor: 'crimson',
    useGradient: true,
    readOnly: false,
    disableAfterRate: true,
    baseUrl: false,
    starGradient: {
      start: '#000',
      end: '#000'
    },
    strokeWidth: 4,
    strokeColor: 'black',
    initialRating: 0,
    starSize: 15,
    callback: noop,
    onHover: noop,
    onLeave: noop
  };

	// The actual plugin constructor
  var Plugin = function( element, options ) {
    var _rating;
    var newRating;
    var roundFn;

    this.element = element;
    this.$el = jQuery(element);
    this.settings = $.extend( {}, defaults, options );

    // grab rating if defined on the element
    _rating = this.$el.data('rating') || this.settings.initialRating;

    // round to the nearest half
    roundFn = this.settings.forceRoundUp ? Math.ceil : Math.round;
    newRating = (roundFn( _rating * 2 ) / 2).toFixed(1);
    this._state = {
      rating: newRating
    };

    // create unique id for stars
    this._uid = Math.floor( Math.random() * 999 );

    // override gradient if not used
    if( !options.starGradient && !this.settings.useGradient ){
      this.settings.starGradient.start = this.settings.starGradient.end = this.settings.activeColor;
    }

    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  };

  var methods = {
    init: function () {
      this.renderMarkup();
      this.addListeners();
      this.initRating();
    },

    addListeners: function(){
      if( this.settings.readOnly ){ return; }
      this.$stars.on('mouseover', this.hoverRating.bind(this));
      this.$stars.on('mouseout', this.restoreState.bind(this));
      this.$stars.on('click', this.handleRating.bind(this));
    },

    // apply styles to hovered stars
    hoverRating: function(e){
      var index = this.getIndex(e);
      this.paintStars(index, 'hovered');
      this.settings.onHover(index + 1, this._state.rating, this.$el);
    },

    // clicked on a rate, apply style and state
    handleRating: function(e){
      var index = this.getIndex(e);
      var rating = index + 1;

      this.applyRating(rating, this.$el);
      this.executeCallback( rating, this.$el );

      if(this.settings.disableAfterRate){
        this.$stars.off();
      }
    },

    applyRating: function(rating){
      var index = rating - 1;
      // paint selected and remove hovered color
      this.paintStars(index, 'rated');
      this._state.rating = index + 1;
      this._state.rated = true;
    },

    restoreState: function(e){
      var index = this.getIndex(e);
      var rating = this._state.rating || -1;
      // determine star color depending on manually rated
      var colorType = this._state.rated ? 'rated' : 'active';
      this.paintStars(rating - 1, colorType);
      this.settings.onLeave(index + 1, this._state.rating, this.$el);
    },

    getIndex: function(e){
      var $target = jQuery(e.currentTarget);
      var width = $target.width();
      var side = jQuery(e.target).attr('data-side');

      // hovered outside the star, calculate by pixel instead
      side = (!side) ? this.getOffsetByPixel(e, $target, width) : side;
      side = (this.settings.useFullStars) ? 'right' : side ;

      // get index for half or whole star
      var index = $target.index() - ((side === 'left') ? 0.5 : 0);

      // pointer is way to the left, rating should be none
      index = ( index < 0.5 && (e.offsetX < width / 4) ) ? -1 : index;
      return index;
    },

    getOffsetByPixel: function(e, $target, width){
      var leftX = e.pageX - $target.offset().left;
      return ( leftX <= (width / 2) && !this.settings.useFullStars) ? 'left' : 'right';
    },

    initRating: function(){
      this.paintStars(this._state.rating - 1, 'active');
    },

    paintStars: function(endIndex, stateClass){
      var $polygonLeft;
      var $polygonRight;
      var leftClass;
      var rightClass;

      $.each(this.$stars, function(index, star){
        $polygonLeft = jQuery(star).find('[data-side="left"]');
        $polygonRight = jQuery(star).find('[data-side="right"]');
        leftClass = rightClass = (index <= endIndex) ? stateClass : 'empty';

        // has another half rating, add half star
        leftClass = ( index - endIndex === 0.5 ) ? stateClass : leftClass;

        $polygonLeft.attr('class', 'svg-'  + leftClass + '-' + this._uid);
        $polygonRight.attr('class', 'svg-'  + rightClass + '-' + this._uid);

      }.bind(this));
    },

    renderMarkup: function () {
      var s = this.settings;
      var baseUrl = s.baseUrl ? location.href.split('#')[0] : '';

      // inject an svg manually to have control over attributes
      var star = '<div class="jq-star" style="width:' + s.starSize+ 'px;  height:' + s.starSize + 'px;"><svg version="1.0" class="jq-star-svg" shape-rendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg" ' + this.getSvgDimensions(s.starShape) +  ' stroke-width:' + s.strokeWidth + 'px;" xml:space="preserve"><style type="text/css">.svg-empty-' + this._uid + '{fill:url(' + baseUrl + '#' + this._uid + '_SVGID_1_);}.svg-hovered-' + this._uid + '{fill:url(' + baseUrl + '#' + this._uid + '_SVGID_2_);}.svg-active-' + this._uid + '{fill:url(' + baseUrl + '#' + this._uid + '_SVGID_3_);}.svg-rated-' + this._uid + '{fill:' + s.ratedColor + ';}</style>' +

      this.getLinearGradient(this._uid + '_SVGID_1_', s.emptyColor, s.emptyColor, s.starShape) +
      this.getLinearGradient(this._uid + '_SVGID_2_', s.hoverColor, s.hoverColor, s.starShape) +
      this.getLinearGradient(this._uid + '_SVGID_3_', s.starGradient.start, s.starGradient.end, s.starShape) +
      this.getVectorPath(this._uid, {
        starShape: s.starShape,
        strokeWidth: s.strokeWidth,
        strokeColor: s.strokeColor
      } ) +
      '</svg></div>';

      // inject svg markup
      var starsMarkup = '';
      for( var i = 0; i < s.totalStars; i++){
        starsMarkup += star;
      }
      this.$el.append(starsMarkup);
      this.$stars = this.$el.find('.jq-star');
    },

    getVectorPath: function(id, attrs){
      return (attrs.starShape === 'rounded') ?
        this.getRoundedVectorPath(id, attrs) : this.getSpikeVectorPath(id, attrs);
    },

    getSpikeVectorPath: function(id, attrs){
      return '<polygon data-side="center" class="svg-empty-' + id + '" points="281.1,129.8 364,55.7 255.5,46.8 214,-59 172.5,46.8 64,55.4 146.8,129.7 121.1,241 212.9,181.1 213.9,181 306.5,241 " style="fill: transparent; stroke: ' + attrs.strokeColor + ';" />' +
        '<polygon data-side="left" class="svg-empty-' + id + '" points="281.1,129.8 364,55.7 255.5,46.8 214,-59 172.5,46.8 64,55.4 146.8,129.7 121.1,241 213.9,181.1 213.9,181 306.5,241 " style="stroke-opacity: 0;" />' +
          '<polygon data-side="right" class="svg-empty-' + id + '" points="364,55.7 255.5,46.8 214,-59 213.9,181 306.5,241 281.1,129.8 " style="stroke-opacity: 0;" />';
    },

    getRoundedVectorPath: function(id, attrs){
      var fullPoints = 'M520.9,336.5c-3.8-11.8-14.2-20.5-26.5-22.2l-140.9-20.5l-63-127.7 c-5.5-11.2-16.8-18.2-29.3-18.2c-12.5,0-23.8,7-29.3,18.2l-63,127.7L28,314.2C15.7,316,5.4,324.7,1.6,336.5S1,361.3,9.9,370 l102,99.4l-24,140.3c-2.1,12.3,2.9,24.6,13,32c5.7,4.2,12.4,6.2,19.2,6.2c5.2,0,10.5-1.2,15.2-3.8l126-66.3l126,66.2 c4.8,2.6,10,3.8,15.2,3.8c6.8,0,13.5-2.1,19.2-6.2c10.1-7.3,15.1-19.7,13-32l-24-140.3l102-99.4 C521.6,361.3,524.8,348.3,520.9,336.5z';

      return '<path data-side="center" class="svg-empty-' + id + '" d="' + fullPoints + '" style="stroke: ' + attrs.strokeColor + '; fill: transparent; " /><path data-side="right" class="svg-empty-' + id + '" d="' + fullPoints + '" style="stroke-opacity: 0;" /><path data-side="left" class="svg-empty-' + id + '" d="M121,648c-7.3,0-14.1-2.2-19.8-6.4c-10.4-7.6-15.6-20.3-13.4-33l24-139.9l-101.6-99 c-9.1-8.9-12.4-22.4-8.6-34.5c3.9-12.1,14.6-21.1,27.2-23l140.4-20.4L232,164.6c5.7-11.6,17.3-18.8,30.2-16.8c0.6,0,1,0.4,1,1 v430.1c0,0.4-0.2,0.7-0.5,0.9l-126,66.3C132,646.6,126.6,648,121,648z" style="stroke: ' + attrs.strokeColor + '; stroke-opacity: 0;" />';
    },

    getSvgDimensions: function(starShape){
      return (starShape === 'rounded') ? 'width="550px" height="500.2px" viewBox="0 146.8 550 500.2" style="enable-background:new 0 0 550 500.2;' : 'x="0px" y="0px" width="305px" height="305px" viewBox="60 -62 309 309" style="enable-background:new 64 -59 305 305;';
    },

    getLinearGradient: function(id, startColor, endColor, starShape){
      var height = (starShape === 'rounded') ? 500 : 250;
      return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="-50" x2="0" y2="' + height + '"><stop  offset="0" style="stop-color:' + startColor + '"/><stop  offset="1" style="stop-color:' + endColor + '"/> </linearGradient>';
    },

    executeCallback: function(rating, $el){
      var callback = this.settings.callback;
      callback(rating, $el);
    }

  };

  var publicMethods = {

    unload: function() {
      var _name = 'plugin_' + pluginName;
      var $el = jQuery(this);
      var $starSet = $el.data(_name).$stars;
      $starSet.off();
      $el.removeData(_name).remove();
    },

    setRating: function(rating, round) {
      var _name = 'plugin_' + pluginName;
      var $el = jQuery(this);
      var $plugin = $el.data(_name);
      if( rating > $plugin.settings.totalStars || rating < 0 ) { return; }
      if( round ){
        rating = Math.round(rating);
      }
      $plugin.applyRating(rating);
    },

    getRating: function() {
      var _name = 'plugin_' + pluginName;
      var $el = jQuery(this);
      var $starSet = $el.data(_name);
      return $starSet._state.rating;
    },

    resize: function(newSize) {
      var _name = 'plugin_' + pluginName;
      var $el = jQuery(this);
      var $starSet = $el.data(_name);
      var $stars = $starSet.$stars;

      if(newSize <= 1 || newSize > 200) {
        console.log('star size out of bounds');
        return;
      }

      $stars = Array.prototype.slice.call($stars);
      $stars.forEach(function(star){
        jQuery(star).css({
          'width': newSize + 'px',
          'height': newSize + 'px'
        });
      });
    },

    setReadOnly: function(flag) {
      var _name = 'plugin_' + pluginName;
      var $el = jQuery(this);
      var $plugin = $el.data(_name);
      if(flag === true){
        $plugin.$stars.off('mouseover mouseout click');
      } else {
        $plugin.settings.readOnly = false;
        $plugin.addListeners();
      }
    }

  };


  // Avoid Plugin.prototype conflicts
  $.extend(Plugin.prototype, methods);

  $.fn[ pluginName ] = function ( options ) {

    // if options is a public method
    if( !$.isPlainObject(options) ){
      if( publicMethods.hasOwnProperty(options) ){
        return publicMethods[options].apply(this, Array.prototype.slice.call(arguments, 1));
      } else {
        $.error('Method '+ options +' does not exist on ' + pluginName + '.js');
      }
    }

    return this.each(function() {
      // preventing against multiple instantiations
      if ( !$.data( this, 'plugin_' + pluginName ) ) {
        $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
      }
    });
  };

})( jQuery, window, document );
	
	
	///////////////// end of rating


	jQuery(".navi-ico").click(function(){
		jQuery(".mobile-nav-wrap").toggleClass("open-nav");
	});
	jQuery(".dt-header .menu-item-has-children").hover(function(){
		jQuery(this).find("ul.sub-menu").show();
	});
	jQuery(".dt-header .menu-item-has-children").mouseleave(function(){
		jQuery(this).find("ul.sub-menu").hide();
	});

	jQuery(".new-disc-call, .close-bubble").click(function(){
		jQuery(".disclosure-bubble").toggleClass("open-disclosure-content");
	});
	
	
	//rating
	jQuery(".my-rating-6").each(function(){
		var cookid = jQuery(this).parent().prop('id');
		var currentcook = Cookies.get(cookid);
		var cookval = jQuery(this).parent().find(".tnx-vote").prop('id');
		if (typeof Cookies.get(cookid) === 'undefined'){	} else {
			var cookval = Cookies.get(cookid);
			jQuery(this).parent().find(".tnx-vote").show();
		}
		jQuery(this).starRating({
			totalStars: 5,
			emptyColor: 'lightgray',
			hoverColor: 'salmon',
			activeColor: '#ff8216',
			initialRating: cookval,
			strokeWidth: 0,
			useGradient: false,
			callback: function(currentRating, $el){
				console.log('DOM element ', $el);
				Cookies.set(cookid, currentRating, 365);
  }
});
});



	if (jQuery(".btnbubblerel")[0]) {
		bbblh = jQuery(".btnbubblerel").height() +11 ;
		if (jQuery("#mobbody")[0]) {
			
			jQuery(".firstitemmob .mob-selling-points-line").css('padding-bottom' , '26px');
		}
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
			jQuery(".btnbubblerel").css('top', bbblh* -1);
			jQuery(".firstitemmob .visit-site-btn-wrap").css('padding-top' , bbblh /1.8);
		} else {
			jQuery(".btnbubblerel").css('bottom', bbblh* -1);
		}
		setTimeout(function(){
			jQuery(".btnbubblerel").fadeIn('slow');
		}, 2000);
	}
	
	//Grid filter
	if (jQuery(".filterswrap")[0]) {
		var currrl = window.location.pathname;
		jQuery("select.filtwrap option").each(function(){
			var opval = jQuery(this).val();
			if (opval.includes(currrl)) {
				jQuery("select.filtwrap").val(opval);
			}
		});
		jQuery("select.filtwrap").on('change', function(i){
				window.location.href = jQuery(this).val();
		});
	}
		
});
