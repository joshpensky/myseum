import { MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';

export type FloatingActionButtonProps = {
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
};

const FloatingActionButton = ({
  children,
  onClick,
  title,
}: PropsWithChildren<FloatingActionButtonProps>) => (
  <button
    css={tw`w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg ring-mint-800 cursor-pointer`}
    onClick={onClick}
    title={title}>
    <span css={tw`w-5 h-5 text-mint-900`}>{children}</span>
  </button>
);

export default FloatingActionButton;
