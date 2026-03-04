import { Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

const APPLE_PATTERN = /(mac|iphone|ipod|ipad)/i;
const EVENT_PATTERN = /^click(\.(shift|alt|ctrl)){1,3}$/;

@Injectable({providedIn: 'root'})
export class ClickModifiersPlugin {
  manager!: EventManager;

  addEventListener(
    target: HTMLElement,
    eventName: string,
    originalHandler: any,
  ): Function {
    const isApple = APPLE_PATTERN.test(navigator.platform);
    const [name, ...keys] = eventName.split(".");
    const modifiers = keys.map(
      key => isApple && key === 'ctrl' ? 'metaKey' : key + 'Key'
    );

    const subscription = fromEvent(target, 'click').pipe(
        //filter((e: any) => modifiers.includes(e.key)),
        filter((e: any) => modifiers.every(modifier => e[modifier])),
     // filter((ev: KeyboardEvent) => modifiers.includes(ev.key)),
    ).subscribe(originalHandler);

    return () => subscription.unsubscribe();
  }

  supports(eventName: string): boolean {
    return EVENT_PATTERN.test(eventName);
  }
}
