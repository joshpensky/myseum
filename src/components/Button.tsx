import { BaseProps } from '@src/types';
import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';

export type ButtonProps = BaseProps & {
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
};

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { children, className, css, onClick },
  ref,
) {
  return (
    <button
      ref={ref}
      className={className}
      css={[
        tw`flex items-center px-4 py-1.5 border border-current rounded-full transition`,
        tw`ring-0 ring-black ring-opacity-40 hocus:(bg-black text-white outline-none) focus:(ring)`,
        css,
      ]}
      onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
