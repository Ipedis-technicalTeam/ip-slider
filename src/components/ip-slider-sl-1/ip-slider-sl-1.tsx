import {Component, h, Element, Prop, Watch, State} from "@stencil/core";
import {SlidesInterface} from "./interface/slides.interface";

@Component({
  tag: 'ip-slider-sl-1',
  styleUrl: './ip-slider-sl-1.scss',
  shadow: true
})
export class IpSliderSl1 {

  @Element() el: HTMLElement;

  private _slides: SlidesInterface[];
  @Prop() slides: SlidesInterface[] | string;

  @Prop() slideTitle: string;
  @Prop() slideTitleMobile: string;
  @Prop() btnNextAria: string;
  @Prop() btnPreviousAria: string;
  @Prop() slideTitleAria: string;

  @Watch('slides')
  arrayDataWatcher(newValue: SlidesInterface[] | string) {
    if (typeof newValue === 'string') {
      this._slides = JSON.parse(newValue);
    } else {
      this._slides = newValue;
    }
  }

  @State() sliderPostion = 0;
  @State() sliderUl;
  @State() sliderItemSize;
  @State() sliderItemsCounts;
  @State() sliderPreviousBtn;
  @State() sliderNextBtn;
  @State() sliderLinks;

  @State() isMobilePortrait = false;

  componentWillLoad() {
    this.arrayDataWatcher(this.slides);

    setTimeout(() => {
      this.getSliderInfo();

      this.sliderPreviousBtn.disabled = true;

      window.addEventListener('resize', () => {
        this.getSliderInfo();
        this.setSliderPosition(this.sliderPostion);
        this.checkIfMobile();
      });

      this.checkIfMobile();

      this.handleTabNavigation();

    },0)
  }

  previous() {

    if (this.sliderPostion === 1) {
      this.sliderPreviousBtn.disabled = true;
    }

    if (this.sliderNextBtn.disabled) {
      this.sliderNextBtn.disabled = false;
    }

    this.sliderPostion --;

    this.setSliderPosition(this.sliderPostion);
  }

  next() {

    const itemToTrigger = this.isMobilePortrait ? (this.sliderItemsCounts - 2) : (this.sliderItemsCounts - 3);

    if (this.sliderPostion >= itemToTrigger) {
      this.sliderNextBtn.disabled = true;
    }

    if (this.sliderPreviousBtn.disabled) {
      this.sliderPreviousBtn.disabled = false;
    }

    this.sliderPostion ++;
    this.setSliderPosition(this.sliderPostion);

  }

  setSliderPosition(elemPosition) {
    const elemToMove = (this.sliderItemSize) * elemPosition;
    const leftPosition = -(elemToMove);
    const sliderUl = this.el.shadowRoot.querySelector('.slider__items__ul') as HTMLElement;
    sliderUl.style.left = leftPosition + 'px';
  }

  getSliderInfo() {
    const sliderItem = this.el.shadowRoot.querySelector('.slider__li') as HTMLElement;
    const elemWidth = sliderItem.clientWidth;
    const ElemtMarginRight = parseInt(getComputedStyle(sliderItem).marginRight);

    this.sliderItemSize = elemWidth + ElemtMarginRight;
    this.sliderUl = this.el.shadowRoot.querySelector('.slider__items__ul') as HTMLElement;

    this.sliderItemsCounts = this.el.shadowRoot.querySelectorAll('.slider__li').length;

    this.sliderPreviousBtn = this.el.shadowRoot.querySelector('.slider__btns__previous') as HTMLElement;
    this.sliderNextBtn = this.el.shadowRoot.querySelector('.slider__btns__next') as HTMLElement;

    this.sliderLinks = this.el.shadowRoot.querySelectorAll('.slider__li__link');
  }

  checkIfMobile() {
    if (window.matchMedia(`(max-width: 767px) and (orientation: portrait)`).matches) {
      this.isMobilePortrait = true;
    } else {
      this.isMobilePortrait = false;
    }
  }

  handleTabNavigation() {

    this.sliderLinks[1].addEventListener('keydown', (event) => {
      if (!event.shiftKey && event.key === 'Tab') {
        this.next();
      }
    })

    this.sliderLinks[2].addEventListener('keydown', (event) => {
      if (!event.shiftKey && event.key === 'Tab') {
        this.next();
      }

      if (event.shiftKey && event.key === 'Tab') {
        this.previous();
      }
    })

    this.sliderLinks[3].addEventListener('keydown', (event) => {
      if (!event.shiftKey && event.key === 'Tab') {
        this.next();
      }

      if (event.shiftKey && event.key === 'Tab') {
        this.previous();
      }
    })

    this.sliderLinks[4].addEventListener('keydown', (event) => {
      if(event.shiftKey && event.key === 'Tab') {
        this.previous();
      }
    })
  }

  render() {

    return [

      <div class='ip-slider-sl-1'>

        <div class='slider' aria-roledescription="carousel" aria-label={ this.slideTitleAria ? this.slideTitleAria : '' }>

          <div class='slider__desc'>

            <h3 class='slider__desc__title' aria-label={ this.slideTitleAria ? this.slideTitleAria : '' } innerHTML={this.slideTitle ? this.slideTitle : ''}>
            </h3>

            <div class='slider__btns'>

              <button aria-hidden='true' tabindex='-1' aria-controls='slider-items' aria-label={this.btnNextAria} class='slider__btns__previous' onClick={this.previous.bind(this)}>
                <span></span>
                <i class="arrow left"></i>
              </button>

              <span class='slider__pagination' aria-hidden='true'> { '0' + (this.sliderPostion + 1) }/{ '0' + this.sliderItemsCounts } </span>

              <button aria-hidden='true' tabindex='-1' aria-controls='slider-items' aria-label={this.btnPreviousAria} class='slider__btns__next' onClick={this.next.bind(this)}>
                <i class="arrow right"></i>
              </button>

            </div>

          </div>

          <div class='slider__items' id='slider-items' aria-live="polite">
            <ul class='slider__items__ul'>
              {
                this._slides?.map((slide, index) => (
                  <li class='slider__li' aria-roledescription="slide" aria-label={`${index+1}  of ${this.sliderItemsCounts} - ${slide.title}`} >
                    <a role='group' class='slider__li__link' id={`hello-${index + 1}`} href={slide.link}>
                      <div part={`slider-image-${index + 1}`} class= 'slider__li__bg-img'style={{'background-image': `url(${slide.imgPath})`}}></div>
                      <span class='slider__li__overlay'></span>
                      <span class='slider__li__desc'>{ slide.title }</span>
                    </a>
                  </li>
                ))
              }
            </ul>
          </div>

          <h3 class='slider__title-mobile' aria-label={ this.slideTitleAria ? this.slideTitleAria : '' } innerHTML={this.slideTitleMobile ? this.slideTitleMobile : ''}></h3>

        </div>

      </div>
    ]

  }

}
