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

  componentWillLoad() {
    this.arrayDataWatcher(this.slides);

    setTimeout(() => {
      this.getSliderInfo();

      this.sliderPreviousBtn.disabled = true;

      window.addEventListener('resize', () => {
        this.getSliderInfo();
        this.setSliderPosition(this.sliderPostion);
      });

    },0)
  }

  previous() {

    if (this.sliderPostion > 1) {
      this.sliderNextBtn.disabled = false;
    } else {
      this.sliderPreviousBtn.disabled = true;
    }

    this.sliderPostion --;

    this.setSliderPosition(this.sliderPostion);
  }

  next() {

    if (this.sliderPostion < (this.sliderItemsCounts - 3)) {
      this.sliderPreviousBtn.disabled = false;
    }  else {
      this.sliderNextBtn.disabled = true;
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
  }

  render() {

    return [

      <div class='ip-slider-sl-1'>

        <div class='slider'>
          <div class='slider__desc'>

            <p class='slider__desc__title' innerHTML={this.slideTitle ? this.slideTitle : ''}>
            </p>

            <div class='slider__btns'>

              <button class='slider__btns__previous' onClick={this.previous.bind(this)}>
                <span></span>
                <i class="arrow left"></i>
              </button>

              <button class='slider__btns__next' onClick={this.next.bind(this)}>
                <i class="arrow right"></i>
              </button>

            </div>

          </div>

          <div class='slider__items'>
            <ul class='slider__items__ul'>
              {
                this._slides?.map((slide) => (
                  <li class='slider__li'>
                    <a class='slider__li__link' href={slide.link} target='_blank'>
                      <img src={slide.imgPath} alt=""/>
                      <span class='slider__li__overlay'></span>
                      <span class='slider__li__desc'>{ slide.title }</span>
                    </a>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>


      </div>
    ]

  }

}
