import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';
import { BaseProps } from '@src/types';

export type FloatingActionButtonProps = BaseProps & {
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
};

const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<FloatingActionButtonProps>
>(function FloatingActionButton(
  {
    className,
    css: customCss,
    children,
    onClick,
    title,
    ['aria-controls']: ariaControls,
    ['aria-expanded']: ariaExpanded,
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={className}
      css={[
        tw`size-14 flex items-center justify-center rounded-full bg-white shadow-lg ring-mint-800 cursor-pointer`,
        tw`focus:outline-none transition-shadow ring-1 ring-opacity-0 hover:(ring-opacity-20) focus:(ring-2 ring-opacity-100 hover:ring-opacity-100)`,
        customCss,
      ]}
      title={title}
      onClick={onClick}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}>
      <span css={tw`size-5 text-mint-900`}>{children}</span>
    </button>
  );
});

export default FloatingActionButton;
