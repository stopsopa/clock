# Split-Flap Clock Application Plan

This document outlines the plan for creating a single-file split-flap clock web application.

## Overview

The application will be a modern, visually appealing split-flap clock contained within a single `index.html` file. It will display the time in HH:MM:SS format and allow users to toggle between 12-hour (AM/PM) and 24-hour formats.

## Features

- **Split-Flap Animation**: Smooth, realistic flap animations for each digit.
- **HH:MM:SS Format**: Accurate time display with seconds.
- **Format Toggle**: Radio buttons to switch between AM/PM and 24-hour modes.
- **Web Component Digit**: Each digit is a custom `<flap-digit>` element.
- **Extreme Scalability**: Digits are designed to be fluid and can be scaled out of proportion (non-uniform scaling) via CSS.

## Technical Specification

### 1. HTML Structure

A single `index.html` file will contain:

- A responsive container for the clock.
- Custom elements: `<flap-digit digit="0">` (8 instances for HH:MM:SS plus AM/PM if needed).
- A controls section with radio buttons for 12h/24h selection.
- An AM/PM indicator.

### 2. CSS Design & Aesthetics

- **Fluid Layout**: Use `flex` or `grid` with `100%` width/height to allow the `<flap-digit>` to fill its container regardless of aspect ratio.
- **Color Palette**: A curated, premium color palette (e.g., deep charcoal and ivory).
- **Split-Flap Styling**:
  - Divided cards using absolute positioning (top: 0/bottom: 0) to ensure they always fill the component's boundaries.
  - CSS 3D transforms (`rotateX`) for the flipping animation.
- **Non-Proportional Scaling**: Elements within the component (flap halves, numbers) will use percentage-based dimensions or `object-fit: fill` logic to ensure they stretch as the parent container dictates.

### 3. JavaScript Implementation

- **Web Component Class (`FlapDigit`)**:
  - Encapsulated logic for state management and animation.
  - Observed attribute `digit` to trigger flipping animations when changed.
  - Agnostic of context: simply animates between 0-9.
  - Shadow DOM for styling isolation and layout control.
- **Time Logic**:
  - `setInterval` to update the `digit` attribute of each `<flap-digit>` component.
  - Centralized time formatting logic (12h/24h).
- **Toggle Logic**:
  - Event listeners on radio buttons to update the clock display mode instantly.

## Implementation Steps

1. Create the basic HTML structure with placeholders for digits.
2. Design the CSS for a static "split-flap" look.
3. Implement the CSS animation for flipping cards.
4. Write JS to update the digits based on the current system time.
5. Add the format toggle logic and AM/PM visualization.
