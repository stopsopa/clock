export class FlapDigit extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._digit = "0";
    this._prevDigit = "0";
    this._isAnimating = false;
  }

  static get observedAttributes() {
    return ["digit"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "digit" && oldValue !== newValue) {
      this._prevDigit = oldValue || "0";
      this._digit = newValue;
      this._render();
    }
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const isFirstRender = !this.shadowRoot.innerHTML;

    if (isFirstRender) {
      this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        position: relative;
                        perspective: 400px;
                        width: 100%;
                        height: 100%;
                    }
                    .card {
                        position: absolute;
                        left: 0;
                        right: 0;
                        background: #333;
                        color: #eee;
                        font-family: 'Courier New', Courier, monospace;
                        font-weight: bold;
                        text-align: center;
                        overflow: hidden;
                        border-radius: 4px;
                        font-size: 100px; /* Base size, adjusted via flex/box */
                    }
                    .top {
                        top: 0;
                        height: 50%;
                        line-height: 15vh; /* Adjusted for scaling */
                        border-bottom: 1px solid rgba(0,0,0,0.5);
                        z-index: 2;
                    }
                    .bottom {
                        bottom: 0;
                        height: 50%;
                        line-height: 0;
                        z-index: 1;
                    }
                    .flap {
                        position: absolute;
                        left: 0;
                        width: 100%;
                        height: 50%;
                        background: #333;
                        overflow: hidden;
                        transform-origin: bottom;
                        transition: transform 0.6s ease-in;
                        z-index: 3;
                        border-radius: 4px;
                    }
                    .flap.top {
                        top: 0;
                        line-height: 15vh;
                        z-index: 4;
                    }
                    .flap.bottom {
                        top: 50%;
                        transform-origin: top;
                        line-height: 0;
                        transform: rotateX(90deg);
                        z-index: 3;
                    }
                    
                    /* Non-proportional scaling magic */
                    .content {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 200%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform: translateY(0);
                    }
                    .bottom .content {
                        transform: translateY(-50%);
                    }
                    
                    .flipping .flap.top {
                        transform: rotateX(-90deg);
                    }
                    .flipping .flap.bottom {
                        transform: rotateX(0deg);
                        transition: transform 0.3s ease-out 0.3s;
                    }
                </style>
                <div id="container" class="card-container">
                    <div class="card top"><div class="content">${this._digit}</div></div>
                    <div class="card bottom"><div class="content">${this._prevDigit}</div></div>
                    <div class="flap top"><div class="content">${this._prevDigit}</div></div>
                    <div class="flap bottom"><div class="content">${this._digit}</div></div>
                </div>
            `;
      this._updateLineHeight();
    }

    if (!isFirstRender && this._digit !== this._prevDigit) {
      this._animate();
    }
  }

  _updateLineHeight() {
    const height = this.offsetHeight;
    const topElements = this.shadowRoot.querySelectorAll(".top");
    topElements.forEach((el) => {
      el.style.lineHeight = `${height}px`;
    });
  }

  _animate() {
    const container = this.shadowRoot.getElementById("container");
    const topStatic = this.shadowRoot.querySelector(".card.top .content");
    const bottomStatic = this.shadowRoot.querySelector(".card.bottom .content");
    const topFlap = this.shadowRoot.querySelector(".flap.top .content");
    const bottomFlap = this.shadowRoot.querySelector(".flap.bottom .content");

    this._updateLineHeight();

    // Prepare for animation
    topStatic.textContent = this._digit;
    bottomStatic.textContent = this._prevDigit;
    topFlap.textContent = this._prevDigit;
    bottomFlap.textContent = this._digit;

    container.classList.remove("flipping");
    void container.offsetWidth; // Trigger reflow
    container.classList.add("flipping");

    setTimeout(() => {
      bottomStatic.textContent = this._digit;
      container.classList.remove("flipping");
    }, 600);
  }
}

customElements.define("flap-digit", FlapDigit);
