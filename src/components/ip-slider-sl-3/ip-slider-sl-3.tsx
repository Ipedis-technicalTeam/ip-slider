import {Component, Element, h, Prop, State, Watch} from '@stencil/core';
import {SlidesInterface} from "./interface/slides.interface";

@Component({
  tag: 'ip-slider-sl-3',
  styleUrl: './ip-slider-sl-3.scss',
  shadow: true
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

  @Prop() slidePlayIcon;
  @Prop() slidePauseIcon;

  @Prop() ariaPauseAnimation;
  @Prop() ariaPlayAnimation;
  @Prop() ariaBulletButton;

  @State() sliderBullets = [];
  @State() sliderCounts;
  @State() sliderPosition = 0;
  @State() slidesLi;
  @State() isAutoPlaying = false;
  @State() isTransitionRunning = false;

  componentWillLoad() {
    this.arrayDataWatcher(this.slides);

    setTimeout(() => {
      this.getSliderInfo();
      this.computeBullets();
      this.setSliderPosition(this.sliderPosition);
      this.handleAutoSlide();
    }, 0);
  }

  getSliderInfo() {
    this.sliderCounts = this.el.shadowRoot.querySelectorAll('.slider__li').length;
    this.slidesLi = this.el.shadowRoot.querySelectorAll('.slider__li');
  }

  setSliderPosition(index) {

    if (this.isTransitionRunning) {
      window.clearInterval(this.sliderTimer);
      this.sliderPosition = index;

      setTimeout(() => {
        this.setSliderPosition(this.sliderPosition);
        this.handleAutoSlide();
      }, 500)
    } else {

      this.isTransitionRunning = true;
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

          this.isTransitionRunning = false;
        });
      }, 500);
    }
  }

  computeBullets() {
    for (let i = 0; i < this.sliderCounts; i++) {
      this.sliderBullets.push(i);
    }
  }

  selectSlide(index: number) {
    this.setSliderPosition(index);

    window.clearInterval(this.sliderTimer);
    this.sliderPosition = index;

    this.handleAutoSlide();
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

  forceFocus(index: number, event: KeyboardEvent) {
    if (event.key === 'Enter') {
      setTimeout(() => {
        this.el.shadowRoot.querySelectorAll('.slider__li')[index].querySelector('a').focus();
      }, 100);
    }
  }

  render() {

    return [
      <div class="slider" role="application">

        {this.isAutoSlide ? (
          <div class='slider-play-pause-container'>
            <button
              part='slider-play-pause'
              class='slider-play-pause'
              onClick={this.playPauseAnimation.bind(this)}
              aria-label={this.isAutoPlaying ?  this.ariaPlayAnimation : this.ariaPauseAnimation}>
                <img aria-hidden='true' class='play' src={this.slidePlayIcon} alt=""/>
                <img aria-hidden='true' class='pause' src={this.slidePauseIcon} alt=""/>
            </button>
          </div>
        ) : (
          ''
        )}

        <div class="slider-items">

          <div class='slider-frame' style={{'background-image': `url(${this._slides[0].imgPath})`}}>
          </div>

          <ul class="slider__ul">
            {this._slides?.map((slide) => (
              <li class="slider__li">
                <a class='slider__link' href={ slide.link } target="_blank" tabindex="-1">
                  <span class='slider-overlay'></span>
                  <span class="slider__bg" style={{'background-image': `url(${slide.imgPath})`}}></span>
                  <p part="slider-desc" class='slider__desc'> { slide.title } </p>
                </a>
              </li>
            ))}
          </ul>

        </div>

        {this.isSlideBullet ? (
          <div part='slider-bullets' class="slider-bullets">
            <ul class="slider-bullets__ul">
              {this.sliderBullets?.map(index => (
                <li class="slider-bullets__li active">
                  <button
                    class={this.sliderPosition === index ? 'btn-active' : null}
                    part={this.sliderPosition === index ? 'bullet-btn bullet-btn-active' : 'bullet-btn'}
                    onClick={this.selectSlide.bind(this, index)}
                    onKeyPress={this.forceFocus.bind(this, index)}
                    aria-label={`${this.ariaBulletButton} ${index + 1}`} >
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
