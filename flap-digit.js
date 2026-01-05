export class FlapDigit extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._digit = '0';
        this._prevDigit = '0';
        this._isAnimating = false;
        this._resizeObserver = new ResizeObserver(() => this._updateFontScaling());
    }

    static get observedAttributes() {
        return ['digit', 'font', 'hfont'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'digit' && oldValue !== newValue) {
            const val = newValue || '0';
            const old = oldValue || this._digit || '0';
            
            this._prevDigit = old;
            this._digit = val;

            if (oldValue !== null && this.shadowRoot && this._container) {
                this._animate();
            } else if (this.shadowRoot && this._container) {
                this._syncAllText(this._digit);
            }
        } else if (name === 'font' && oldValue !== newValue) {
            this._updateFont();
        } else if (name === 'hfont' && oldValue !== newValue) {
            this._updateFontScaling();
        }
    }

    connectedCallback() {
        this._render();
        this._updateFont();
        this._syncAllText(this._digit);
        this._resizeObserver.observe(this);
    }

    disconnectedCallback() {
        this._resizeObserver.disconnect();
    }

    _syncAllText(val) {
        if (!this._elements) return;
        this._elements.topStatic.textContent = val;
        this._elements.bottomStatic.textContent = val;
        this._elements.flapFrontText.textContent = val;
        this._elements.flapBackText.textContent = val;
    }

    _updateFont() {
        const font = this.getAttribute('font');
        if (font) {
            this.style.setProperty('--digit-font', font);
        } else {
            this.style.removeProperty('--digit-font');
        }
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    position: relative;
                    width: 100px;
                    height: 140px;
                    perspective: 500px;
                    background-color: transparent;
                }

                .flap-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                    background-color: #1a1a1a;
                    border-radius: 6px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 10px rgba(0,0,0,0.5);
                }

                .segment {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 50%;
                    background: #222;
                    color: #f0f0f0;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: var(--digit-font);
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
                    font-family: var(--digit-font);
                    font-weight: 800;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }

                /* Fixed backgrounds - standardized for consistency */
                .top {
                    top: 0;
                    height: calc(50% - 1px);
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                    background: linear-gradient(to bottom, #333 0%, #1a1a1a 90%, #000 100%);
                }

                .bottom {
                    bottom: 0;
                    height: calc(50% - 1px);
                    border-bottom-left-radius: 6px;
                    border-bottom-right-radius: 6px;
                    background: linear-gradient(to bottom, #000 10%, #1a1a1a 100%);
                }

                .top .text { top: 0; }
                .bottom .text { bottom: 0; }

                /* 3D Flap */
                .flap {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 50%;
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
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    backface-visibility: hidden;
                    overflow: hidden;
                }

                 .flap-front {
                    /* Matches .top segment perfectly */
                    height: calc(100% - 1px);
                    background: linear-gradient(to bottom, #333 0%, #1a1a1a 90%, #000 100%);
                    z-index: 2;
                }

                .flap-back {
                    transform: rotateX(180deg);
                    /* Matches .bottom segment perfectly after 180 flip */
                    height: calc(100% - 1px);
                    background: linear-gradient(to bottom, #000 10%, #1a1a1a 100%);
                    z-index: 1;
                }

                .flap-front .text { top: 0; }
                .flap-back .text { bottom: 0; }




            </style>
            <div id="digit-container" class="flap-container">
                <div class="segment top top-static">
                    <div class="text" id="top-static">${this._digit}</div>
                </div>
                <div class="segment bottom bottom-static">
                    <div class="text" id="bottom-static">${this._digit}</div>
                </div>
                <div class="flap" id="animated-flap">
                    <div class="flap-front segment top">
                        <div class="text" id="flap-front-text">${this._digit}</div>
                    </div>
                    <div class="flap-back segment bottom">
                        <div class="text" id="flap-back-text">${this._digit}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Cache DOM references
        this._container = this.shadowRoot.getElementById('digit-container');
        this._elements = {
            topStatic: this.shadowRoot.getElementById('top-static'),
            bottomStatic: this.shadowRoot.getElementById('bottom-static'),
            flapFrontText: this.shadowRoot.getElementById('flap-front-text'),
            flapBackText: this.shadowRoot.getElementById('flap-back-text'),
            texts: this.shadowRoot.querySelectorAll('.text')
        };

        this._updateFontScaling();
    }

    _updateFontScaling() {
        if (this._scalingRequested) return;
        this._scalingRequested = true;

        requestAnimationFrame(() => {
            this._scalingRequested = false;
            const height = this.offsetHeight;
            const width = this.offsetWidth;
            if (!height || !width || !this._elements) return;

            // Font size should be slightly smaller than the container height/width
            const fontSize = Math.min(height * 0.85, width * 1.1);
            
            const hfont = parseFloat(this.getAttribute('hfont')) || 0;
            const verticalOffset = (hfont / 100) * (fontSize * 0.5);

            this._elements.texts.forEach(t => {
                t.style.height = `${height}px`;
                t.style.lineHeight = `${height}px`;
                t.style.fontSize = `${fontSize}px`;
                t.style.transform = `translateY(${verticalOffset}px)`;
            });
        });
    }

    _animate() {
        if (this._digit === this._prevDigit || !this._container) return;

        if (this._animationTimeout) {
            clearTimeout(this._animationTimeout);
            this._syncAllText(this._prevDigit); // Sync to old value first to ensure consistent state
            this._container.classList.remove('flipping');
            void this._container.offsetWidth;
        }

        // Setup for flip
        this._elements.topStatic.textContent = this._digit;
        this._elements.bottomStatic.textContent = this._prevDigit;
        this._elements.flapFrontText.textContent = this._prevDigit;
        this._elements.flapBackText.textContent = this._digit;

        this._container.classList.add('flipping');

        // Snap at exactly 600ms to match the CSS animation completion
        this._animationTimeout = setTimeout(() => {
            this._syncAllText(this._digit);
            this._container.classList.remove('flipping');
            this._animationTimeout = null;
        }, 600); 
    }
}

customElements.define('flap-digit', FlapDigit);
