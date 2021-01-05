import { BaseProps } from '@src/types';
import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';

export type ButtonProps = BaseProps & {
  disabled?: boolean;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
};

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { children, className, css, disabled, onClick },
  ref,
) {
  return (
    <button
      ref={ref}
      className={className}
      css={[
        tw`flex items-center px-4 py-1.5 border border-current rounded-full transition`,
        tw`disabled:opacity-50`,
        tw`ring-0 ring-current ring-opacity-40 not-disabled:hocus:(bg-black text-white outline-none) not-disabled:focus:(ring)`,
        css,
      ]}
      disabled={disabled}
      onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
