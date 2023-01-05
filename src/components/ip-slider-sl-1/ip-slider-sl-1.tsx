import { Component, Element, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'ip-slider-sl-1',
  styleUrl: './ip-slider-sl-1.scss',
  shadow: true,
})
export class IpSliderSl1 {
  @Element() el: HTMLElement;

  private slides: Element[] = [];

  @Prop() slideTitle: string;
  @Prop() slideGap = 30;
  @Prop() isSlideBullet = true;
  @Prop() isPreviousNextNavigation = true;
  @Prop() itemToShow = 3;
  @Prop() previousBtnAria = '';
  @Prop() nextBtnAria = '';
  @Prop() bulletBtnAria = '';
  @Prop() bulletBtnAriaTo = '';

  @State() sliderItemWidth;
  @State() sliderPosition = 0;
  @State() sliderUl;
  @State() sliderPreviousBtn;
  @State() sliderNextBtn;
  @State() sliderCounts;
  @State() isMobilePortrait = false;
  @State() sliderBullets = [];

  componentWillLoad() {

    const slotElements = this.el.querySelectorAll('[slot]');

    slotElements.forEach(elem => {
      this.slides.push(elem);
    });

    setTimeout(() => {
      this.getSliderInfo();
      this.computeSlideWidth();
      this.computeBullets();
      this.sliderPreviousBtn.disabled = true;
      this.sliderPreviousBtn.part = 'left-btn disabled';
      this.onResize();
      this.handleTabNavigation();
    }, 0);

    this.checkIfMobile();
  }

  computeSlideWidth() {
    const sliderContainerWidth = (this.el.shadowRoot.querySelector('.slider-items') as HTMLElement).getBoundingClientRect().width;

    // slide gap is the space between slides
    const slideGap = (this.itemToShow - 1) * this.slideGap;
    this.sliderItemWidth = (sliderContainerWidth - slideGap) / this.itemToShow;

    this.setItemSize(this.sliderItemWidth);
  }

  setItemSize(itemWidth) {
    const itemViewportWidth = this.convertPXToVW(itemWidth);
    this.el.shadowRoot.querySelectorAll('.slider__li').forEach(elem => {
      (elem as HTMLElement).style.width = `${itemViewportWidth}vw`;
    });
  }

  convertPXToVW(px) {
    return px * (100 / document.documentElement.clientWidth);
  }

  setSliderPosition(elemPosition) {
    const elemToMove = this.sliderItemWidth * (elemPosition * this.itemToShow);
    const leftPosition = -elemToMove;

    const elemGap = this.slideGap * (this.itemToShow * elemPosition);
    this.sliderUl.style.left = leftPosition - elemGap + 'px';
  }

  previous() {
    if (this.sliderPosition === 1) {
      this.sliderPreviousBtn.disabled = true;
      this.sliderPreviousBtn.part = 'left-btn disabled';
    }

    if (this.sliderNextBtn.disabled) {
      this.sliderNextBtn.disabled = false;
      this.sliderNextBtn.part = 'right-btn';
    }

    this.sliderPosition--;
    this.setSliderPosition(this.sliderPosition);

    this.handleTabNavigation();
  }

  next() {
    const itemToTrigger = Math.ceil(this.sliderCounts / this.itemToShow) - 2;

    if (this.sliderPosition >= itemToTrigger) {
      this.sliderNextBtn.disabled = true;
      this.sliderNextBtn.part = 'right-btn disabled';
    }

    if (this.sliderPreviousBtn.disabled) {
      this.sliderPreviousBtn.disabled = false;
      this.sliderPreviousBtn.part = 'left-btn';
    }

    this.sliderPosition++;
    this.setSliderPosition(this.sliderPosition);

    this.handleTabNavigation();
  }

  getSliderInfo() {
    this.sliderUl = this.el.shadowRoot.querySelector('.slider__ul') as HTMLElement;

    this.sliderPreviousBtn = this.el.shadowRoot.querySelector('.btn-previous') as HTMLElement;
    this.sliderNextBtn = this.el.shadowRoot.querySelector('.btn-next') as HTMLElement;

    this.sliderCounts = this.el.shadowRoot.querySelectorAll('.slider__li').length;
  }

  onResize() {
    window.addEventListener('resize', () => {
      this.computeSlideWidth();
      this.setSliderPosition(this.sliderPosition);
      this.checkIfMobile();
    });
  }

  checkIfMobile() {
    if (window.matchMedia(`(max-width: 767px) and (orientation: portrait)`).matches) {
      this.isMobilePortrait = true;
      this.itemToShow = 1;
    } else {
      this.isMobilePortrait = false;
    }
  }

  computeBullets() {
    const numBullets = Math.ceil(this.sliderCounts / this.itemToShow);

    for (let i = 0; i < numBullets; i++) {
      this.sliderBullets.push(i);
    }
  }

  selectSlide(index: number) {
    const firstSlide = 0;
    const lastSlide = this.sliderBullets.length - 1;

    if (index === firstSlide) {
      if (!this.sliderPreviousBtn.disabled) {
        this.sliderPreviousBtn.disabled = true;
        this.sliderPreviousBtn.part = 'left-btn disabled';
      }
    }

    if (index != firstSlide) {
      if (this.sliderPreviousBtn.disabled) {
        this.sliderPreviousBtn.disabled = false;
        this.sliderPreviousBtn.part = 'left-btn';
      }
    }

    if (index != lastSlide) {
      if (this.sliderNextBtn.disabled) {
        this.sliderNextBtn.disabled = false;
        this.sliderNextBtn.part = 'right-btn';
      }
    }

    if (index === lastSlide) {
      if (!this.sliderNextBtn.disabled) {
        this.sliderNextBtn.disabled = true;
        this.sliderNextBtn.part = 'right-btn disabled';
      }
    }

    this.sliderPosition = index;
    this.setSliderPosition(this.sliderPosition);

    this.handleTabNavigation();
  }

  handleTabNavigation() {
    this.slides.forEach(elem => {
      const linkElement = elem.querySelector('a');
      linkElement?.setAttribute('tabindex', '-1');
    });

    const startingIndex = this.sliderPosition * this.itemToShow;
    for (let i = startingIndex; i < startingIndex + this.itemToShow; i++) {
      const linkElement = this.slides[i]?.querySelector('a');
      linkElement?.setAttribute('tabindex', '0');
    }
  }

  forceFocus(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      setTimeout(() => {
        const startingIndex = this.sliderPosition * this.itemToShow;
        this.slides[startingIndex].querySelector('a').focus();
      }, 500);
    }
  }

  render() {
    const slideGap = this.convertPXToVW(this.slideGap);

    return [
      <div class="slider">
        <div class="slider-items">
          <ul class="slider__ul" style={{ gap: `${slideGap}vw` }}>
            {this.slides?.map((_slide, index) => (
              <li class="slider__li">
                <slot name={'slide-' + (index + 1)}></slot>
              </li>
            ))}
          </ul>
        </div>

        { this.isPreviousNextNavigation ? (
          <div>
            <button part="left-btn" aria-label={this.previousBtnAria} class="btn btn-previous" onClick={this.previous.bind(this)} onKeyPress={this.forceFocus.bind(this)}></button>
            <button part="right-btn" aria-label={this.nextBtnAria} class="btn btn-next" onClick={this.next.bind(this)} onKeyPress={this.forceFocus.bind(this)}></button>
          </div>
        ) : ''}

        {this.isSlideBullet ? (
          <div class="slider-bullets">
            <ul class="slider-bullets__ul">
              {this.sliderBullets?.map(index => (
                <li class="slider-bullets__li">
                  <button
                    aria-current = {this.sliderPosition === index ? 'true' : null}
                    part={this.sliderPosition === index ? 'bullet-btn bullet-btn-active' : 'bullet-btn'}
                    onClick={this.selectSlide.bind(this, index)}
                    onKeyPress={this.forceFocus.bind(this)} class={this.sliderPosition === index ? 'btn-active' : null}
                    aria-label={this.isMobilePortrait ? this.bulletBtnAria + ' ' + `${(index+1) + '/' + this.sliderCounts}` : this.bulletBtnAria + ' ' + `${((index) * this.itemToShow) + 1}` + ' ' + this.bulletBtnAriaTo + ' ' + `${ (this.sliderBullets.length - 1) === index ? this.sliderCounts : ((index) * this.itemToShow) + this.itemToShow}`}>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          ''
        )}
      </div>,
    ];
  }
}
