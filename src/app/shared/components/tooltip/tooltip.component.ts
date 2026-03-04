import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'nxasm-tooltip',
  styleUrls: ['./tooltip.component.scss'],
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class AMSTooltipComponent implements OnInit {

  @Input() bctData:any;

  keyObject: any;

  ngOnInit(): void {
    this.keyObject = Object.keys(this.bctData);
      // console.log('calender key.....' ,Object.keys(this.bctData));
      // console.log('calender value.....' ,Object.values(this.bctData));
      // this.getKeyData('title');
  }

  getKeyData(d: string) {
    //Object.values(this.bctData[d])
    return this.bctData[d];
  }

}
