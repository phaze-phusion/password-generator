
(function($) {

	"use strict";

	window._generator = {};

	/*
	 * Number Cleanser
	 *
	 * @param {mixed} n Number to clean-up
	 * @returns {intger} Cleansed number
	 */
	var cleanNumber = function(n){n=parseInt((''+n).replace(/[^\d\.\-]/g,''));return isNaN(n)?0:n;};

	/*
	 * Thousands Formatter
	 *
	 * @param {float|number} n Number to format
	 * @returns {string} Formatted number
	 */
	var thousands = function(n){let p=n.toString().split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');return p.join('.');};

	/*
	 * Get only unique values from array
	 *
	 * @param {string} value
	 * @returns {intger} index
	 * @returns {object} self
	 * 
	 * @return {mixed}
	 */
	var arrayUniqueValues = function(value, index, self) { 
	    return self.indexOf(value) === index;
	}

	/**
	 * Retun a random string
	 *
	 * @link http://stackoverflow.com/a/19964557/124222
	 *
	 * @param {string} character_library
	 * @param {integer} len =4
	 * @param {integer} lenLimit =16
	 *
	 * @return {string}
	 */
    var makeRandomString = function( character_library, len = 4, lenLimit = 16 ){
		let str = '';
		if(len > lenLimit)
			len = lenLimit
		while( str.length <= len ) {
			str += Array.apply(null, Array( 10 ))
				.map(function(){
					return character_library.charAt( Math.floor( Math.random() * character_library.length ) );
				}).join('');
		}
		return str.substr(0, len);
	};

	/**
	 * Fisher-Yates (aka Knuth) Shuffle
	 * 
	 * Adjusted for strings
	 * 
	 * @link https://github.com/coolaj86/knuth-shuffle
	 * @link http://stackoverflow.com/a/2450976/124222
	 *
	 * @param {array} array
	 * 
	 * @return {array}
	 */
	var shuffle = function( array ) {
		let currentIndex = array.length;
		array = array.split('');

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			let randomIndex = Math.floor( Math.random() * currentIndex );
			currentIndex -= 1;

			// And swap it with the current element.
			let temp = array[ currentIndex ];
			array[ currentIndex ] = array[ randomIndex ];
			array[ randomIndex ] = temp;
		}
		return array.join('');
	};

	class Element {
		constructor( id ) {
	        this.el = this.id = id;

	        let dash = id.indexOf('-');

	        if( dash !== -1 ) {
		        this._prefix = id.substr(0, dash);
		        this._suffix = id.substr(dash + 1);
	        } else {
	        	this._prefix = id;
		        this._suffix = undefined;
	        }
	    };

		set el( id ) {
	    	this._element = document.getElementById( id );
	    }
	    get el() {
	        return this._element;
	    }
	}

	class Input extends Element {
	    constructor( id ) {
	    	super( id );

	        this.type = this._element.type;
        	this.value = this._element[ this.elementValueProperty() ];
	        this.listen();
	    };

	    listen(){
	    	let inp = this;
	    	$( inp.el ).on('keyup change', function(){
	    		inp.value = inp._element[ inp.elementValueProperty() ];
	    		$( '#' + inp._prefix ).trigger( inp._prefix + '.updated' );
	    	});
	    }

	    elementValueProperty(){
	    	return 'value';
	    }

	    set value( val ) {
	        this._value = this._element.value = val;
	    }
	    get value() {
	        return this._value;
	    }
	}

	class CountInput extends Input {
		constructor( id ) {
			super( id );
		}

		set value( val ){
			this._value = this._element.value = cleanNumber( val );
		}
		get value() {
	        return this._value;
	    }
	}

	class CheckboxInput extends Input {
		constructor( id ) {
			super( id );
		}

		elementValueProperty(){
	    	return 'checked';
	    }

		set value( val ) {
			this.previousValue = this._value || val;
	        this._value = this._element.checked = ( val == true );
	    };
	    get value() {
	        return this._value;
	    };
	}

	class Textarea extends Element {
		constructor( id ){
			super( id );
		}

		set value( val ){
			this._value = this._element.value = val;
		}
		get value() {
	        return this._value;
	    }
	}

	class Button extends Element {
		constructor( id ){
			super( id );
	        this.listen();
		}

		listen(){
	    	let but = this;
	    	$( but.el ).on('keyup click touchend', function(){
	    		$( '#' + but._prefix ).trigger( but._prefix + '.updated' );
	    	});
	    }
	}

	class BookShelf{
		constructor( prefix, characters ) {
			this.id = prefix;
			this.charmap = characters;
			this.cbx = new CheckboxInput( this.id + '-cb' );
			this.min = new CountInput( this.id + '-count' );
			this.dup = new CountInput( this.id + '-duplicate' );
			this.out = new Input( this.id + '-output' );
			this.but = new Button( this.id + '-button' );
			this.permutations = 0;
			this.consolidateData();
			this.listen();
		}

		listen(){
			let row = this;

	    	$( '#' + row.id ).on( row.id + '.updated' , function( event ){
				//console.log( 'row ' + row.id, event.namespace );
				row.consolidateData();
	    	});
		}

		consolidateData(){
			let unique_sets_count = this.dup.value + 1,
    			maximum_length = this.charmap_size * unique_sets_count;

    		if( this.min.value > maximum_length )
    			this.min.value = maximum_length;

    		if ( this.cbx.value ) {

    			let unique_sets = [];

    			for ( let u = 0; u < unique_sets_count; u++ ) {

    				let rand = '',
    					only_uniques = '',
    					fallbackLoopBreak = 0;

    				// Stop Loop if:
    				//  1. unique string length is same length as charmap AKA all charmap characters appear only once in string
    				//  2. unique string length is same (or larger) length as min required count
    				//  3. fallback reaches 100
    				while( only_uniques.length < this.charmap.length && only_uniques.length < this.min.value && fallbackLoopBreak < 100 ){
    					rand += makeRandomString( this.charmap, this.min.value, maximum_length );
    					only_uniques = ( ( rand.split('') ).filter( arrayUniqueValues ) ).join('');
    					fallbackLoopBreak++;
    				}

    				unique_sets.push( only_uniques );
    			}

    			this.value = unique_sets.join('');
    			this.permutations = Math.pow( this.charmap_size, this.min.value );
    			//console.log( 'row ' + this.id, this.value );

    		} else {
    			// if checkbox is uncheck, disable the component
    			this.value = '';
    			this.permutations = 0;
    		}

			$( _generator.primary_output.el ).trigger('shelf_shuffle' );
		}

		sorted_value(){
			return this.value.split('').sort().join('');
		}

		set value( val ){
			if( val.length )
				val = val.substr(0, this.min.value);
			this._value = val;
		}
		get value(){
			return this._value;
		}

	    set charmap( characters ) {
	    	this._charsize = characters.length;
	        this._charmap = characters;
	    }
	    get charmap() {
	        return this._charmap;
	    }

	    get charmap_size(){
	    	return this._charsize;
	    }
		
	}

	/**
     * Primary out/inputs
     */
	_generator.primary_output 		= new Textarea( 'primary-output' ),
	_generator.secondary_output 	= new Textarea( 'secondary-output' ),
	_generator.total_length 		= new CountInput( 'total-length' );
	_generator.total_permutations 	= new Input( 'total-permutations' );

	_generator.shelves = [ 'shelf_lowercase', 'shelf_uppercase', 'shelf_numeric', 'shelf_symbol', 'shelf_mobiunicode', 'shelf_latinextended' ];

	// Components
	// Each component is a single unique shelf
	// combined they create a the character library from which chars are chosen at random to create a hash
	_generator[ _generator.shelves[0] ] = new BookShelf( 'lowercase', 'abcdefghijklmnopqrstuvwxyz' );
	_generator[ _generator.shelves[1] ] = new BookShelf( 'uppercase', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' );
	_generator[ _generator.shelves[2] ] = new BookShelf( 'numeric', '0123456789' );

	// Common non-numeric symbols {|}~¢£¥ !#$%&()*+,-./:;<=>?@€[\]^_`
	// Quotes '" are not included in this set but rather with the mobiunicode set
	// Does include currency symbols ¢£¥$€
	_generator[ _generator.shelves[3] ] = new BookShelf( 'symbol', 
		'\u007B\u007C\u007D\u007E\u00A2\u00A3\u00A5\u0020\u0021\u0023\u0024\u0025\u0026\u0028\u0029\u002A\u002B'
		+'\u002C\u002D\u002E\u002F\u003A\u003B\u003C\u003D\u003E\u003F\u0040\u20AC\u005B\u005C\u005D\u005E\u005F\u0060' );

	// characters readily found on a mobile keyboard ¡¦§©¬®¯°±²³¶¹¼½¾¿×÷–—•…‰ⁿ™⅓⅔⅛⅜⅝⅞≈≠
	_generator[ _generator.shelves[4] ] = new BookShelf( 'mobiunicode',
		'\'"' + '\u00A1\u00A6\u00A7\u00A9\u00AC\u00AE\u00AF\u00B0\u00B1\u00B2\u00B3\u00B6\u00B9\u00BC\u00BD\u00BE'
		+'\u00BF\u00D7\u00F7\u2013\u2014\u2022\u2026\u2030\u207F\u2122\u2153\u2154\u215B\u215C\u215D\u215E\u2248\u2260' );

	// Latin extended
	_generator[ _generator.shelves[5] ] = new BookShelf( 'latinextended',
		// ÀÁÂÃÄÅÆàáâãäåæĀāĂăĄą
		'\u00C0\u00C1\u00C2\u00C3\u00C4\u00C5\u00C6\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5\u00E6\u0100\u0101\u0102\u0103\u0104\u0105'
		// ÇçĆćĈĉĊċČč ðĎďĐđ
		+'\u00C7\u00E7\u0106\u0107\u0108\u0109\u010A\u010B\u010C\u010D'+'\u00F0\u010E\u010F\u0110\u0111'
		// ÈÉÊËèéêëĒēĔĕĖėĘęĚě
		+'\u00C8\u00C9\u00CA\u00CB\u00E8\u00E9\u00EA\u00EB\u0112\u0113\u0114\u0115\u0116\u0117\u0118\u0119\u011A\u011B'
		// ĜĝĞğĠġĢģ ĤĥĦħ
		+'\u011C\u011D\u011E\u011F\u0120\u0121\u0122\u0123'+'\u0124\u0125\u0126\u0127'
		// ÌÍÎÏìíîïĨĩĪīĬĭĮįİı
		+'\u00CC\u00CD\u00CE\u00CF\u00EC\u00ED\u00EE\u00EF\u0128\u0129\u012A\u012B\u012C\u012D\u012E\u012F\u0130\u0131'
		// ĴĵĶķĸ ĹĺĻļĽľĿŀŁł
		+'\u0134\u0135\u0136\u0137\u0138'+'\u0139\u013A\u013B\u013C\u013D\u013E\u013F\u0140\u0141\u0142'
		// ÑñŃńŅņŇňŉŊŋ
		+'\u00D1\u00F1\u0143\u0144\u0145\u0146\u0147\u0148\u0149\u014A\u014B'
		// ÒÓÔÕÖØòóôõöøŌōŎŏŐő
		+'\u00D2\u00D3\u00D4\u00D5\u00D6\u00D8\u00F2\u00F3\u00F4\u00F5\u00F6\u00F8\u014C\u014D\u014E\u014F\u0150\u0151'
		// ŔŕŖŗŘř ßŚśŜŝŞşŠš
		+'\u0154\u0155\u0156\u0157\u0158\u0159'+'\u00DF\u015A\u015B\u015C\u015D\u015E\u015F\u0160\u0161'
		// ŢţŤťŦŧ
		+'\u0162\u0163\u0164\u0165\u0166\u0167'
		// ÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲų
		+'\u00D9\u00DA\u00DB\u00DC\u00F9\u00FA\u00FB\u00FC\u0168\u0169\u016A\u016B\u016C\u016D\u016E\u016F\u0170\u0171\u0172\u0173'
		// ÝýÿŶŷŸ ŹźŻżŽž
		+'\u00DD\u00FD\u00FF\u0176\u0177\u0178'+'\u0179\u017A\u017B\u017C\u017D\u017E'
		);

	_generator.machine = function(){
		let library = '',
			total_length = 0,
			permutations = 0;

		for( let g = 0, l = _generator.shelves.length; g < l; g++ ){
			let genObj = _generator[ _generator.shelves[ g ] ];

			permutations += genObj.permutations;

			genObj.out.value = genObj.sorted_value();
			library = shuffle( library + genObj.value);

			if( genObj.cbx.value )
				total_length += parseInt ( genObj.min.value );
		}

		_generator.total_length.value = total_length;
	 	_generator.primary_output.value = library;
	 	_generator.total_permutations.value = thousands( permutations );

	 	// also update mobi output
		_generator.secondary_output.value = library;

	};

	$( _generator.primary_output.el ).on( 'shelf_shuffle', function(){
		_generator.machine();
	});

	$(function() {
	   _generator.machine();
	});

})(jQuery);
