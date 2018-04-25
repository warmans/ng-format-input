import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {valueSource} from "../dropdown/dropdown.component";

@Component({
  selector: 'format-input',
  templateUrl: './format-input.component.html',
  styleUrls: ['./format-input.component.scss'],
})
export class FormatInputComponent implements OnInit {

  @ViewChild('editableContent')
  editableContent: ElementRef;

  @Output()
  onValueUpdate: EventEmitter<{[index: string]: string}> = new EventEmitter<{[p: string]: string}>();

  @Input('format')
  set format(fmt: Format) {
    this.fmt = fmt;
    this.update();
  }
  get format(): Format {
    return this.fmt;
  }

  private fmt: Format;

  public model: Model;

  public keyboardEvents: EventEmitter<KeyboardEvent> = new EventEmitter();

  public lastActiveToken: Token;

  private lastCaretPos: number;

  constructor(private renderer: Renderer2) {
  }

  ngOnInit(): void {
  }

  update(): void {
    this.model = new Model(this.fmt);
    this.render();
  }

  render() {
    const rendered = this.renderer.createElement('span');
    rendered.className = 'format';

    this.model.tokens.forEach((tok, i) => {
      const tokEl = this.renderer.createElement('span');
      tokEl.className = tok.type == TokenType.Editable ? ' editable' : 'text';
      tokEl.textContent = tok.type == TokenType.Text ? tok.text : tok.value;
      tokEl.title = (tok.conf ? tok.conf.name : '');
      tokEl.contentEditable = (tok.type == TokenType.Editable);
      tokEl.placeholder = tok.text;
      tokEl.style = `min-width: ${tok.text.length}ch`;

      tok.el = tokEl;
      this.renderer.appendChild(rendered, tokEl);
    });

    // clear input
    this.editableContent.nativeElement.innerHTML = '';

    // update with styled content
    this.renderer.appendChild(this.editableContent.nativeElement, rendered);
  }

  onKeydown(ev: KeyboardEvent): boolean {
    if (ev.key === 'Enter') {
      return false;
    }
  }

  onKeyup(ev: KeyboardEvent) {

    this.lastActiveToken = this.activeToken();
    if (this.lastActiveToken === null) {
      return;
    }

    // propagate keyboard event
    this.keyboardEvents.next(ev);

    // ensure value and textContent are consistent
    this.updateActiveTokenValue([this.lastActiveToken.el.textContent]);

    const caretPos = this.caretPosition(this.lastActiveToken.el);
    switch (ev.key) {
      case 'ArrowLeft':
        if (caretPos === 0 && this.lastCaretPos === caretPos) {
          // todo: move to previous editable token
        }
        break;
      case 'ArrowRight':
        if (caretPos === this.lastActiveToken.value.length && this.lastCaretPos === caretPos) {
          // todo: move to next editable token
        }
        break;
    }

    // store the last position so we can detect when the user presses left/right a second time after
    // reaching the start/end of the editable content.
    this.lastCaretPos = caretPos;
  }

  activeToken(): Token {
    const i = this.activeTokenIndex();
    if (i > 0) {
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

  prevToken(): Token {
    const activeIndex = this.activeTokenIndex();
    if (activeIndex === 0 || activeIndex === this.model.tokens.length) {
      return;
    }
    for (let i = activeIndex; i > 0; i--) {
      if (this.model.tokens[i].type === TokenType.Editable) {
        return this.model.tokens[i];
      }
    }
  }

  nextToken() {
    const activeIndex = this.activeTokenIndex();
    if (activeIndex === 0 || activeIndex === this.model.tokens.length) {
      return;
    }
    for (let i = activeIndex; i < this.model.tokens.length; i++) {
      if (this.model.tokens[i].type === TokenType.Editable) {
        return this.model.tokens[i];
      }
    }
  }

  caretPosition(el: Element): number {
    const range = window.getSelection().getRangeAt(0);
    const selected = range.toString().length;
    const preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    if (selected) {
      return preCaretRange.toString().length - selected;
    } else {
      return preCaretRange.toString().length;
    }
  }

  updateActiveTokenValue(value: string[]) {
    if (!this.lastActiveToken) {
      return;
    }
    this.model.setTokenValue(this.lastActiveToken, value.join(','));
    this.onValueUpdate.next(this.model.value());
  }
}

enum TokenType {Text, Editable}

class Model {

  public raw: string = '';
  public tokens: Token[] = [];

  constructor(fmt: Format) {
    if (fmt === undefined || fmt === null || fmt.layout === '') {
      return;
    }
    this.raw = fmt.layout;
    this.tokens = this.parse(fmt.layout);
    this.tokens.forEach(tok => {
      tok.conf = {name: tok.text};
      if (fmt.configs) {
        fmt.configs.forEach(prop => {
          if (prop.name === tok.text) {
            tok.conf = Object.assign(tok.conf, prop);
          }
        })
      }
    });
  }

  private parse(raw: string): Token[] {
    let tokens = [];
    let curToken: Token = {type: TokenType.Text, text: '', value: ''};
    for (let i = 0; i < raw.length; i++) {
      let curChar = raw.charAt(i);
      switch (curChar) {
        case '{':
          if (curToken.text.length > 0) {
            tokens.push(curToken);
          }
          curToken = {type: TokenType.Editable, text: '', value: ''};
          break;
        case '}':
          if (curToken.text.length > 0) {
            tokens.push(curToken);
          }
          curToken = {type: TokenType.Text, text: '', value: ''};
          break;
        default:
          curToken.text += curChar;
      }
    }
    if (curToken.text.length > 0) {
      tokens.push(curToken);
    }
    return tokens;
  }

  public value(): {[index: string]: string } {
    let v: {[index: string]: string } = {};
    this.tokens.forEach((tok: Token) => {
      if (tok.type === TokenType.Editable) {
        v[tok.conf.name] = tok.value;
      }
    });
    return v;
  }

  public setTokenValue(token: Token, value: string) {
    token.value = value;
    token.el.textContent = value;
    console.log(token, value);
  }

  public editableTokens(): Token[] {
    return this.tokens.filter(t => t.type === TokenType.Editable);
  }
}

interface Token {
  type: TokenType;
  text: string;
  value: string;
  conf?: TokenConfig;
  el?: Element;
}


export interface Format {
  layout: string;
  configs?: TokenConfig[];
}

export interface TokenConfig {
  name: string;
  valueSource?: valueSource;
}


