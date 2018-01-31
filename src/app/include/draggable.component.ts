/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Directive, ElementRef, EventEmitter, Input, Output, Renderer, OnDestroy, OnInit } from '@angular/core';

@Directive({
	selector: '[draggable]',
	host: {
		'(dragstart)': 'onDragStart($event)',
		'(dragend)': 'onDragEnd($event)',
		'(drag)': 'onDrag($event)'
	}
})
export class DraggableComponent implements OnDestroy, OnInit
{
	@Input( 'drag-enabled' ) enabled: boolean = true;

	@Output( 'onDragEnd' )
	dragEnd = new EventEmitter( false );

	private Δx: number = 0;
	private Δy: number = 0;
	private mustBePosition: Array<string> = ['absolute', 'fixed', 'relative'];

	private width: number = 0;
	private height: number = 0;

	private parent_width: number = 0;
	private parent_height: number = 0;

	constructor( private el: ElementRef, private renderer: Renderer ) { }

	ngOnInit( ): void
	{
		this.renderer.setElementAttribute( this.el.nativeElement, 'draggable', 'true' );
	}

	onDragStart( event: DragEvent )
	{
		if ( !this.enabled )
			return;

		event.dataTransfer['setDragImage']( event.target, -99999, -99999 );

		this.Δx = event.x - this.el.nativeElement.offsetLeft;
		this.Δy = event.y - this.el.nativeElement.offsetTop;

		this.width = this.el.nativeElement.clientWidth;
		this.height = this.el.nativeElement.clientHeight;

		this.parent_width = this.el.nativeElement.parentNode.clientWidth;
		this.parent_height = this.el.nativeElement.parentNode.clientHeight;
	}

	onDrag( event: DragEvent )
	{
		if ( !this.enabled )
			return;

		this.doTranslation( event.x, event.y );
	}

	onDragEnd( event: DragEvent )
	{
		if ( !this.enabled )
			return;

		this.Δx = 0;
		this.Δy = 0;

		var left = parseInt( this.el.nativeElement.style.left.replace( 'px', '' ) ),
			top = parseInt( this.el.nativeElement.style.top.replace( 'px', '' ) );

		this.dragEnd.emit( { left: left, top: top } );
	}

	doTranslation( x: number, y: number )
	{
		if ( !x || !y )
			return;

		let out_y = Math.max( 0, Math.min( y - this.Δy, this.parent_height - this.height ) ),
			out_x = Math.max( 0, Math.min( x - this.Δx, this.parent_width - this.width ) );
		
		this.renderer.setElementStyle( this.el.nativeElement, 'top', out_y + 'px' );
		this.renderer.setElementStyle( this.el.nativeElement, 'left', out_x + 'px' );
	}

	public ngOnDestroy( ): void
	{
		this.renderer.setElementAttribute( this.el.nativeElement, 'draggable', 'false' );
	}
}