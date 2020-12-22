// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties {
    /** Allows for CSS variables to be set via the `style` prop */
    [cssVariableKey: string]: string | number;
  }
}
