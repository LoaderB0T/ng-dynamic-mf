import { Injectable } from '@angular/core';

import { AddHtmlHeadElementType } from './html-head-types.model';

@Injectable({
  providedIn: 'root',
})
export class HtmlHeadService {
  private readonly _knownElements = new Set<string>();

  public addElement(element: AddHtmlHeadElementType) {
    const head = document.getElementsByTagName('head')[0];
    const el = document.createElement(element.type);
    switch (element.type) {
      case 'link': {
        if (this._knownElements.has(element.href)) {
          return;
        }
        const link = el as HTMLLinkElement;
        link.rel = element.rel;
        link.href = element.href;
        this._knownElements.add(element.href);
        break;
      }
      case 'script': {
        if (this._knownElements.has(element.src)) {
          return;
        }
        const script = el as HTMLScriptElement;
        script.src = element.src;
        script.crossOrigin = element.crossorigin ?? null;
        if (element.data) {
          Object.keys(element.data).forEach(key => {
            script.setAttribute(`data-${key}`, element.data![key]);
          });
        }
        this._knownElements.add(element.src);
        break;
      }
    }
    head.appendChild(el);
  }
}
