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
  @Prop() itemToShow = 3;

  @State() sliderItemWidth;
  @State() sliderPosition = 0;
  @State() sliderUl;
  @State() sliderPreviousBtn;
  @State() sliderNextBtn;
  @State() sliderCounts;
  @State() isMobilePortrait = false;
  @State() sliderBullets = [];

  componentWillLoad() {
    const slotElements = document.querySelectorAll('ip-slider-sl-1 [slot]');

    slotElements.forEach((elem) => {
      this.slides.push(elem);
    })

    setTimeout(() => {
      this.getSliderInfo();
      this.computeSlideWidth();
      this.computeBullets();
      this.sliderPreviousBtn.disabled = true;
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
    }

    if (this.sliderNextBtn.disabled) {
      this.sliderNextBtn.disabled = false;
    }

    this.sliderPosition--;
    this.setSliderPosition(this.sliderPosition);

    this.handleTabNavigation();
  }

  next() {
    const itemToTrigger = Math.ceil(this.sliderCounts / this.itemToShow) - 2;

    if (this.sliderPosition >= itemToTrigger) {
      this.sliderNextBtn.disabled = true;
    }

    if (this.sliderPreviousBtn.disabled) {
      this.sliderPreviousBtn.disabled = false;
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
      }
    }

    if (index != firstSlide) {
      if (this.sliderPreviousBtn.disabled) {
        this.sliderPreviousBtn.disabled = false;
      }
    }

    if (index != lastSlide) {
      if (this.sliderNextBtn.disabled) {
        this.sliderNextBtn.disabled = false;
      }
    }

    if (index === lastSlide) {
      if (!this.sliderNextBtn.disabled) {
        this.sliderNextBtn.disabled = true;
      }
    }

    this.sliderPosition = index;
    this.setSliderPosition(this.sliderPosition);

    this.handleTabNavigation();
  }

  handleTabNavigation() {

    this.slides.forEach((elem) => {
      const linkElement = elem.querySelector('a');
      linkElement?.setAttribute('tabindex', '-1');
      linkElement?.setAttribute('title', '-1');
    });

    const startingIndex = this.sliderPosition * this.itemToShow;
    for (let i = startingIndex; i < startingIndex + this.itemToShow; i++) {
      const linkElement = this.slides[i]?.querySelector('a');
      linkElement?.setAttribute('tabindex', '0');
      linkElement?.setAttribute('title', '0');
    }
  }

  forceFocus(event: KeyboardEvent) {

    if (event.key === 'Enter') {
      setTimeout( () => {
        const startingIndex = this.sliderPosition * this.itemToShow;
        this.slides[startingIndex].querySelector('a').focus();
      }, 100);
    }
  }

  render() {
    const slideGap = this.convertPXToVW(this.slideGap);

    return [
      <div class="slider">

        <div class="slider-items">
          <ul class="slider__ul" style={{ gap: `${slideGap}vw` }}>
            {this.slides?.map((slide, index) => (
              <li class="slider__li">
                <p style={{'display': 'none'}}> { slide.clientWidth }</p>
                <slot name={'slide-' + (index + 1)}></slot>
              </li>
            ))}
          </ul>
        </div>

        <button part="left-btn" class="btn btn-previous" onClick={this.previous.bind(this)} onKeyPress={this.forceFocus.bind(this)}></button>
        <button part="right-btn" class="btn btn-next" onClick={this.next.bind(this)} onKeyPress={this.forceFocus.bind(this)}></button>

        {this.isSlideBullet ? (
          <div class="slider-bullets">
            <ul class="slider-bullets__ul">
              {this.sliderBullets?.map(index => (
                <li class="slider-bullets__li">
                  <button onClick={this.selectSlide.bind(this, index)} onKeyPress={this.forceFocus.bind(this)} class={this.sliderPosition === index ? 'btn-active' : ''}></button>
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
