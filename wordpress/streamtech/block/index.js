( function ( blocks, element, components, blockEditor, i18n ) {
	'use strict';

	var el          = element.createElement;
	var __          = i18n.__;
	var TextControl = components.TextControl;
	var ToggleControl = components.ToggleControl;
	var PanelBody   = components.PanelBody;
	var Placeholder = components.Placeholder;
	var InspectorControls = blockEditor.InspectorControls;

	blocks.registerBlockType( 'streamtech/video-player', {
		edit: function ( props ) {
			var attrs   = props.attributes;
			var setAttr = props.setAttributes;

			var sidebar = el(
				InspectorControls,
				null,
				el(
					PanelBody,
					{ title: __( 'Player Settings', 'streamtech' ), initialOpen: true },
					el( TextControl, {
						label: __( 'Width', 'streamtech' ),
						value: attrs.width,
						onChange: function ( v ) { setAttr( { width: v } ); },
						help: __( 'CSS value, e.g. 100%, 800px', 'streamtech' ),
					} ),
					el( ToggleControl, {
						label: __( 'Autoplay', 'streamtech' ),
						checked: attrs.autoplay,
						onChange: function ( v ) { setAttr( { autoplay: v } ); },
					} ),
					el( ToggleControl, {
						label: __( 'Muted', 'streamtech' ),
						checked: attrs.muted,
						onChange: function ( v ) { setAttr( { muted: v } ); },
					} ),
					el( ToggleControl, {
						label: __( 'Show Controls', 'streamtech' ),
						checked: attrs.controls,
						onChange: function ( v ) { setAttr( { controls: v } ); },
					} )
				)
			);

			var content;
			if ( attrs.assetId ) {
				content = el(
					'div',
					{ className: 'streamtech-block-preview' },
					el( 'div', { className: 'streamtech-block-preview__icon' },
						el( 'span', { className: 'dashicons dashicons-video-alt3' } )
					),
					el( 'div', { className: 'streamtech-block-preview__info' },
						el( 'strong', null, __( 'StreamTech Player', 'streamtech' ) ),
						el( 'br' ),
						el( 'code', null, attrs.assetId )
					),
					el( TextControl, {
						label: __( 'Asset ID', 'streamtech' ),
						value: attrs.assetId,
						onChange: function ( v ) { setAttr( { assetId: v } ); },
					} )
				);
			} else {
				content = el(
					Placeholder,
					{
						icon: 'video-alt3',
						label: __( 'StreamTech Player', 'streamtech' ),
						instructions: __( 'Enter the StreamTech asset ID to embed a video.', 'streamtech' ),
					},
					el( TextControl, {
						label: __( 'Asset ID', 'streamtech' ),
						value: attrs.assetId,
						onChange: function ( v ) { setAttr( { assetId: v } ); },
						placeholder: 'e.g. a1b2c3d4-...',
					} )
				);
			}

			return el( element.Fragment, null, sidebar, content );
		},

		save: function () {
			return null; // server-side rendered
		},
	} );
} )(
	window.wp.blocks,
	window.wp.element,
	window.wp.components,
	window.wp.blockEditor,
	window.wp.i18n
);
