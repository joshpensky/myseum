import { useState, useEffect, useRef, ReactNode, RefObject } from 'react';
import FocusLock from 'react-focus-lock';
import tw, { TwStyle } from 'twin.macro';
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

type YPosition = 'top' | 'bottom';
type XPosition = 'left' | 'right';

type PositionAlignment<P extends YPosition | XPosition> = {
  position: P;
  align: P extends YPosition ? XPosition : YPosition;
};

export type PopoverProps<P extends YPosition | XPosition> = BaseProps &
  PositionAlignment<P> & {
    children(props: PopoverChildrenProps): ReactNode;
    id: string;
    renderBody(props: PartialRenderPopoverProps): ReactNode;
    renderHeader?(props: PartialRenderPopoverProps): ReactNode;
  };

function Popover<P extends YPosition | XPosition>({
  align,
  children,
  className,
  css: customCss,
  id,
  position,
  renderBody,
  renderHeader,
}: PopoverProps<P>) {
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
    }
  };

  const openPopover = () => {
    setIsExpanded(true);
  };

  const closePopover = () => {
    setIsExpanded(false);
    console.log(triggerButtonRef.current);
    triggerButtonRef.current?.focus();
  };

  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Esc':
      case 'Escape': {
        evt.preventDefault();
        setIsExpanded(false);
        triggerButtonRef.current?.focus();
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

  const yPositionAlignments: Record<YPosition, Record<XPosition, TwStyle>> = {
    top: {
      left: tw`-top-2.5 left-0 origin-bottom-left -translate-y-full`,
      right: tw`-top-2.5 right-0 origin-bottom-right -translate-y-full`,
    },
    bottom: {
      left: tw`-bottom-2.5 left-0 origin-top-left translate-y-full`,
      right: tw`-bottom-2.5 right-0 origin-top-right translate-y-full`,
    },
  };
  const xPositionAlignments: Record<XPosition, Record<YPosition, TwStyle>> = {
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
            tw`absolute bg-white rounded-lg shadow-xl ring-mint-800 transform-gpu w-96 transition-modal-enter ease-out z-popover`,
            // TODO: auto-choose best alignment based on position on screen
            position === 'top' || position === 'bottom'
              ? yPositionAlignments[position as YPosition][(align as XPosition) ?? 'right']
              : xPositionAlignments[position as XPosition][(align as YPosition) ?? 'top'],
            !isExpanded &&
              tw`scale-95 opacity-0 pointer-events-none invisible transition-modal-leave`,
          ]}
          aria-modal={true}
          aria-hidden={!isExpanded}>
          {renderHeader && (
            <header css={tw`border-b border-mint-300 py-2 px-5`}>
              {renderHeader({
                closePopover,
                isExpanded,
                openPopover,
              })}
            </header>
          )}
          <section css={tw`p-5`}>
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
