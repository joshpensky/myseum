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
    css={tw`size-14 flex items-center justify-center rounded-full bg-white shadow-lg ring-mint-800 cursor-pointer`}
    onClick={onClick}
    title={title}>
    <span css={tw`size-5 text-mint-900`}>{children}</span>
  </button>
);

export default FloatingActionButton;
