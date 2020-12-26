import { BaseProps } from '@src/types';
import { MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';

export type ButtonProps = BaseProps & {
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
};

const Button = ({ children, className, css, onClick }: PropsWithChildren<ButtonProps>) => (
  <button
    className={className}
    css={[
      tw`flex items-center px-4 py-1.5 border border-black rounded-full transition`,
      tw`ring-0 ring-black ring-opacity-40 hocus:(bg-black text-white outline-none) focus:(ring)`,
      css,
    ]}
    onClick={onClick}>
    {children}
  </button>
);

export default Button;
