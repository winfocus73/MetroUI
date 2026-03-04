import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[numbersOnly]'
})
export class NumberDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    if ( initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}

@Directive({
  selector: '[numberDeciamlOnly]'
})
export class NumberDecimalDirective {
  @Input() integral!: number;
  @Input() fractional!: number;
  private regex:RegExp = new RegExp(/^\d*\.?\d{0,3}$/g);
  private specialKeys: Array<string> = [
    "Backspace",
    "Tab",
    "End",
    "Home",
    "ArrowLeft",
    "ArrowRight",
    "Del",
    "Delete",
    'Clear',
    'Copy',
    'Paste'
  ];
  constructor(private _el: ElementRef) { }

  @HostListener('keydown', ['$event']) onInputChange(event: any) {
    if(this.integral ===5 && this.fractional === 4) {
      this.regex = new RegExp(/^\d{0,5}(?:\.\d{0,4})?$/);
    }
    if(this.specialKeys.indexOf(event.key)!==-1) {
      return;
    }
    let current: string = this._el.nativeElement.value;
    const position = this._el.nativeElement.selectionStart;
    const next: string = [
      current.slice(0, position),
      event.key == "Decimal" ? "." : event.key,
      current.slice(position)
    ].join("");
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
 
  }

}




@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow: Backspace, Delete, Tab, Escape, Enter, etc.
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key) ||
        // Allow: Ctrl+A, Command+A
        (event.key === 'a' && (event.ctrlKey || event.metaKey)) ||
        // Allow: Ctrl+C, Command+C
        (event.key === 'c' && (event.ctrlKey || event.metaKey)) ||
        // Allow: Ctrl+V, Command+V
        (event.key === 'v' && (event.ctrlKey || event.metaKey)) ||
        // Allow: Ctrl+X, Command+X
        (event.key === 'x' && (event.ctrlKey || event.metaKey))) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress if it isn't
    if (isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }


  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    // Prevent default behavior to handle paste manually
    event.preventDefault();

    // Get the pasted content from the clipboard
    const pastedContent = event.clipboardData?.getData('text/plain');

    // Validate the pasted content (e.g., check if it contains only numeric characters)
    if (!this.isValidInput(pastedContent||'')) {
      // Handle invalid input (e.g., show an error message)
      console.log('Invalid input');
    } else {
      // Allow the paste operation
      this.insertText(pastedContent||'');
    }
  }

  private isValidInput(input: string): boolean {
    // Example validation logic: Check if the input contains only numeric characters
    return /^\d+$/.test(input);
  }

  private insertText(text: string) {
    // Insert the text into the input element
    document.execCommand('insertText', false, text);
  }
}
