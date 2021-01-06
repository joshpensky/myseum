import { BaseProps } from '@src/types';
import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import tw, { css } from 'twin.macro';

export type IconButtonProps = BaseProps & {
  disabled?: boolean;
  id?: string;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
  type?: 'button' | 'submit' | 'reset';
};

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<IconButtonProps>>(
  function IconButton(
    { children: icon, className, css: customCss, disabled, id, onClick, title, type },
    ref,
  ) {
    return (
      <button
        ref={ref}
        id={id}
        className={['group', className].join(' ')}
        css={[
          tw`relative p-2 -m-2`,
          tw`disabled:(opacity-50 cursor-not-allowed)`,
          tw`focus:outline-none`,
          customCss,
        ]}
        type={type}
        disabled={disabled}
        title={title}
        onClick={onClick}>
        <span css={tw`sr-only`}>{title}</span>
        <span css={tw`block size-4`}>{icon}</span>
        <span
          css={[
            tw`absolute inset-0 rounded-full bg-current pointer-events-none opacity-0 ring-0 ring-current`,
            css`
              .group:not(:disabled):hover & {
                ${tw`opacity-10`}
              }
              .group:not(:disabled):focus & {
                ${tw`opacity-15 transition-shadow ring-2`}
              }
            `,
          ]}
        />
      </button>
    );
  },
);

export default IconButton;
