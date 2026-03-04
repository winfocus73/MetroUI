import { Directive, OnInit, Input, ElementRef, OnChanges, SimpleChanges } from "@angular/core";


@Directive({
  selector: '[appTextPlaceholder]'
})
export class TextPlaceholderDirective implements OnInit, OnChanges {
  @Input('appTextPlaceholder') value!: string;
  @Input() placeholder: string = '---';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    console.log(this.value)
    if (!this.value) {
      this.el.nativeElement.innerText = this.placeholder;
    } else {
      this.el.nativeElement.innerText = this.value;
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.value) {
      this.el.nativeElement.innerText = this.placeholder;
    } else {
      this.el.nativeElement.innerText = this.value;
    }
  }
}
