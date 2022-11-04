import {Component, h, State, Element, Watch} from "@stencil/core";

@Component({
  tag: 'ip-slider',
  styleUrl: './ip-slider.scss',
  shadow: true
})
export class IpSlider {

  @Element() el: HTMLElement;
  @State() slides;

  private _myElems: any;

  @State() test = [];


  @Watch('test')
  arrayDataWatcher(newValue: any | string) {
    if (typeof newValue === 'string') {
      this._myElems = JSON.parse(newValue);
    } else {
      this._myElems = newValue;
    }
  }

  componentWillLoad() {

    this.arrayDataWatcher(this.test);

    setTimeout(() => {
      this.el.querySelectorAll('[slot]').forEach((elem) => {
        this.test.push(elem.getAttribute('slot'));
      });
    },100);
  }

  componentWillUpdate() {

  }

  previous() {
    console.log('previous');
  }

  next() {
    console.log('next');
  }

  render() {

    return [
      <div class='ip-slider'>
          <button onClick={this.previous.bind(this)}>Previous</button>

          <button onClick={this.next.bind(this)}>Next</button>

          <div>
            {
              this._myElems?.map(() => (
                <div part="acc-panel" class="ip-acc-panel">
                  {<div part="acc-header" class="js-acc-button">
                    <button>
                      <p>Hello</p>
                    </button>
                  </div>}

                </div>
              ))
            }
          </div>

      </div>
    ]

  }
}
