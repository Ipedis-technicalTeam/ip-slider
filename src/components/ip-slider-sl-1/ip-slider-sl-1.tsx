import {Component, Element, h, Prop, State, Watch} from "@stencil/core";
import {SlidesInterface} from "./interface/slides.interface";

@Component({
  tag: 'ip-slider-sl-1',
  styleUrl: './ip-slider-sl-1.scss',
  shadow: true
})

export class IpSliderSl1 {

  @Element() el: HTMLElement;

  @Prop() slideTitle: string;
  @Prop() slideGap = 30;
  @Prop() isSlideBullet = true;
  @Prop() itemToShow = 2;

  private _slides: SlidesInterface[];
  @Prop() slides: SlidesInterface[] | string;

  @Watch('slides')
  arrayDataWatcher(newValue: SlidesInterface[] | string) {
    if (typeof newValue === 'string') {
      this._slides = JSON.parse(newValue);
    } else {
      this._slides = newValue;
    }
  }

  @State() sliderItemWidth;
  @State() sliderPosition = 0;
  @State() sliderUl;
  @State() sliderPreviousBtn;
  @State() sliderNextBtn;
  @State() sliderCounts;
  @State() isMobilePortrait = false;
  @State() sliderBullets = [];

  componentWillLoad() {
      this.arrayDataWatcher(this.slides);

      setTimeout(() => {
          this.getSliderInfo();
          this.computeSlideWidth();
          this.computeBullets();
          this.sliderPreviousBtn.disabled = true;
          this.onResize();
      }, 0)

      this.checkIfMobile();

  }

  computeSlideWidth() {
    const sliderContainerWidth = (this.el.shadowRoot.querySelector('.slider-items') as HTMLElement).getBoundingClientRect().width;

    // slide gap is the space between slides
    const slideGap = (this.itemToShow - 1) * this.slideGap;
    this.sliderItemWidth = (sliderContainerWidth - slideGap)/this.itemToShow;

    this.setItemSize(this.sliderItemWidth);
  }

  setItemSize(itemWidth) {
    const itemViewportWidth = this.convertPXToVW(itemWidth);
    this.el.shadowRoot.querySelectorAll('.slider__li').forEach((elem) => {
      (elem as HTMLElement).style.width = `${itemViewportWidth}vw`;
    })
  }

  convertPXToVW(px) {
    return px * (100 / document.documentElement.clientWidth);
  }

  setSliderPosition(elemPosition) {

    const elemToMove = (this.sliderItemWidth) * (elemPosition * this.itemToShow);
    const leftPosition = -(elemToMove);

    const elemGap = this.slideGap * (this.itemToShow * elemPosition);
    this.sliderUl.style.left = (leftPosition - elemGap) + 'px';

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

  }

  next() {

    const itemToTrigger = Math.ceil(this.sliderCounts/this.itemToShow) - 2;

    if (this.sliderPosition >= itemToTrigger) {
      this.sliderNextBtn.disabled = true;
    }

    if (this.sliderPreviousBtn.disabled) {
      this.sliderPreviousBtn.disabled = false;
    }

    this.sliderPosition++;
    this.setSliderPosition(this.sliderPosition);
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
    const numBullets = Math.ceil(this.sliderCounts/this.itemToShow);

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

  }

  render() {

    const slideGap = this.convertPXToVW(this.slideGap);

    return [
        <div class='slider'>

          <button class="btn btn-previous" onClick={this.previous.bind(this)}>
          </button>

          <div class='slider-items'>
            <ul class='slider__ul' style={{'gap': `${slideGap}vw`}}>
              {
                this._slides?.map((slide, index) => (
                  <li class='slider__li'>
                    { slide.link }
                    <slot name={'slide-' + (index + 1)}></slot>

                  </li>
                ))
              }
            </ul>
          </div>

          {
            this.isSlideBullet ?
              <div class='slider-bullets'>

                <ul class='slider-bullets__ul'>
                  {
                    this.sliderBullets?.map((index) => (
                      <li class='slider-bullets__li'>
                        <button onClick={this.selectSlide.bind(this, index)} class={this.sliderPosition === index ? 'btn-active' : ''}>

                        </button>
                      </li>
                    ))
                  }
                </ul>
              </div>
              : ''
          }

          <button class="btn btn-next" onClick={this.next.bind(this)}>
          </button>

        </div>
    ]

  }

}
