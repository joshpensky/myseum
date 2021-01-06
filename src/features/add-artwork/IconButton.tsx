import { BaseProps } from '@src/types';
import { MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';

export type IconButtonProps = BaseProps & {
  disabled?: boolean;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
  type?: 'button' | 'submit' | 'reset';
};

const IconButton = ({
  children: icon,
  className,
  css: customCss,
  disabled,
  onClick,
  title,
  type,
}: PropsWithChildren<IconButtonProps>) => (
  <button
    className={className}
    css={[
      tw`p-1.5 -m-1.5 rounded bg-white bg-opacity-0 ring-0 ring-white ring-opacity-20`,
      tw`disabled:(opacity-50 cursor-not-allowed)`,
      tw`not-disabled:hocus:(bg-opacity-20) not-disabled:focus:(outline-none transition-shadow ring-2)`,
      customCss,
    ]}
    type={type}
    disabled={disabled}
    title={title}
    onClick={onClick}>
    <span css={tw`sr-only`}>{title}</span>
    <span css={tw`block size-4`}>{icon}</span>
  </button>
);

export default IconButton;
