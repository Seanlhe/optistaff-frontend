# Color Variables Reference

This document lists all CSS color variables used in the project, as defined in `styles.css`. The variables are grouped by their usage in pages/components and then by their variable names for easy reference.

---

## 1. Color Variables by Page/Component

### Sidebar / Navigation (e.g., ClientNav, AdminNav)

- `--color-primary-blue`
- `--color-primary-blue-hover`
- `--color-gradient-start`
- `--color-gradient-end`
- `--color-primary-text`
- `--color-secondary-text`
- `--color-border`
- `--color-card-color`

### Dashboard / Cards / Main Content

- `--color-card`
- `--color-card-foreground`
- `--color-card-color`
- `--color-bg`
- `--color-secondary-bg`
- `--color-tertiary-bg`
- `--color-primary-text`
- `--color-secondary-text`
- `--color-border-custom`
- `--color-hover`

### Buttons / Inputs / Forms

- `--color-primary`
- `--color-primary-foreground`
- `--color-secondary`
- `--color-secondary-foreground`
- `--color-accent`
- `--color-accent-foreground`
- `--color-input`
- `--color-ring`
- `--color-success`
- `--color-warning`
- `--color-error`

### Miscellaneous / Charts

- `--color-chart-1`
- `--color-chart-2`
- `--color-chart-3`
- `--color-chart-4`
- `--color-chart-5`

---

## 2. Color Variables Grouped by Name

### Primary Colors

- `--color-primary-blue`: hsl(210, 90%, 55%)
- `--color-primary-blue-hover`: (define as needed)
- `--color-primary`: hsl(240 5.9% 10%)
- `--color-primary-foreground`: hsl(0 0% 98%)
- `--color-primary-text`: hsl(0, 0%, 12%)

### Secondary Colors

- `--color-secondary-blue`: (define as needed)
- `--color-secondary`: hsl(240 4.8% 95.9%)
- `--color-secondary-foreground`: hsl(240 5.9% 10%)
- `--color-secondary-text`: hsl(0, 0%, 40%)
- `--color-secondary-bg`: oklch(0.93 0.02 262.44)

### Accent Colors

- `--color-accent-blue`: (define as needed)
- `--color-accent`: hsl(240 4.8% 95.9%)
- `--color-accent-foreground`: hsl(240 5.9% 10%)

### Backgrounds

- `--color-bg`: hsl(0, 0%, 99%)
- `--color-tertiary-bg`: oklch(0.96 0.01 262.41)
- `--color-background`: hsl(0 0% 100%)
- `--color-foreground`: hsl(240 10% 3.9%)

### Cards

- `--color-card`: hsl(0 0% 100%)
- `--color-card-foreground`: hsl(240 10% 3.9%)
- `--color-card-color`: hsl(0, 100%, 100%)

### Borders & Inputs

- `--color-border`: hsl(240 5.9% 90%)
- `--color-border-custom`: (define as needed)
- `--color-input`: hsl(240 5.9% 90%)
- `--color-ring`: hsl(240 10% 3.9%)

### Gradients

- `--color-gradient-start`: oklch(0.36 0.26 266.63)
- `--color-gradient-end`: oklch(0.65 0.18 267.37)

### Status Colors

- `--color-success`: hsl(142 65% 45%)
- `--color-warning`: hsl(38 80% 50%)
- `--color-error`: hsl(0 70% 55%)

### Miscellaneous

- `--color-landing-bg`: hsl(197, 60%, 86%)
- `--color-hover`: (define as needed)
- `--color-chart-1`: hsl(12 76% 61%)
- `--color-chart-2`: hsl(173 58% 39%)
- `--color-chart-3`: hsl(197 37% 24%)
- `--color-chart-4`: hsl(43 74% 66%)
- `--color-chart-5`: hsl(27 87% 67%)

---

> **Note:** Some variables (like `--color-primary-blue-hover`, `--color-secondary-blue`, `--color-accent-blue`, `--color-border-custom`, `--color-hover`) may need to be defined or refined further for full consistency across the app.
