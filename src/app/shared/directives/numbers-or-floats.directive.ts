import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[floatOrIntegerInput]'
})
export class FloatOrIntegerInputDirective {

  private regex: RegExp = new RegExp(/^-?\d+(\.\d*)?$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow special keys
    if (this.specialKeys.includes(event.key)) {
      return;
    }

    const inputValue: string = this.el.nativeElement.value + event.key;

    // Prevent default behavior if the input value is invalid
    if (!String(inputValue).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    let pastedInput: string = event.clipboardData?.getData('text') || '';

    if (!String(pastedInput).match(this.regex)) {
      event.preventDefault();
    }
  }
}
