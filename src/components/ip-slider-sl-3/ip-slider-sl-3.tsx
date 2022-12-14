import {Component, Element, getAssetPath, h, Prop, State, Watch} from '@stencil/core';
import {SlidesInterface} from "./interface/slides.interface";

@Component({
  tag: 'ip-slider-sl-3',
  styleUrl: './ip-slider-sl-3.scss',
  shadow: true,
  assetsDirs: ['assets'],
})
export class IpSliderSl3 {
  @Element() el: HTMLElement;

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

  private sliderTimer: number;

  @Prop() isSlideBullet = true;
  @Prop() isAutoSlide = true;

  @State() sliderBullets = [];
  @State() sliderCounts;
  @State() sliderPosition = 0;
  @State() slidesLi;
  @State() isAutoPlaying = false;

  componentWillLoad() {
    this.arrayDataWatcher(this.slides);

    setTimeout(() => {
      this.getSliderInfo();
      this.computeBullets();
      this.setSliderPosition(this.sliderPosition);
      // this.handleAutoSlide();
    }, 0);
  }

  getSliderInfo() {
    this.sliderCounts = this.el.shadowRoot.querySelectorAll('.slider__li').length;
    this.slidesLi = this.el.shadowRoot.querySelectorAll('.slider__li');
  }

  setSliderPosition(index) {

    this.sliderPosition = index;
    this.slidesLi[index].classList.add('active');

    const activeLink = this.slidesLi[index].querySelector('a');
    activeLink.setAttribute('tabindex', '0');

    const newSlide = Array.from(this.slidesLi).filter((_item: any, index) => {
      return index != this.sliderPosition;
    });

    setTimeout(() => {
      this.slidesLi[index].style.zIndex = "0";
      newSlide.forEach((slideLi: HTMLElement) => {
        slideLi.classList.remove('active');
        slideLi.style.zIndex = "1";

        slideLi.querySelector('a').setAttribute('tabindex', '-1');
      });
    }, 500);

  }

  computeBullets() {
    for (let i = 0; i < this.sliderCounts; i++) {
      this.sliderBullets.push(i);
    }
  }

  selectSlide(index: number) {
    this.setSliderPosition(index);
  }

  handleAutoSlide() {
    if (this.isAutoSlide) {
      this.sliderTimer = window.setInterval(() => {

        if (this.sliderPosition < this.sliderCounts - 1) {
          this.sliderPosition++;
        } else {
          this.sliderPosition = 0;
        }

        this.setSliderPosition(this.sliderPosition);
      }, 3000)
    }
  }

  disconnectedCallback() {
    window.clearInterval(this.sliderTimer);
  }

  playPauseAnimation() {
    const playPauseButton = this.el.shadowRoot.querySelector('.slider-play-pause');
    playPauseButton.classList.toggle("play-active");

    this.isAutoPlaying = !this.isAutoPlaying;

    if (this.isAutoPlaying) {
      window.clearInterval(this.sliderTimer);
    } else {
      this.handleAutoSlide();
    }
  }

  render() {

    return [
      <div class="slider">

        <div class="slider-items">

          <div class='slider-frame' style={{'background-image': `url(${this._slides[0].imgPath})`}}>
          </div>

          <ul class="slider__ul">
            {this._slides?.map((slide) => (
              <li class="slider__li">
                <a href={ slide.link } tabindex="-1">
                  <span class='slider-overlay'></span>
                  <span class="slider__bg" style={{'background-image': `url(${slide.imgPath})`}}></span>
                  <p class='slider__desc'> { slide.title } </p>
                </a>
              </li>
            ))}
          </ul>

        </div>

        <div class='slider-play-pause-container'>
            <button class='slider-play-pause'  onClick={this.playPauseAnimation.bind(this)}>
                <img class='play' src={getAssetPath('assets/images/play.svg')} alt=""/>
                <img class='pause' src={getAssetPath('assets/images/pause.svg')} alt=""/>
            </button>
        </div>

        {this.isSlideBullet ? (
          <div class="slider-bullets">
            <ul class="slider-bullets__ul">
              {this.sliderBullets?.map(index => (
                <li class="slider-bullets__li active">
                  <button class={this.sliderPosition === index ? 'btn-active' : null} part={this.sliderPosition === index ? 'bullet-btn bullet-btn-active' : 'bullet-btn'} onClick={this.selectSlide.bind(this, index)}></button>
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