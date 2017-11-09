var TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' ),
	TemplateLibraryTemplateRemoteView = require( 'elementor-templates/views/template/remote' ),
	TemplateLibraryTemplatesEmptyView = require( 'elementor-templates/views/parts/templates-empty' ),
	TemplateLibraryCollectionView;

TemplateLibraryCollectionView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-template-library-templates',

	id: 'elementor-template-library-templates',

	childViewContainer: '#elementor-template-library-templates-container',

	reorderOnSort: true,

	emptyView: TemplateLibraryTemplatesEmptyView,

	ui: {
		filterText: '#elementor-template-library-filter-text',
		myFavoritesFilter: '#elementor-template-library-filter-my-favorites',
		orderInputs: '.elementor-template-library-order-input',
		orderLabels: '.elementor-template-library-order-label'
	},

	events: {
		'input @ui.filterText': 'onFilterTextInput',
		'change @ui.myFavoritesFilter': 'onMyFavoritesFilterChange',
		'mousedown @ui.orderLabels': 'onOrderLabelsClick'
	},

	comparators: {
		title: function( model ) {
			return model.get( 'title' ).toLowerCase();
		}
	},

	getChildView: function( childModel ) {
		if ( 'remote' === childModel.get( 'source' ) ) {
			return TemplateLibraryTemplateRemoteView;
		}

		return TemplateLibraryTemplateLocalView;
	},

	initialize: function() {
		this.listenTo( elementor.channels.templates, 'filter:change', this._renderChildren );
	},

	filterByText: function( model, text ) {
		text = text.toLowerCase();

		if ( model.get( 'title' ).toLowerCase().indexOf( text ) >= 0 ) {
			return true;
		}

		return _.any( model.get( 'tags' ), function( tag ) {
			return tag.toLowerCase().indexOf( text ) >= 0;
		} );
	},

	filterBySource: function( model, source ) {
		return source === model.get( 'source' );
	},

	filterByType: function( model ) {
		var typeInfo = elementor.templates.getTemplateTypes( model.get( 'type' ) );

		return ! typeInfo || false !== typeInfo.showInLibrary;
	},

	filterByFavorite: function( model ) {
		return model.get( 'favorite' );
	},

	filter: function( childModel ) {
		var textFilter = elementor.channels.templates.request( 'filter:text' ),
			sourceFilter = elementor.channels.templates.request( 'filter:source' ),
			favoriteFilter = elementor.channels.templates.request( 'filter:favorite' );

		return ( ! textFilter || this.filterByText( childModel, textFilter ) ) &&
			   ( ! sourceFilter || this.filterBySource( childModel, sourceFilter ) ) &&
			   ( ! favoriteFilter || 'remote' !== sourceFilter || this.filterByFavorite( childModel ) ) &&
			   this.filterByType( childModel );
	},

	order: function( by, reverseOrder ) {
		var comparator = this.comparators[ by ] || by;

		if ( reverseOrder ) {
			comparator = this.reverseOrder( comparator );
		}

		this.collection.comparator = comparator;

		this.collection.sort();
	},

	activateOrdering: function( by, reverseOrder ) {
		var $orderInput = this.ui.orderInputs.filter( '[value="' + by + '"]' );

		reverseOrder = !! reverseOrder;

		$orderInput
			.attr( 'checked', true )
			.toggleClass( 'elementor-template-library-order-reverse', reverseOrder );

		this.order( by, reverseOrder );
	},

	reverseOrder: function( comparator ) {
		if ( 'function' !== typeof comparator ) {
			var comparatorValue = comparator;

			comparator = function( model ) {
				return model.get( comparatorValue );
			};
		}

		return function( left, right ) {
			var l = comparator( left ),
				r = comparator( right );

			if ( undefined === l ) {
				return -1;
			}

			if ( undefined === r ) {
				return 1;
			}

			return l < r ? 1 : l > r ? -1 : 0;
		};
	},

	onRender: function() {
		_.defer( this.activateOrdering.bind( this, 'date', true ) );
	},

	onRenderCollection: function() {
		var isEmpty = this.children.isEmpty();

		this.$el.attr( 'data-template-source', isEmpty ? 'empty' : elementor.channels.templates.request( 'filter:source' ) );
	},

	onFilterTextInput: function() {
		elementor.channels.templates
			.reply( 'filter:text', this.ui.filterText.val() )
			.trigger( 'filter:change' );
	},

	onMyFavoritesFilterChange: function(  ) {
		elementor.channels.templates
			.reply( 'filter:favorite', this.ui.myFavoritesFilter[0].checked )
			.trigger( 'filter:change' );
	},

	onOrderLabelsClick: function( event ) {
		var $clickedInput = jQuery( event.currentTarget.control );

		if ( ! $clickedInput[0].checked ) {
			$clickedInput.removeClass( 'elementor-template-library-order-reverse' );
		} else {
			$clickedInput.toggleClass( 'elementor-template-library-order-reverse' );
		}

		this.order( $clickedInput.val(), $clickedInput.hasClass( 'elementor-template-library-order-reverse' ) );
	}
} );

module.exports = TemplateLibraryCollectionView;
