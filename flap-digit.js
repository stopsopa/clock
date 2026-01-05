export class FlapDigit extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._digit = '0';
        this._prevDigit = '0';
        this._isAnimating = false;
    }

    static get observedAttributes() {
        return ['digit'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'digit' && oldValue !== newValue) {
            this._prevDigit = oldValue || '0';
            this._digit = newValue;
            this._animate();
        }
    }

    connectedCallback() {
        this._render();
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                    width: 100%;
                    height: 100%;
                    perspective: 1000px;
                    background-color: transparent;
                }

                .flap-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                }

                .segment {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 50%;
                    background: #2c2c2c;
                    color: #f0f0f0;
                    overflow: hidden;
                    border-radius: 4px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Courier New', Courier, monospace;
                    font-weight: bold;
                    backface-visibility: hidden;
                }

                /* Text scaling logic */
                .text {
                    position: absolute;
                    width: 100%;
                    height: 200%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: clamp(20px, 15vh, 200px); /* Responsive font size */
                }

                .top {
                    top: 0;
                    border-bottom: 1px solid rgba(0,0,0,0.5);
                    transform-origin: bottom;
                }

                .bottom {
                    bottom: 0;
                    border-top: 1px solid rgba(255,255,255,0.05); /* Subtle highlight */
                    transform-origin: top;
                }

                .bottom .text {
                    transform: translateY(-50%);
                }

                /* 3D Flap */
                .flap {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 50%;
                    z-index: 3;
                    transform-style: preserve-3d;
                    transform-origin: bottom;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .flap-front, .flap-back {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    background: #2c2c2c;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .flap-back {
                    transform: rotateX(180deg);
                }

                .flap-back .text {
                    transform: translateY(-50%);
                }

                /* Animation state */
                .flipping .flap {
                    transform: rotateX(-180deg);
                }

                /* Shadow logic for 3D effect */
                .shadow {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.6);
                    opacity: 0;
                    transition: opacity 0.6s;
                    pointer-events: none;
                    z-index: 5;
                }

                .flipping .flap-front .shadow { opacity: 0.8; }
                .flipping .bottom .shadow {
                    animation: shadow-reveal 0.6s forwards;
                }

                @keyframes shadow-reveal {
                    0% { opacity: 1; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }

                /* Center line hinge decoration */
                .hinge {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: #111;
                    z-index: 10;
                    transform: translateY(-50%);
                }
            </style>
            <div id="digit-container" class="flap-container">
                <div class="segment top">
                    <div class="text" id="top-static">${this._digit}</div>
                </div>
                <div class="segment bottom">
                    <div class="text" id="bottom-static">${this._prevDigit}</div>
                    <div class="shadow"></div>
                </div>
                <div class="flap" id="animated-flap">
                    <div class="flap-front segment top">
                        <div class="text" id="flap-front-text">${this._prevDigit}</div>
                        <div class="shadow"></div>
                    </div>
                    <div class="flap-back segment bottom">
                        <div class="text" id="flap-back-text">${this._digit}</div>
                    </div>
                </div>
                <div class="hinge"></div>
            </div>
        `;
        this._updateFontScaling();
    }

    _updateFontScaling() {
        const height = this.offsetHeight;
        const texts = this.shadowRoot.querySelectorAll('.text');
        // Non-proportional scaling awareness
        texts.forEach(t => {
            t.style.height = `${height}px`;
            t.style.lineHeight = `${height}px`;
        });
    }

    _animate() {
        const container = this.shadowRoot.getElementById('digit-container');
        if (!container) return;

        const topStatic = this.shadowRoot.getElementById('top-static');
        const bottomStatic = this.shadowRoot.getElementById('bottom-static');
        const flapFront = this.shadowRoot.getElementById('flap-front-text');
        const flapBack = this.shadowRoot.getElementById('flap-back-text');

        // Setup for flip
        topStatic.textContent = this._digit;
        bottomStatic.textContent = this._prevDigit;
        flapFront.textContent = this._prevDigit;
        flapBack.textContent = this._digit;

        container.classList.remove('flipping');
        void container.offsetWidth; // Force reflow
        container.classList.add('flipping');

        setTimeout(() => {
            bottomStatic.textContent = this._digit;
            container.classList.remove('flipping');
        }, 600);
    }
}

customElements.define('flap-digit', FlapDigit);
