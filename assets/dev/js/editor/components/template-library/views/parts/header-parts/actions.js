module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-actions',

	id: 'elementor-template-library-header-actions',

	ui: {
		'import': '#elementor-template-library-header-import',
		sync: '#elementor-template-library-header-sync',
		syncIcon: '#elementor-template-library-header-sync i',
		save: '#elementor-template-library-header-save'
	},

	events: {
		'click @ui.import': 'onImportClick',
		'click @ui.sync': 'onSyncClick',
		'click @ui.save': 'onSaveClick'
	},

	onImportClick: function() {
		elementor.templates.getLayout().showImportView();
	},

	onSyncClick: function() {
		var self = this;

		self.ui.syncIcon.addClass( 'eicon-animation-spin' );

		elementor.templates.requestLibraryData( function() {
			self.ui.syncIcon.removeClass( 'eicon-animation-spin' );

			elementor.templates.showTemplates();
		}, true, true );
	},

	onSaveClick: function() {
		elementor.templates.getLayout().showSaveTemplateView();
	}
} );
