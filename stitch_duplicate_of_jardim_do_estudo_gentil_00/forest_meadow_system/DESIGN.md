---
name: Forest Meadow System
colors:
  surface: '#fafaf4'
  surface-dim: '#dadad5'
  surface-bright: '#fafaf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4ee'
  surface-container: '#eeeee8'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e3e3dd'
  on-surface: '#1a1c19'
  on-surface-variant: '#434840'
  inverse-surface: '#2f312d'
  inverse-on-surface: '#f1f1eb'
  outline: '#73796f'
  outline-variant: '#c3c8bd'
  surface-tint: '#496640'
  primary: '#36522e'
  on-primary: '#ffffff'
  primary-container: '#4d6a44'
  on-primary-container: '#c7e9b9'
  inverse-primary: '#afd0a2'
  secondary: '#805533'
  on-secondary: '#ffffff'
  secondary-container: '#fdc39a'
  on-secondary-container: '#794e2e'
  tertiary: '#4c4b40'
  on-tertiary: '#ffffff'
  tertiary-container: '#646357'
  on-tertiary-container: '#e2dfd0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#caecbc'
  primary-fixed-dim: '#afd0a2'
  on-primary-fixed: '#072104'
  on-primary-fixed-variant: '#324e2a'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#f4bb92'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#653d1e'
  tertiary-fixed: '#e6e3d3'
  tertiary-fixed-dim: '#c9c7b8'
  on-tertiary-fixed: '#1c1c13'
  on-tertiary-fixed-variant: '#48473c'
  background: '#fafaf4'
  on-background: '#1a1c19'
  surface-variant: '#e3e3dd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  card-gap: 20px
  section-margin: 40px
  max-content-width: 1200px
---

## Brand & Style

This design system is built on the principles of **Cottagecore** and **Kawaii** (fofo) aesthetics, designed to create a "safe space" for productivity. The personality is gentle, encouraging, and whimsical—evoking the feeling of a warm cup of tea in a sunlit forest burrow.

The style blends **Tactile / Skeuomorphic** elements with **Modern Minimalism**. It utilizes soft, organic shapes that mimic hand-drawn sketches, paired with a sophisticated "Animal Crossing-esque" dashboard feel. 

Visual motifs center around the "Burrow" concept:
- **Rabbit & Forest motifs:** Subtle leaf patterns, carrot icons, and rounded ear shapes on containers.
- **Hand-drawn touches:** UI borders and icons have a slight "wiggle" or organic variance to avoid looking cold and digital.
- **Nurturing Atmosphere:** The interface prioritizes comfort over clinical efficiency, using "fofo" elements to lower study-induced anxiety.

## Colors

The palette is derived from natural forest elements, ensuring a low-strain reading environment.

- **Primary (Forest Moss):** A deep, earthy green used for primary navigation and success states.
- **Secondary (Warm Bark):** A rich wood brown used for structural elements, headers, and borders.
- **Neutral (Sweet Cream):** The primary canvas color, replacing harsh whites with a soft, paper-like tone.
- **Accent (Terracotta):** A warm, sun-baked orange used for alerts, notifications, and high-priority tasks.

### Background & Overlays
To achieve the "burrow" depth, the design system utilizes background image tokens.
- **Texture Overlays:** A subtle paper or linen grain is applied at `40%` opacity over all cream surfaces.
- **Environmental Brightness:** Background images (forest scenes or burrow interiors) are capped at `95%` brightness to ensure text legibility remains the priority.

## Typography

The typography strategy focuses on friendliness and readability. By using **Plus Jakarta Sans** for headlines, we provide a soft but modern structure. **Be Vietnam Pro** offers a contemporary yet warm body experience, while **Quicksand** brings a "kawaii" roundedness to smaller labels and metadata.

Hierarchy should be established through weight rather than extreme size shifts to maintain a calm, non-aggressive layout. Use the `display-lg` token sparingly for welcome messages or milestone achievements.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy that resembles a cozy desk arrangement. 

- **Desktop:** A 12-column centered grid with a maximum width of `1200px`. 
- **Margins:** Generous outer margins (safe areas) are required to let the background burrow illustrations breathe.
- **Card-Based Architecture:** Information is strictly organized into floating cards. These cards should have varying heights to create a "scrapbook" or "bullet journal" feel.
- **Rhythm:** An 8px base unit drives all spacing. For a "cozy" feel, use larger internal padding within cards (`24px`) to avoid information density overload.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**.

- **Surfaces:** Use three tiers of cream. The base background is the darkest cream, primary cards are the mid-tone, and "active" or "pop-out" elements use the lightest, brightest cream.
- **Shadows:** Avoid black shadows. Use a "Warm Bark" (`#8B5E3C`) tint for shadows with high diffusion (blur) and low opacity (10-15%). This mimics soft, natural light entering a burrow.
- **Depth:** Elements should feel "placed" on a wooden surface rather than "hovering" in digital space.

## Shapes

The shape language is dominated by **Large Radii**. 

- **Standard Containers:** Use the `rounded-lg` (1rem) token for standard cards.
- **Interactive Elements:** Buttons and selection chips use `rounded-xl` (1.5rem) or full pill shapes to feel "squishy" and inviting.
- **Organic Variance:** Where possible, use CSS `border-radius` with slightly different values for each corner (e.g., `24px 28px 22px 30px`) to mimic a hand-drawn, "fofo" aesthetic.

## Components

### Buttons
Primary buttons should be Forest Moss with Sweet Cream text. They feature a soft, subtle inner glow on top to give them a "cushion" look. On press, they should physically depress using a 2px downward translation.

### Cards & Modules
Every card must have a "header" area, often accompanied by a small hand-drawn icon (e.g., a leaf, a book, or a rabbit). Use a subtle 1px dashed border in Warm Bark to denote "note-taking" areas.

### Input Fields
Inputs should look like paper strips. They use the lightest cream background with a "pencil-drawn" bottom border. The focus state is a soft Terracotta glow.

### Progress Indicators
Progress bars are styled as "growing vines" or "filling honey jars." Avoid clinical blue bars; use shades of Green or Terracotta for a natural, organic feel.

### Chips & Tags
Used for study subjects. These should resemble small wooden plaques or embroidered patches with rounded corners and a slight drop shadow.