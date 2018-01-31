/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { environment } from '../../environments/environment';

import { AfterContentChecked, OnChanges, Component, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { ContextMenuComponent, ContextMenuService } from 'angular2-contextmenu';
import { Modal } from 'ngx-modal';

import { AlertsService } from '../services/alerts.service';
import { TranslateService } from '../services/translate.service';

import { Alert } from '../models/alert';

@Component({
	selector: 'alert-form',
	templateUrl: 'alertform.html',
	styleUrls: [
		'alertform.css',
		// 'animated.css'
	],
	encapsulation: ViewEncapsulation.None
})
export class AlertFormComponent implements AfterContentChecked, OnChanges, OnInit
{
	@Input( )
	public alert: Alert;

	@ViewChild( 'addTextModal' )
	public addTextModal: Modal;

	public cdn_url: string = environment.cdn_url;

	public max_width: number = 870;
	public max_height: number = 600;
	private offset: number = 0;
	private z_index: number = 1;

	public textData: any = { text: '', effect: 'none', size: 24, font: 'Oswald', align: 'left', colour: '#000000' };
	public editing: number = null;

	public image_items: any = [ ];
	public text_items: any = [ ];

	public validImages: RegExp = /^(.*?)\.(png|jpe?g|gif|bmp)$/;
	public validFonts: string[] = [ 'Oswald', 'Roboto Slab', 'Josefin Slab', 'Bevan', 'Kreon', 'Ubuntu' ];
	public validTypes: string[] = [ 'subscriber', 'sub_share', 'donation', 'donation_top_month', 'donation_top_day', 'follower', /*'hosted',*/ 'bits' ];
	public validEffectIn: string[] = [
		'none',
		'fadeIn',
		'slideInUp',
		'slideInDown',
		'slideInLeft',
		'slideInRight'
	];
	public validEffectOut: string[] = [
		'none',
		'fadeOut',
		'slideOutUp',
		'slideOutDown',
		'slideOutLeft',
		'slideOutRight'
	];
	public validTextEffects: string[] = [
		'none',
		'bounce',
		'pulse',
		'shake',
		'swing',
		'tada',
		'wobble',
		'rubberBand',
		'jello'
	];

	public shortcuts: any = {
		'follower': [ '{name}' ],
		'subscriber': [ '{name}' ],
		'sub_share': [ '{name}', '{months}', '{message}' ],
		'donation': [ '{name}', '{amount}', '{message}' ],
		'donation_top_month': [ '{name}', '{amount}', '{message}' ],
		'donation_top_day': [ '{name}', '{amount}', '{message}' ],
		'hosted': [ '{channel}', '{viewers}' ],
		'bits': [ '{name}', '{amount}' ]
	};

	public styles: any = { };

	public translate = {
		'subscriber': 'New Subscriber',
		'sub_share': 'Subscriber',
		'donation': 'Donation',
		'donation_top_month': 'Donation (Monthly Top)',
		'donation_top_day': 'Donation (Daily Top)',
		'follower': 'Follower',
		'hosted': 'Being Hosted',
		'bits': 'Bits Donation',
		
		'none': 'None',
		'fadeIn': 'Fade In',
		'slideInUp': 'Slide Up',
		'slideInDown': 'Slide Down',
		'slideInLeft': 'Slide Left',
		'slideInRight': 'Slide Right',
		'bounceInUp': 'Bounce Up',
		'bounceInDown': 'Bounce Down',
		'bounceInLeft': 'Bounce Left',
		'bounceInRight': 'Bounce Right',

		'fadeOut': 'Fade Out',
		'slideOutUp': 'Slide Up',
		'slideOutDown': 'Slide Down',
		'slideOutLeft': 'Slide Left',
		'slideOutRight': 'Slide Right',
		'bounceOutUp': 'Bounce Up',
		'bounceOutDown': 'Bounce Down',
		'bounceOutLeft': 'Bounce Left',
		'bounceOutRight': 'Bounce Right',

		'bounce': 'Bounce',
		'pulse': 'Pulse',
		'shake': 'Shake',
		'swing': 'Swing',
		'tada': 'Tada',
		'wobble': 'Wobble',
		'rubberBand': 'Rubber Band',
		'jello': 'Jello',

		'{name}': 'Name',
		'{amount}': 'Amount',
		'{message}': 'User Message',
		'{months}': 'Months',
		'{channel}': 'Channel Name',
		'{viewers}': 'Viewers',
	};

	public unique_id: number = 0;

	constructor(
		private alertsService: AlertsService,
		private contextMenuService: ContextMenuService,
		private domSanitizer: DomSanitizer,
		private translateService: TranslateService
	)
	{
		for ( let font of this.validFonts )
			this.styles[font] = domSanitizer.bypassSecurityTrustStyle( 'font-family: "' + font + '";' );
	}

	ngOnInit( )
	{
		let css = document.createElement( "link" );
		css.rel = "stylesheet";
		css.href = "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css";
		document.head.appendChild( css );
	}

	ngAfterContentChecked( )
	{
		this.unique_id++;
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['alert'] )
		{
			this.unique_id++;
			this.offset = 0;
			this.z_index = 1;

			if ( this.alert && this.alert.items && this.alert.items.length == 0 )
			{
				this.image_items = [ ];
				this.text_items = [ ];
			}
			else
			{
				this.image_items = this.getItems( 'image' );
				this.text_items = this.getItems( 'text' );
			}
		}
	}

	addSound( event: any )
	{
		let file = event.srcElement.files ? event.srcElement.files[0] : null;

		if ( !file )
			return;

		this.alert.new_sound = file;
	}

	addImage( event: any )
	{
		let file = event.srcElement.files ? event.srcElement.files[0] : null;

		if ( !file )
			return;

		if ( !file.name.match( this.validImages ) )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Invalid image selected'
			});
			return;
		}

		let url = window.URL.createObjectURL( file );

		this.getImageSize( url, ( width: number, height: number ) => {
			if ( width > this.max_width )
			{
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Selected image is larger than the alert width, increase the width before adding this image.'
				});
				return;
			}

			if ( height > this.max_height )
			{
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Selected image is larger than the alert height, increase the height before adding this image.'
				});
				return;
			}

			if ( width > this.alert.width )
				this.alert.width = width;

			if ( height > this.alert.height )
				this.alert.height = height;

			let out = {
				id: ( this.alert.items.length + this.offset ),
				type: 'image',
				top: 0,
				left: 0,
				z_index: this.z_index,
				src: this.domSanitizer.bypassSecurityTrustUrl( url ),
				style: this.domSanitizer.bypassSecurityTrustStyle(`
					left: 0px;
					top: 0px;
					z-index: ${ this.z_index };
				`),
				new: true
			};

			this.offset++;
			this.z_index++;
			this.image_items.push( out );
			this.alert.item_files[out.id] = file;

			this.unique_id++;
		});
	}

	validateText( )
	{
		if ( !this.textData.text )
			return false;

		if	(
				!this.textData.colour.match( /^#[0-9a-f]{6}$/i ) ||
				!parseInt( this.textData.size ) ||
				this.validFonts.indexOf( this.textData.font ) < 0 ||
				[ 'left', 'center', 'right' ].indexOf( this.textData.align ) < 0 ||
				( this.textData.width && this.textData.width.length > 0 && !parseInt( this.textData.width ) ) ||
				( this.textData.height && this.textData.height.length > 0 && !parseInt( this.textData.height ) ) ||
				( this.textData.max_width && this.textData.max_width.length > 0 && !parseInt( this.textData.max_width ) ) ||
				( this.textData.max_height && this.textData.max_height.length > 0 && !parseInt( this.textData.max_height ) )
			)
		{
			return false;
		}

		return true;
	}

	addText( left?: number, top?: number )
	{
		if ( !this.validateText( ) )
			return;

		let width = parseInt( this.textData.width ) || false,
			height = parseInt( this.textData.height ) || false,
			max_width = parseInt( this.textData.max_width ) || false,
			max_height = parseInt( this.textData.max_height ) || false;

		if ( width > this.max_width )
			width = this.max_width;

		if ( height > this.max_height )
			height = this.max_height;

		if ( max_width > this.max_width )
			max_width = this.max_width;

		if ( max_height > this.max_height )
			max_height = this.max_height;

		let out = {
			id: ( this.alert.items.length + this.offset ),
			type: 'text',
			text: this.textData.text,
			top: top || 0,
			left: left || 0,
			z_index: this.z_index,
			data: {
				colour: this.textData.colour,
				font: this.textData.font,
				effect: this.textData.effect,
				size: this.textData.size,
				width: width || 'auto',
				height: height || 'auto',
				max_width: max_width || 'none',
				max_height: max_height || 'none',
				align: this.textData.align
			},
			style: this.domSanitizer.bypassSecurityTrustStyle(`
				color: ${ this.textData.colour };
				font-family: "${ this.textData.font }";
				font-size: ${ this.textData.size }px;
				height: ${ height || 'auto' };
				max-width: ${ max_width || 'none' };
				max-height: ${ max_height || 'none' };
				text-align: ${ this.textData.align || 'left' };
				width: ${ width || 'auto' };
			`)
		};

		this.offset++;
		this.z_index++;
		this.text_items.push( out );

		this.addTextModal.close( );

		this.updateItemStyle( out );
	}

	editText( )
	{
		if ( null == this.editing )
			return;

		if ( !this.validateText( ) )
			return;

		let this_item = null;

		for ( let idx in this.text_items )
		{
			if ( this.text_items[idx].id == this.editing )
			{
				this_item = this.text_items[idx];
				break;
			}
		}

		if ( !this_item )
			return;

		let width = parseInt( this.textData.width ) || false,
			height = parseInt( this.textData.height ) || false,
			max_width = parseInt( this.textData.max_width ) || false,
			max_height = parseInt( this.textData.max_height ) || false;

		if ( width > this.max_width )
			width = this.max_width;

		if ( height > this.max_height )
			height = this.max_height;

		if ( max_width > this.max_width )
			max_width = this.max_width;

		if ( max_height > this.max_height )
			max_height = this.max_height;

		this_item.text = this.textData.text;
		this_item.data = {
			colour: this.textData.colour,
			font: this.textData.font,
			effect: this.textData.effect,
			size: this.textData.size,
			width: width || 'auto',
			height: height || 'auto',
			max_width: max_width || 'none',
			max_height: max_height || 'none',
			align: this.textData.align
		};
		this.updateItemStyle( this_item );
		this.addTextModal.close( );
	}

	insertText( shortcut: string )
	{
		if ( !this.textData['text'] )
			this.textData['text'] = "";

		this.textData['text'] += shortcut;
	}

	clearVars( )
	{
		this.textData = { text: '', effect: 'none', size: 24, font: 'Oswald', align: 'left', colour: '#000000' };
		this.editing = null;
	}

	// @Output( )
	public makeItems( )
	{
		let out = this.image_items.concat( this.text_items );

		for ( let idx in out )
		{
			if ( out[idx].src )
				delete out[idx].src;
			if ( out[idx].style )
				delete out[idx].style;
		}

		this.unique_id++;

		return out;
	}

	getItems( type: string )
	{
		if ( !this.alert || !this.alert.items )
			return [ ];

		let out: any[] = [ ];

		this.alert.items.forEach( ( item, index ) =>
		{
			if ( item.type != type )
				return;

			let out_item = {
				id: index,
				type: item.type,
				top: item.top,
				left: item.left,
				z_index: item.z_index
			};

			if ( item.z_index > this.z_index )
				this.z_index = ( item.z_index + 1 );

			let style = `
				left: ${ item.left }px;
				top: ${ item.top }px;
				z-index: ${ item.z_index };
			`;

			if ( type == 'image' )
			{
				let url = this.cdn_url + 'alerts/images/' + item.image_url;
				out_item['src'] = this.domSanitizer.bypassSecurityTrustUrl( url );
				out_item['image_url'] = item.image_url;
			}
			
			if ( type == 'text' )
			{
				if ( !item.data.height )
					item.data['height'] = 'auto';

				let mw = item.data.max_width || item.data.maxwidth,
					mh = item.data.max_height || item.data.maxheight;

				item.data['max_width'] = mw;
				item.data['max_height'] = mh;

				out_item['data'] = item.data;
				out_item['text'] = item.text || item.data.text;

				let width = parseInt( item.data.width ) ? item.data.width + 'px' : item.data.width,
					height = parseInt( item.data.height ) ? item.data.height + 'px' : item.data.height,
					max_width = parseInt( mw ) ? mw + 'px' : mw,
					max_height = parseInt( mh ) ? mh + 'px' : mh;

				style += `
					color: ${ item.data.colour };
					font-family: "${ item.data.font }";
					font-size: ${ item.data.size }px;
					height: ${ height || 'auto' };
					max-width: ${ max_width || 'none' };
					max-height: ${ max_height || 'none' };
					text-align: ${ item.data.align };
					width: ${ width || 'auto' };
				`;
			}

			out_item['style'] = this.domSanitizer.bypassSecurityTrustStyle( style );

			out.push( out_item );
		});

		return out;
	}

	// Utility

	getItemById( id: number, type?: string )
	{
		if ( !type || type == 'image' )
		{
			for ( let item of this.image_items )
			{
				if ( item.id == id )
					return item;
			}
		}

		if ( !type || type == 'text' )
		{
			for ( let item of this.text_items )
			{
				if ( item.id == id )
					return item;
			}
		}

		return false;
	}

	getImageSize( url: string, callback: any )
	{
		let img = new Image( );
		img.onload = function( ) { callback( img.width, img.height ); }
		img.src = url;
	}

	setWidth( width: number )
	{
		if ( width > this.max_width )
		{
			this.alert.width = this.max_width;
			return;
		}

		this.alert.width = width;
	}

	setHeight( height: number )
	{
		if ( height > this.max_height )
		{
			this.alert.height = this.max_height;
			return;
		}

		this.alert.height = height;
	}

	getHelpText( setting: string )
	{
		return this.translateService.instant( 'help.' + setting );
	}

	updateItemStyle( item: any )
	{
		let style = `
			left: ${ item.left }px;
			top: ${ item.top }px;
			z-index: ${ item.z_index };
		`;

		if ( item.type == 'text' )
		{
			let width = parseInt( item.data.width ) ? item.data.width + 'px' : item.data.width,
				height = parseInt( item.data.height ) ? item.data.height + 'px' : item.data.height,
				max_width = parseInt( item.data.max_width ) ? item.data.max_width + 'px' : item.data.max_width,
				max_height = parseInt( item.data.max_height ) ? item.data.max_height + 'px' : item.data.max_height;

			style += `
				color: ${ item.data.colour };
				font-family: "${ item.data.font }";
				font-size: ${ item.data.size }px;
				height: ${ height || 'auto' };
				max-width: ${ max_width || 'none' };
				max-height: ${ max_height || 'none' };
				text-align: ${ item.data.align };
				width: ${ width || 'auto' };
			`;
		}

		item['style'] = this.domSanitizer.bypassSecurityTrustStyle( style );
	}

	onDragEnd( item: any, value: any )
	{
		item.left = value.left;
		item.top = value.top;
	}

	// Context Menu

	private currContext: any;

	@ViewChild(ContextMenuComponent)
	public menu: ContextMenuComponent;

	@HostListener( 'click', [ '$event' ] )
	public onClickOut( $event: any )
	{
		if ( !this.menu.isShown )
			return;
		
		this.currContext = null;
	}

	onContextMenu( $event: MouseEvent, item: any )
	{
		$event.preventDefault();
		$event.stopPropagation();

		this.currContext = $event.target;

		this.contextMenuService.show.next({
			event: $event,
			item: item,
		});
		setTimeout( ( ) => {
			let top = this.menu.menuElement.nativeElement.style.top;
			this.menu.menuElement.nativeElement.style.top = ( parseInt( top ) - 320 ) + "px";
		}, 10 );
	}

	ctxToggleLock( item: any )
	{
		item.locked = !item.locked;
	}

	ctxSendBack( item: any )
	{
		item.z_index = 1;
		this.updateItemStyle( item );

		for( let i of this.image_items )
		{
			i.z_index++;

			if ( i.z_index > this.z_index )
				this.z_index = ( i.z_index + 1 );

			this.updateItemStyle( i );
		}

		for( let i of this.text_items )
		{
			i.z_index++;

			if ( i.z_index > this.z_index )
				this.z_index = ( i.z_index + 1 );

			this.updateItemStyle( i );
		}
	}

	ctxSendFront( item: any )
	{
		item.z_index = this.z_index;
		this.z_index++;

		this.updateItemStyle( item );
	}

	ctxResizeAlert( item: any )
	{
		if ( !this.currContext )
			return;

		let width = this.currContext.clientWidth,
			height = this.currContext.clientHeight;

		this.alert.width = width;
		this.alert.height = height;
	}

	ctxHorizCenter( item: any )
	{
		if ( !this.currContext )
			return;

		let width = this.currContext.clientWidth;
		item.left = ( ( this.alert.width / 2 ) - ( width / 2 ) );

		this.updateItemStyle( item );
	}

	ctxVertCenter( item: any )
	{
		if ( !this.currContext )
			return;

		let height = this.currContext.clientHeight;
		item.top = ( ( this.alert.height / 2 ) - ( height / 2 ) );
		
		this.updateItemStyle( item );
	}

	ctxEdit( item: any )
	{
		if ( item.type == 'image' )
			return;

		this.textData = {
			text: item.text,
			size: item.data.size,
			align: item.data.align,
			effect: item.data.effect,
			font: item.data.font,
			colour: item.data.colour,
			width: parseInt( item.data.width ) || '',
			height: parseInt( item.data.height ) || '',
			max_width: parseInt( item.data.max_width || item.data.maxwidth ) || '',
			max_height: parseInt( item.data.max_height || item.data.maxheight ) || ''
		};

		this.editing = item.id;
		this.addTextModal.open( );
	}

	ctxDelete( item: any )
	{
		let list = ( item.type == 'image' ? this.image_items : this.text_items );

		for ( let i in list )
		{
			if ( list[i].id == item.id )
			{
				list.splice( i, 1 );
				break;
			}
		}
	}
}