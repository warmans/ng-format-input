import {Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Renderer3} from "@angular/core/src/render3/renderer";

@Component({
  selector: 'format-input',
  templateUrl: './format-input.component.html',
  styleUrls: ['./format-input.component.scss'],
})
export class FormatInputComponent implements OnInit {

  @ViewChild('editableContent')
  editableContent: ElementRef;

  @Input()
  format: Format = {
    format: 'http://{sub}.{domain}.{tld}/login',
    configs: [
      {name: "sub", description: "first part of address"},
      {name: "domain", description: "second part of address"},
      {name: "tld", description: "third part of address"},
    ],
  };

  model: Model;

  private lastCaretPos: number;

  constructor(private renderer: Renderer2) {

  }

  ngOnInit(): void {
    this.model = new Model(this.format);
    console.log(this.model);

    this.render();
  }

  render() {
    const rendered = this.renderer.createElement('span');
    rendered.className = 'format';

    this.model.tokens.forEach((tok, i) => {
      const tokEl = this.renderer.createElement('span');
      tokEl.className = tok.type==TokenType.Editable ? ' editable' : 'text';
      tokEl.textContent = tok.type==TokenType.Text ? tok.label : tok.value;
      tokEl.title = (tok.conf ? tok.conf.name : '');
      tokEl.contentEditable = (tok.type==TokenType.Editable);
      tokEl.placeholder = tok.label;
      tokEl.style = `min-width: ${tok.label.length}ch`;

      tok.el = tokEl;
      this.renderer.appendChild(rendered, tokEl);
    });

    // clear input
    this.editableContent.nativeElement.innerHTML = '';

    // update with styled content
    this.renderer.appendChild(this.editableContent.nativeElement, rendered);
  }

  onFocus() {

  }

  focusPrevToken() {
    const activeIndex = this.activeTokenIndex();
    if (activeIndex  === 0 || activeIndex === this.model.tokens.length) {
      return;
    }
    for (let i = activeIndex; i > 0; i--) {
      if (this.model.tokens[i].type === TokenType.Editable) {
        this.moveCaretTo(this.model.tokens[i].el, this.model.tokens[i].value.length);
        return;
      }
    }
  }

  focusNextToken() {
    const activeIndex = this.activeTokenIndex();
    if (activeIndex  === 0 || activeIndex === this.model.tokens.length) {
      return;
    }
    for (let i = activeIndex; i < this.model.tokens.length; i++) {
      if (this.model.tokens[i].type === TokenType.Editable) {
        this.moveCaretTo(this.model.tokens[i].el, 0);
        return;
      }
    }
  }

  activeToken(): Token {
    const i = this.activeTokenIndex();
    if (i > 0 ) {
      return this.model.tokens[i];
    }
    return null;
  }

  activeTokenIndex(): number {
    for (let i = 0; i < this.model.tokens.length; i++) {
      if (this.model.tokens[i].el === document.activeElement) {
        return i
      }
    }
    return -1;
  }

  caretPosition(el: Element): number {
    const range = window.getSelection().getRangeAt(0);
    const selected = range.toString().length;
    const preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    if (selected) {
      return  preCaretRange.toString().length - selected;
    } else {
      return preCaretRange.toString().length;
    }
  }

  moveCaretTo(el: Element, position: number) {

    // move to end (no idea why it doesn't work in the normal way)
    if (el.textContent.length === position) {
      let range, selection;
      range = document.createRange();
      range.selectNodeContents(this.editableContent.nativeElement);
      range.collapse(false);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    const sel = window.getSelection();
    sel.collapse(el, position);
  }

  onKeyup(ev: KeyboardEvent) {

    console.log(ev);

    const activeTokenIndex = this.activeToken();
    const activeToken = this.activeToken();
    if (activeToken === name) {
      return
    }

    //update value
    activeToken.value = activeToken.el.textContent;


    const caretPos = this.caretPosition(activeToken.el);

    switch (ev.key) {
      case 'ArrowLeft':
        if (caretPos === 0 && this.lastCaretPos === caretPos) {
          this.focusPrevToken();
        }
        break;
      case 'ArrowRight':
        if (caretPos === activeToken.value.length && this.lastCaretPos === caretPos) {
          this.focusNextToken();
        }
        break;
    }

    // store the last position so we can detect when the user presses left/right a second time after
    // reaching the start/end of the editable content.
    this.lastCaretPos = caretPos;
  }
}

enum TokenType {Text, Editable}

class Model {

  public raw: string;
  public tokens: Token[];

  constructor(fmt: Format) {
    this.raw = fmt.format;
    this.tokens = this.parse(fmt.format);
    this.tokens.forEach(tok => {
      fmt.configs.forEach(prop => {
        if (prop.name === tok.label) {
          tok.conf = prop;
        }
      })
    });
  }

  private parse(raw: string): Token[] {
    let tokens = [];
    let curToken: Token = {type: TokenType.Text, label: '', value: ''};
    for (let i = 0; i < raw.length; i++) {
      let curChar = raw.charAt(i);
      switch (curChar) {
        case '{':
          if (curToken.label.length > 0) {
            tokens.push(curToken);
          }
          curToken = {type: TokenType.Editable, label: '', value: ''};
          break;
        case '}':
          if (curToken.label.length > 0) {
            tokens.push(curToken);
          }
          curToken = {type: TokenType.Text, label: '', value: ''};
          break;
        default:
          curToken.label += curChar;
      }
    }
    if (curToken.label.length > 0) {
      tokens.push(curToken);
    }
    return tokens;
  }
}

interface Token {
  type: TokenType;
  label: string;
  value: string;
  conf?: TokenConfig;
  el?: Element;
}


export interface Format {
  format: string;
  configs: TokenConfig[];
}

export interface TokenConfig {
  name: string;
  description: string;
}

