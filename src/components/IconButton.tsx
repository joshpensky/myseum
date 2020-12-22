import tw from 'twin.macro';
import { forwardRef, MouseEvent, PropsWithChildren } from 'react';

export type IconButtonProps = {
  title: string;
  onClick?(event: MouseEvent<HTMLButtonElement>): void;
};

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<IconButtonProps>>(
  function IconButton({ children, title, onClick }, ref) {
    return (
      <button
        ref={ref}
        className="group"
        css={[
          tw`w-8 h-8 -mx-2 flex items-center justify-center cursor-pointer relative`,
          tw`focus:outline-none`,
        ]}
        title={title}
        onClick={onClick}>
        <span css={[tw`w-4 h-4`]}>{children}</span>
        <span
          css={[
            tw`absolute top-0 left-0 w-full h-full bg-current rounded-full`,
            tw`opacity-0 transform scale-95 transition-transform duration-100`,
            tw`group-hover:opacity-5 group-focus:opacity-10 group-focus:scale-105`,
          ]}
        />
      </button>
    );
  },
);

export default IconButton;
