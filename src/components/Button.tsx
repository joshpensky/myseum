import { BaseProps } from '@src/types';
import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';

export type ButtonProps = BaseProps & {
  disabled?: boolean;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  type?: 'button' | 'submit' | 'reset';
};

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { children, className, css, disabled, onClick, type },
  ref,
) {
  return (
    <button
      ref={ref}
      className={['group', className].join(' ')}
      css={[
        tw`relative flex items-center px-4 py-1.5 border border-current rounded-full transition`,
        tw`disabled:(opacity-50 cursor-not-allowed) not-disabled:focus:(outline-none)`,
        css,
      ]}
      type={type}
      disabled={disabled}
      onClick={onClick}>
      {children}
      <span
        css={[
          tw`absolute -inset-px rounded-full opacity-40 pointer-events-none`,
          tw`ring-0 ring-current transition-shadow`,
          !disabled && tw`group-focus:(ring-4)`,
        ]}
      />
    </button>
  );
});

export default Button;
