import {
  useState,
  useEffect,
  useRef,
  RefObject,
  PropsWithChildren,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import FocusLock from 'react-focus-lock';
import tw from 'twin.macro';
import Portal from '@src/components/Portal';
import { useTheme } from '@src/providers/ThemeProvider';
import { BaseProps } from '@src/types';

const _PopoverContext = createContext({ id: '', disabled: false });

export const usePopover = (id: string) => {
  const anchorRef = useRef<HTMLButtonElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const closePopover = (returnFocus?: boolean) => {
    setIsExpanded(false);
    if (returnFocus) {
      // Must wait till next tick to workaround FocusLock
      process.nextTick(() => {
        anchorRef.current?.focus();
      });
    }
  };

  return {
    isExpanded,
    close: closePopover,
    anchorProps: {
      ref: anchorRef,
      'aria-controls': id,
      'aria-expanded': isExpanded,
      onClick: () => setIsExpanded(true),
    },
    wrapperProps: {
      id,
      anchorRef,
      isExpanded,
      onClose: closePopover,
    },
  };
};

type YDirection = 'top' | 'bottom';
type XDirection = 'left' | 'right';
type Origin = `${YDirection} ${XDirection}` | `${XDirection} ${YDirection}`;

export type PopoverProps = BaseProps & {
  anchorRef: RefObject<HTMLButtonElement>;
  disabled?: boolean;
  isExpanded: boolean;
  id: string;
  onClose(returnFocus?: boolean): void;
  origin: Origin;
};

const Popover = ({
  anchorRef,
  children,
  className,
  css: customCss,
  disabled,
  id,
  isExpanded,
  onClose,
  origin,
}: PropsWithChildren<PopoverProps>) => {
  const theme = useTheme();

  const detailsRef = useRef<HTMLDivElement>(null);

  // Closes the popover when clicked outside
  const onOutsideClick = (evt: MouseEvent) => {
    if (
      detailsRef.current &&
      evt.target &&
      evt.target instanceof Node &&
      !(detailsRef.current === evt.target || detailsRef.current.contains(evt.target))
    ) {
      onClose(evt.target === anchorRef.current);
    }
  };

  // Closes the popover when escape key is pressed
  const onEscapeKey = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Esc':
      case 'Escape': {
        evt.preventDefault();
        onClose(true);
        break;
      }
    }
  };

  // Attaches keydown and click listeners for close events
  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('keydown', onEscapeKey);

      return () => {
        document.removeEventListener('click', onOutsideClick);
        document.removeEventListener('keydown', onEscapeKey);
      };
    }
  }, [isExpanded]);

  const shadowStyle = {
    DEFAULT: tw`text-gray-800`,
    mint: tw`text-mint-800`,
    pink: tw`text-mint-800`, // TODO: update
    navy: tw`text-navy-800`,
    paper: tw`text-mint-800`, // TODO: update
  }[theme?.color ?? 'DEFAULT'];

  // TODO: auto-choose best position/alignment based on available space on screen?
  const originStyle = {
    'top left': tw`-top-2.5 left-0 origin-bottom-left -translate-y-full`,
    'top right': tw`-top-2.5 right-0 origin-bottom-right -translate-y-full`,
    'bottom left': tw`-bottom-2.5 left-0 origin-top-left translate-y-full`,
    'bottom right': tw`-bottom-2.5 right-0 origin-top-right translate-y-full`,
    'left top': tw`top-0 -left-2.5 origin-top-right -translate-x-full`,
    'left bottom': tw`bottom-0 -left-2.5 origin-bottom-right -translate-x-full`,
    'right top': tw`top-0 -right-2.5 origin-top-left translate-x-full`,
    'right bottom': tw`bottom-0 -right-2.5 origin-bottom-left translate-x-full`,
  }[origin];

  return (
    <_PopoverContext.Provider
      value={{
        id,
        disabled: disabled ?? false,
      }}>
      <span className={className} css={[tw`relative`, customCss]}>
        {children}
        {!disabled && (
          <FocusLock disabled={!isExpanded}>
            <div
              ref={detailsRef}
              id={id}
              css={[
                shadowStyle,
                tw`absolute text-opacity-20 shadow-popover bg-current ring-current rounded-lg transform-gpu w-96 transition-modal-enter ease-out z-popover`,
                originStyle,
                !isExpanded &&
                  tw`scale-95 opacity-0 pointer-events-none invisible transition-modal-leave`,
              ]}
              aria-modal={true}
              aria-hidden={!isExpanded}
            />
          </FocusLock>
        )}
      </span>
    </_PopoverContext.Provider>
  );
};

type PopoverBodyProps = {
  children: ReactNode;
};
Popover.Body = function PopoverBody({ children }: PopoverBodyProps) {
  const { disabled, id } = useContext(_PopoverContext);
  if (disabled) {
    return null;
  }
  return (
    <Portal to={id}>
      <div css={tw`text-black`}>{children}</div>
    </Portal>
  );
};

export default Popover;
