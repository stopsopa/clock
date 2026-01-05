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

            if (oldValue !== null && this.shadowRoot && this.shadowRoot.getElementById('digit-container')) {
                this._animate();
            } else if (this.shadowRoot && this.shadowRoot.getElementById('digit-container')) {
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
        const ids = ['top-static', 'bottom-static', 'flap-front-text', 'flap-back-text'];
        ids.forEach(id => {
            const el = this.shadowRoot.getElementById(id);
            if (el) el.textContent = val;
        });
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

                /* Target Gradient Overlay for physical cross-fade */
                .gradient-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    /* Initial: Match falling top half (#333 -> #000) */
                    background: linear-gradient(to bottom, #333 0%, #000 100%);
                    opacity: 0;
                    z-index: 5;
                    pointer-events: none;
                }

                /* During flip, the back of the flap starts bright and fades to dark */
                .flipping .flap-back .gradient-overlay {
                    animation: gradient-crossfade 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                @keyframes gradient-crossfade {
                    0% { opacity: 1; }  /* Start bright (top segment style) */
                    100% { opacity: 0; } /* End hidden (revealing the dark bottom) */
                }

                /* Unified Shadow logic */
                .shadow {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: #000;
                    pointer-events: none;
                    z-index: 10;
                    opacity: 0;
                }
                
                /* Animation Shadows - No static part animations to prevent pulsing */
                .flipping .flap-front .shadow {
                    animation: shadow-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .flipping .flap-back .shadow {
                    animation: shadow-fade-out 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                @keyframes shadow-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes shadow-fade-out { 0% { opacity: 1; } 100% { opacity: 0; } }

                /* Standardized Hinge Junction */
                .hinge {
                    position: absolute;
                    top: 50%; left: 0; width: 100%; height: 2px;
                    background: #111;
                    z-index: 20;
                    transform: translateY(-50%);
                    /* Subtle depth shadow */
                    box-shadow: 0 1px 1px rgba(255,255,255,0.05);
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
                        <div class="gradient-overlay"></div>
                        <div class="shadow"></div>
                    </div>
                </div>
                <div class="hinge"></div>
            </div>
        `;
        this._updateFontScaling();
    }

    _updateFontScaling() {
        const height = this.offsetHeight;
        const width = this.offsetWidth;
        if (!height || !width) return;

        const texts = this.shadowRoot.querySelectorAll('.text');
        // Font size should be slightly smaller than the container height/width
        const fontSize = Math.min(height * 0.85, width * 1.1);
        
        const hfont = parseFloat(this.getAttribute('hfont')) || 0;
        // Map -100 to 100 range to a percentage of font size
        // 100 means move down by font size, -100 means move up by font size
        // Actually the user wants to "control height of the font", usually meaning vertical offset.
        // Let's use it as a percentage shift.
        const verticalOffset = (hfont / 100) * (fontSize * 0.5);

        texts.forEach(t => {
            t.style.height = `${height}px`;
            t.style.lineHeight = `${height}px`;
            t.style.fontSize = `${fontSize}px`;
            t.style.transform = `translateY(${verticalOffset}px)`;
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
        void container.offsetWidth; // Force reflow
        container.classList.add('flipping');

        // Snap at exactly 600ms to match the CSS animation completion
        this._animationTimeout = setTimeout(() => {
            this._syncAllText(this._digit);
            container.classList.remove('flipping');
            this._animationTimeout = null;
        }, 600); 
    }
}

customElements.define('flap-digit', FlapDigit);
