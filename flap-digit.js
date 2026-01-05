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
            const val = newValue || '0';
            const old = oldValue || this._digit || '0';
            
            this._prevDigit = old;
            this._digit = val;

            if (oldValue !== null && this.shadowRoot && this.shadowRoot.getElementById('digit-container')) {
                this._animate();
            } else if (this.shadowRoot && this.shadowRoot.getElementById('digit-container')) {
                this._syncAllText(this._digit);
            }
        }
    }

    connectedCallback() {
        this._render();
        // Ensure values are synced after render
        this._syncAllText(this._digit);
    }

    _syncAllText(val) {
        const ids = ['top-static', 'bottom-static', 'flap-front-text', 'flap-back-text'];
        ids.forEach(id => {
            const el = this.shadowRoot.getElementById(id);
            if (el) el.textContent = val;
        });
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    position: relative;
                    width: 100px;
                    height: 140px;
                    perspective: 400px;
                    background-color: transparent;
                }

                .flap-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                    background-color: #1a1a1a;
                    border-radius: 6px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.8);
                }

                .segment {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 50%;
                    background: #222;
                    color: #d0d0d0;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    font-weight: 800;
                    backface-visibility: hidden;
                    box-sizing: border-box;
                }

                .text {
                    position: absolute;
                    width: 100%;
                    height: 200%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 80px; 
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }

                .top {
                    top: 0;
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                    border-bottom: 1px solid rgba(0,0,0,0.4);
                    background: linear-gradient(to bottom, #2c2c2c 0%, #222 100%);
                }

                .bottom {
                    bottom: 0;
                    border-bottom-left-radius: 6px;
                    border-bottom-right-radius: 6px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: linear-gradient(to bottom, #1a1a1a 0%, #111 100%);
                }

                .top .text { top: 0; }
                .bottom .text { bottom: 0; }

                /* 3D Flap */
                .flap {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 50%;
                    z-index: 5;
                    transform-style: preserve-3d;
                    transform-origin: bottom;
                    pointer-events: none;
                    transform: rotateX(0deg);
                }

                .flipping .flap {
                    animation: flip-main 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                @keyframes flip-main {
                    0% { transform: rotateX(0deg); }
                    100% { transform: rotateX(-180deg); }
                }

                .flap-front, .flap-back {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .flap-front {
                    background: linear-gradient(to bottom, #2c2c2c 0%, #222 100%);
                    z-index: 2;
                }

                .flap-back {
                    transform: rotateX(180deg);
                    background: linear-gradient(to top, #1a1a1a 0%, #111 100%);
                    z-index: 1;
                }

                .flap-front .text { top: 0; }
                .flap-back .text { bottom: 0; }

                /* Shadow logic for 3D effect */
                .shadow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    opacity: 0;
                    pointer-events: none;
                    z-index: 10;
                }

                .bottom-static .shadow {
                    opacity: 0.1; /* Constant subtle shadow at hinge */
                }

                /* Animation state: shadows sync with rotation */
                .flipping .top-static .shadow {
                    animation: shadow-reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .flipping .bottom-static .shadow {
                    animation: shadow-cover 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .flipping .flap-front .shadow {
                    animation: shadow-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .flipping .flap-back .shadow {
                    animation: shadow-fade-out 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                @keyframes shadow-reveal {
                    0% { opacity: 0.8; }
                    100% { opacity: 0; }
                }

                @keyframes shadow-cover {
                    0% { opacity: 0.1; }
                    100% { opacity: 0.8; }
                }

                @keyframes shadow-fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }

                @keyframes shadow-fade-out {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }

                /* Center line hinge decoration */
                .hinge {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: #000;
                    z-index: 20;
                    transform: translateY(-50%);
                }
            </style>
            <div id="digit-container" class="flap-container">
                <div class="segment top top-static">
                    <div class="text" id="top-static">${this._digit}</div>
                    <div class="shadow"></div>
                </div>
                <div class="segment bottom bottom-static">
                    <div class="text" id="bottom-static">${this._digit}</div>
                    <div class="shadow"></div>
                </div>
                <div class="flap" id="animated-flap">
                    <div class="flap-front segment top">
                        <div class="text" id="flap-front-text">${this._digit}</div>
                        <div class="shadow"></div>
                    </div>
                    <div class="flap-back segment bottom">
                        <div class="text" id="flap-back-text">${this._digit}</div>
                        <div class="shadow"></div>
                    </div>
                </div>
                <div class="hinge"></div>
            </div>
        `;
        this._updateFontScaling();
    }

    _updateFontScaling() {
        const height = this.offsetHeight || 140;
        const width = this.offsetWidth || 100;
        const texts = this.shadowRoot.querySelectorAll('.text');
        const fontSize = Math.min(height * 0.8, width * 1.2);
        
        texts.forEach(t => {
            t.style.height = `${height}px`;
            t.style.lineHeight = `${height}px`;
            t.style.fontSize = `${fontSize}px`;
        });
    }

    _animate() {
        if (this._digit === this._prevDigit) return;

        const container = this.shadowRoot.getElementById('digit-container');
        if (!container) return;

        const topStatic = this.shadowRoot.getElementById('top-static');
        const bottomStatic = this.shadowRoot.getElementById('bottom-static');
        const flapFront = this.shadowRoot.getElementById('flap-front-text');
        const flapBack = this.shadowRoot.getElementById('flap-back-text');

        if (this._animationTimeout) {
            clearTimeout(this._animationTimeout);
        }

        // Setup for flip
        topStatic.textContent = this._digit;
        bottomStatic.textContent = this._prevDigit;
        flapFront.textContent = this._prevDigit;
        flapBack.textContent = this._digit;

        container.classList.remove('flipping');
        void container.offsetWidth; 
        container.classList.add('flipping');

        this._animationTimeout = setTimeout(() => {
            this._syncAllText(this._digit);
            container.classList.remove('flipping');
            this._animationTimeout = null;
        }, 600);
    }
}

customElements.define('flap-digit', FlapDigit);
