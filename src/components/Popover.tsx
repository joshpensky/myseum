import { useState, useEffect, useRef, ReactNode, RefObject } from 'react';
import FocusLock from 'react-focus-lock';
import tw, { TwStyle } from 'twin.macro';
import { useTheme } from '@src/providers/ThemeProvider';
import { BaseProps } from '@src/types';

export type PartialRenderPopoverProps = {
  closePopover(): void;
  isExpanded: boolean;
  openPopover(): void;
};

export type PopoverChildrenProps = PartialRenderPopoverProps & {
  triggerProps: {
    'aria-controls': string;
    'aria-expanded': boolean;
    ref: RefObject<HTMLButtonElement>;
  };
};

type YDirection = 'top' | 'bottom';
type XDirection = 'left' | 'right';
type Direction = YDirection | XDirection;
type PositionAlignment<P extends Direction> = {
  position: P;
  align: P extends YDirection ? XDirection : YDirection;
};

export type PopoverProps<P extends Direction> = BaseProps &
  PositionAlignment<P> & {
    children(props: PopoverChildrenProps): ReactNode;
    id: string;
    renderBody(props: PartialRenderPopoverProps): ReactNode;
    renderHeader?(props: PartialRenderPopoverProps): ReactNode;
  };

function Popover<P extends Direction>({
  align,
  children,
  className,
  css: customCss,
  id,
  position,
  renderBody,
  renderHeader,
}: PopoverProps<P>) {
  const theme = useTheme();

  const detailsRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const onOutsideClick = (evt: MouseEvent) => {
    if (
      detailsRef.current &&
      evt.target &&
      evt.target instanceof Node &&
      !(detailsRef.current === evt.target || detailsRef.current.contains(evt.target))
    ) {
      setIsExpanded(false);
      if (evt.target === triggerButtonRef.current) {
        // Must wait till next tick to workaround FocusLock
        process.nextTick(() => {
          triggerButtonRef.current?.focus();
        });
      }
    }
  };

  const openPopover = () => {
    setIsExpanded(true);
  };

  const closePopover = () => {
    setIsExpanded(false);
    // Must wait till next tick to workaround FocusLock
    process.nextTick(() => {
      triggerButtonRef.current?.focus();
    });
  };

  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Esc':
      case 'Escape': {
        evt.preventDefault();
        setIsExpanded(false);
        // Must wait till next tick to workaround FocusLock
        process.nextTick(() => {
          triggerButtonRef.current?.focus();
        });
        break;
      }
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('keydown', onKeyDown);

      return () => {
        document.removeEventListener('click', onOutsideClick);
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isExpanded]);

  const yPositionAlignments: Record<YDirection, Record<XDirection, TwStyle>> = {
    top: {
      left: tw`-top-2.5 left-0 origin-bottom-left -translate-y-full`,
      right: tw`-top-2.5 right-0 origin-bottom-right -translate-y-full`,
    },
    bottom: {
      left: tw`-bottom-2.5 left-0 origin-top-left translate-y-full`,
      right: tw`-bottom-2.5 right-0 origin-top-right translate-y-full`,
    },
  };
  const xPositionAlignments: Record<XDirection, Record<YDirection, TwStyle>> = {
    left: {
      top: tw`top-0 -left-2.5 origin-top-right -translate-x-full`,
      bottom: tw`bottom-0 -left-2.5 origin-bottom-right -translate-x-full`,
    },
    right: {
      top: tw`top-0 -right-2.5 origin-top-left translate-x-full`,
      bottom: tw`bottom-0 -right-2.5 origin-bottom-left translate-x-full`,
    },
  };

  return (
    <span className={className} css={[tw`relative`, customCss]}>
      {children({
        closePopover,
        isExpanded,
        openPopover,
        triggerProps: {
          'aria-controls': id,
          'aria-expanded': isExpanded,
          ref: triggerButtonRef,
        },
      })}
      <FocusLock disabled={!isExpanded}>
        <div
          ref={detailsRef}
          id={id}
          css={[
            {
              DEFAULT: tw`ring-gray-800`,
              mint: tw`ring-mint-800`,
              pink: tw`ring-mint-800`, // TODO: update
              navy: tw`ring-navy-800`,
              paper: tw`ring-mint-800`, // TODO: update
            }[theme?.color ?? 'DEFAULT'],
            tw`absolute shadow-popover ring-opacity-20 rounded-lg transform-gpu w-96 transition-modal-enter ease-out z-popover`,
            // TODO: auto-choose best position/alignment based on available space on screen?
            position === 'top' || position === 'bottom'
              ? yPositionAlignments[position as YDirection][align as XDirection]
              : xPositionAlignments[position as XDirection][align as YDirection],
            !isExpanded &&
              tw`scale-95 opacity-0 pointer-events-none invisible transition-modal-leave`,
          ]}
          aria-modal={true}
          aria-hidden={!isExpanded}>
          {renderHeader && (
            <header css={tw`py-2 px-5 bg-white rounded-t-lg mb-px`}>
              {renderHeader({
                closePopover,
                isExpanded,
                openPopover,
              })}
            </header>
          )}
          <section
            css={[tw`px-5 pt-4 pb-5 bg-white rounded-b-lg`, !renderHeader && tw`rounded-t-lg`]}>
            {renderBody({
              closePopover,
              isExpanded,
              openPopover,
            })}
          </section>
        </div>
      </FocusLock>
    </span>
  );
}

export default Popover;
