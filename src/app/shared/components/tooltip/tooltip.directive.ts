import { ComponentRef, Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { AMSTooltipComponent } from './tooltip.component';

@Directive({ selector: '[asmTooltip]' })
export class TooltipDirective implements OnInit {

  @Input('asmTooltip') bctData: any;
  private overlayRef!: OverlayRef;

  constructor(private overlay: Overlay,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      }]);

    this.overlayRef = this.overlay.create({ positionStrategy });
  }

  @HostListener('mouseenter')
  show() {
    const tooltipRef: ComponentRef<AMSTooltipComponent>
      = this.overlayRef.attach(new ComponentPortal(AMSTooltipComponent));
    tooltipRef.instance.bctData = this.bctData;
  }

  @HostListener('mouseout')
  hide() {
    this.overlayRef.detach();
  }
}
