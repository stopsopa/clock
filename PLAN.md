# Split-Flap Clock Application Plan (v2 - 3D Focus)

This document outlines the plan for creating a single-page split-flap clock with authentic 3D mechanical rendering.

## Overview

The application will centered around a series of custom `<flap-digit>` Web Components. These components will simulate the physical mechanics of a split-flap display, prioritizing depth, lighting, and mechanical motion.

## Core Requirements

- **Authentic 3D Flaps**: Render segments as physical planes with depth, using a multi-layer approach to simulate flipping from one digit to the next.
- **Scalability**: Each digit must be a Web Component that can be scaled non-proportionally (horizontal/vertical independent) while maintaining its 3D aesthetic.
- **ESM Architecture**: The code will be split into a main `index.html` and a separate `flap-digit.js` module.
- **12/24h Toggle**: Radio buttons to switch between 24-hour and AM/PM formats.
- **Single Page**: No backend required, just a clean, single-file frontend experience (plus the JS module).

## Technical Specification

### 1. 3D Mechanical Rendering

- **Geometry**:
  - Each digit consists of a static top-half, a static bottom-half, and rotating flap segments.
  - Flaps will be modeled as 3D objects using `preserve-3d` to ensure the front and back faces are rendered correctly in 3D space.
- **Animations**:
  - Avoid simple flat transforms. Use `rotateX` with a clear pivot point to simulate a mechanical falling flap.
  - Implement "shadow gradients" that darken the flap as it transitions through the vertical position to simulate light blocking.
- **Skeumorphism**:
  - Use subtle gradients and CSS `box-shadow` (inset and outset) to create the appearance of plastic/metal flaps.
  - Ensure the "hinge" area has visual depth.

### 2. Web Component (`<flap-digit>`)

- **Interface**: `<flap-digit digit="5">`.
- **Functionality**:
  - Agnostic of time context (doesn't know if it's an hour or minute).
  - Animate sequentially between 0-9 and loop back to 0.
  - Expose a CSS API for color and scaling.
- **Fluid Layout**:
  - The component will use percentage-based dimensions or `calc()` to ensure it fills any container width/height without losing 3D perspective.

### 3. Application Logic

- **Module Script**: `index.html` will load the component via `<script type="module" src="flap-digit.js">`.
- **Clock Engine**: A centralized `setInterval` in `index.html` will parse the system time and update individual `digit` attributes.
- **Format Toggle**: Update the `digit` values and AM/PM labels based on the selected format radio button.

## Implementation Steps

1. **Design 3D Flap Structure**: Prototype the CSS for a multi-plane 3D flap in isolation.
2. **Develop Web Component**: Build `flap-digit.js` with attribute observation and the 3D mechanical logic.
3. **Assemble Main UI**: Create `index.html` with the clock container, format controls, and responsiveness.
4. **Refine Visuals**: Fine-tune the 3D lighting, shadows, and non-proportional scaling behavior.
