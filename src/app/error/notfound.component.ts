/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { AfterViewInit, Component, ElementRef, Renderer, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { PagevarsService } from '../services/pagevars.service';

declare var TweenMax: any;
declare var Snap: any;
declare var Quad: any;

@Component({
	selector: 'sb-error-404',
	templateUrl: '404.html',
	styleUrls: [
		'404.css'
	]
})
export class NotFoundComponent implements AfterViewInit
{
	private clawTweenTime: number = 1;
	private rightClawRepeatDelay: number = 1;
	private leftClawRepeatDelay: number = 1.7;

	private bodySwayTime: number = 1;
	private bodySwayAmount: number = 5;

	private blinkRepeatTime: number = 2.2;
	private eyesMoveRepeatTime: number = .9;

	private bodyTo: string = "50px 92px";
	private eyesY: number = -2;

	constructor(
		private elementRef: ElementRef,
		private pagevarsService: PagevarsService,
		private renderer: Renderer,
		private title: Title
	)
	{
		pagevarsService.setPageTitle( "Not Found" );
		title.setTitle( "404 - Stahpbot ");
	}

	ngAfterViewInit( )
	{
		this.preAnimateBot( false );
	}

	preAnimateBot( loading: boolean )
	{
		if ( loading && ( typeof TweenMax == "undefined" || typeof Snap == "undefined" ) )
			return;

		if ( !loading )
			return this.loadDeps( );

		this.animateBot( );
	}

	loadDeps( )
	{
		if ( typeof document == "undefined" )
			return;

		let snap_script = this.renderer.createElement( this.elementRef.nativeElement, 'script' );
		snap_script.type = 'text/javascript';
		snap_script.onload = ( ) => this.preAnimateBot( true );
		snap_script.src = "https://cdnjs.cloudflare.com/ajax/libs/snap.svg/0.4.1/snap.svg-min.js";

		let tween_script = this.renderer.createElement( this.elementRef.nativeElement, 'script' );
		tween_script.type = 'text/javascript';
		tween_script.onload = ( ) => this.preAnimateBot( true );
		tween_script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/TweenMax.min.js";
	}

	animateBot( )
	{
		let f = Snap( '#brokebotSVG' );

		let rightInnerClaw = f.select( '#rightInnerClaw' ),
			rightOuterClaw = f.select( '#rightOuterClaw' ),
			leftInnerClaw = f.select( '#leftInnerClaw' ),
			leftOuterClaw = f.select( '#leftOuterClaw' ),
			upperBody = f.select( '#upperBody' ),
			eyesMove = f.select( '#eyesMove' ),
			eyesBlink = f.select( '#eyesBlink' ),
			leftArm = f.select( '#leftArm' ),
			rightLowerArm = f.select( '#rightLowerArm' ),
			robotHead = f.select( '#robotHead' ),
			errorCodeTxt = f.select( '#errorCodeTxt' );

	 	setTimeout( function( )
	 	{
			TweenMax.from( rightInnerClaw.node, this.clawTweenTime, {
				rotation: 45,
				transformOrigin: "11px 15px",
				repeat: -1,
				repeatDelay: this.rightClawRepeatDelay
			});

			TweenMax.from( rightOuterClaw.node, this.clawTweenTime, {
				rotation: -45,
				transformOrigin: "15px 15px",
				repeat: -1,
				repeatDelay: this.rightClawRepeatDelay
			});
		}.bind( this ), this.rightClawRepeatDelay * 1000 );

		setTimeout( function( )
		{
			TweenMax.from( leftInnerClaw.node, this.clawTweenTime, {
				rotation: -45,
				transformOrigin: "15px 15px",
				repeat: -1,
				repeatDelay: this.leftClawRepeatDelay
			});

			TweenMax.from( leftOuterClaw.node, this.clawTweenTime, {
				rotation: 45,
				transformOrigin: "11px 15px",
				repeat: -1,
				repeatDelay: this.leftClawRepeatDelay
			});
		}.bind( this ), this.leftClawRepeatDelay * 1000 );

	 	TweenMax.from( errorCodeTxt.node, 2, { opacity: 0 } );

	 	TweenMax.to( upperBody.node, this.bodySwayTime, {
	 		rotationZ: -this.bodySwayAmount, transformOrigin: this.bodyTo, yoyo: true, repeat: -1, ease: Quad.easeInOut
	 	});
	 	TweenMax.to( leftArm.node, this.bodySwayTime, {
	 		delay: .3, rotationZ: this.bodySwayAmount, transformOrigin: "15px -11px", yoyo: true, repeat: -1, ease: Quad.easeInOut
	 	});
	 	TweenMax.to( rightLowerArm.node, this.bodySwayTime, {
	 		delay: .5, rotationZ: this.bodySwayAmount, transformOrigin: "15px 0px", yoyo: true, repeat: -1, ease: Quad.easeInOut
	 	});

		TweenMax.to( eyesMove.node, .05, {
			delay: this.eyesMoveRepeatTime, x: -2, y: this.eyesY, repeatDelay: this.eyesMoveRepeatTime, repeat: -1, yoyo: true
		});

	 	TweenMax.from( eyesBlink.node, .3, {
	 		scaleY: .2, repeatDelay: this.blinkRepeatTime, repeat: -1, transformOrigin: "0px 6px"
	 	});
	}
}