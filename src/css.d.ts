// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as CSS from 'csstype';

// Augment the CSSProperties interface to allow for CSS variable definition
// https://stackoverflow.com/a/52013197
declare module 'csstype' {
  interface Properties {
    // Use of template literal types for index signatures is in the works (https://github.com/microsoft/TypeScript/issues/41342)
    // It would look like the following:
    //   interface Properties {
    //     [cssVariable: `--${string}`]: string;
    //   }
    // Until then, we will just allow any string for CSS variables to work.
    [cssVariable: string]: string | number;
  }
}
