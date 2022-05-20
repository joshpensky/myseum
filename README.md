# myseum

## Setup

1. Install dependencies

```bash
yarn
```

2. Copy `.env.example` to `.env` and copy environment variables

3. Start the development server

```bash
yarn develop
```

## Making schema updates

```bash
yarn db:migrate
```

## Styling

### Spacing

You can use the `sz` Sass function to apply spacing:

```scss
height: sz(1);
// height: 0.25rem; (4px)

height: sz(4);
// height: 1rem; (16px)

width: sz(8, $convert: 'px');
// height: 32px;
```

### Theming

To apply a theme to a group of elements, add the `theme--{color}` class to the parent element

You can then use the `c` Sass function to access colors:

```scss
color: c('text'); // use the theme's text color
// color: rgba(var(--c-text), 1);

color: c('text', 0.5); // use the theme's text color, 50% opacity
// color: rgba(var(--c-text), 0.5);
```

> You can also use the `ThemeProvider` to pass the theme color through context to child components

Valid color themes are:

- mint
- rose
- navy
- paper
- ink
