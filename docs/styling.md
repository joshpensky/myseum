# Styling

## Themes

Many components in Myseum can change appearance based on theme. Themes are applied in two ways:

1. Via [`ThemeProvider`](../src/providers/ThemeProvider.tsx) and the `useTheme` hook
2. Via a theme class on a parent element, like `.theme--paper`

> The `ThemeProvider` and theme class should be used in conjunction **every** time to ensure the current theme can be referenced in both TS and SCSS.

There are five different themes:

- `paper` (default)
- `ink`
- `mint`
- `navy`
- `paper`

The follow CSS variables are available under each theme:

- `--c-bg`
- `--c-bg-tint`
- `--c-icon`
- `--c-text`
- `--c-secondary-text`
- `--c-border`
- `--c-shadow`
- `--c-highlight`

### Related Files

- [`providers/ThemeProvider.tsx`](../src/providers/ThemeProvider.tsx)
- [`styles/base/_theme.scss`](../src/styles/base/_theme.scss)

## Sizes

Sizes are defined using the `sz` function. This function imitates [Tailwind's spacing scale](https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale).

```scss
padding: sz(4); ///// 1rem      or 16px
padding: sz(1); ///// 0.25rem   or 4px
padding: sz(0.25); // 0.0625rem or 1px
padding: sz(-4); //// -1rem     or -16px;
```

### Related Files

- [`styles/functions/_sz.scss`](../src/styles/functions/_sz.scss)
- [`styles/_variables.scss`](../src/styles/_variables.scss)

## Colors

Colors are defined using the `c` function. This function allows us to pull in colors defined by the theme and adjust opacity on the fly:

```scss
color: c('bg'); ///////// rgba(var(--c-bg), 1);
color: c('text', 0.5); // rgba(var(--c-text), 0.5);
```

In addition to theme colors (see above), there are also a few root colors defined for use:

- `white`
- `black`
- `red`
- `yellow`

### Related Files

- [`styles/functions/_c.scss`](../src/styles/functions/_c.scss)
- [`styles/_variables.scss`](../src/styles/_variables.scss)
- [`styles/base/_theme.scss`](../src/styles/base/_theme.scss)

## Typography

🚧 TODO: add mixins + base/\_typography

## Accessibility

There are a few mixins included to assist with accessibility.

```scss
// Hide the element visually, but allow screen readers to still capture it
.visually-hidden {
  @include sr-only;
}

// Only animate when user has no motion preference
.animated-square {
  @include with-motion {
    animation: rotate-full...;
  }
}

// Remove the focus outline (safely)
.button:focus {
  @include outline-none;
  box-shadow: 0 0 0 2px c('border');
}
```

An `.sr-only` utility class has also been added:

```tsx
<p className={cx('sr-only', styles.text)}>...</p>
```

### Related Files

- [`styles/mixins/_a11y.scss`](../src/styles/mixins/_a11y.scss)
- [`styles/base/_a11y.scss`](../src/styles/base/_a11y.scss)
