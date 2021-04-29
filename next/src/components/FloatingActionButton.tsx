import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import tw from 'twin.macro';
import { useTheme } from '@src/providers/ThemeProvider';
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
  const theme = useTheme();

  return (
    <button
      ref={ref}
      className={className}
      css={[
        theme &&
          {
            mint: tw`ring-mint-800`,
            pink: tw`ring-mint-800`, // TODO
            navy: tw`ring-navy-800`,
            paper: tw`ring-mint-800`, // TODO
          }[theme.color],
        tw`size-14 flex items-center justify-center rounded-full bg-white shadow-lg cursor-pointer`,
        tw`focus:outline-none transition-shadow ring-1 ring-opacity-0 hover:(ring-opacity-20) focus:(ring-2 ring-opacity-100 hover:ring-opacity-100)`,
        customCss,
      ]}
      title={title}
      onClick={onClick}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}>
      <span
        css={[
          tw`size-5`,
          theme &&
            {
              mint: tw`text-mint-900`,
              pink: tw`text-mint-900`, // TODO
              navy: tw`text-navy-200`,
              paper: tw`text-mint-900`, // TODO
            }[theme.color],
        ]}>
        {children}
      </span>
    </button>
  );
});

export default FloatingActionButton;
