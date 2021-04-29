import { BaseProps } from '@src/types';
import { forwardRef, Fragment, MouseEvent, PropsWithChildren } from 'react';
import tw, { css } from 'twin.macro';

export type ButtonProps = BaseProps & {
  disabled?: boolean;
  filled?: boolean;
  id?: string;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  type?: 'button' | 'submit' | 'reset';
};

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { children, className, css: customCss, disabled, filled, id, onClick, type },
  ref,
) {
  return (
    <button
      ref={ref}
      id={id}
      className={['group', className].join(' ')}
      css={[
        tw`relative px-3 py-1.5 rounded-full`,
        tw`disabled:(opacity-50 cursor-not-allowed) not-disabled:focus:(outline-none)`,
        filled && tw`bg-current`,
        customCss,
      ]}
      type={type}
      disabled={disabled}
      onClick={onClick}>
      <span css={[tw`flex items-center relative`, filled && tw`text-black z-1`]}>{children}</span>

      {/* Focus ring */}
      {filled && (
        <span
          css={[
            tw`absolute inset-0 rounded-full opacity-60 pointer-events-none`,
            tw`ring-0 ring-current transition-shadow`,
            css`
              .group:not(:disabled):focus & {
                ${tw`ring-4`}
              }
            `,
          ]}
        />
      )}

      {!filled && (
        <Fragment>
          {/* Focus background color */}
          <span
            css={[
              tw`absolute inset-0 rounded-full bg-current opacity-0 transition-opacity pointer-events-none`,
              css`
                .group:not(:disabled):focus & {
                  ${tw`opacity-10`}
                }
              `,
            ]}
          />
          {/* Border */}
          <span
            css={[
              tw`absolute -inset-px rounded-full opacity-20 pointer-events-none`,
              tw`border border-current transition-opacity`,
              css`
                .group:not(:disabled):hover & {
                  ${tw`opacity-40`}
                }
                .group:not(:disabled):focus & {
                  ${tw`opacity-100`}
                }
              `,
            ]}
          />
        </Fragment>
      )}
    </button>
  );
});

export default Button;
