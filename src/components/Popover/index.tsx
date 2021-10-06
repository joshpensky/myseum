import { PropsWithChildren, useRef, useState } from 'react';
import {
  Content,
  Root,
  Close,
  Trigger,
  PopoverContentProps as RadixPopoverContentProps,
  PopoverProps,
} from '@radix-ui/react-popover';
import cx from 'classnames';
import IconButton from '@src/components/IconButton';
import { AnimationStatus } from '@src/providers/AnimationStatus';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import CloseIcon from '@src/svgs/Close';
import styles from './popover.module.scss';

const ANIMATION_DURATION = Number.parseInt(styles.varAnimDuration, 10);
const SIDE_OFFSET = Number.parseInt(styles.varSideOffset, 10);

const PopoverRoot = ({ children, ...props }: PropsWithChildren<PopoverProps>) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  const onOpenChange = (open: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsAnimating(true);
    props.onOpenChange?.(open);

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION + 10);
  };

  return (
    <AnimationStatus value={isAnimating}>
      <Root {...props} onOpenChange={onOpenChange}>
        {children}
      </Root>
    </AnimationStatus>
  );
};

interface PopoverContentProps extends Omit<RadixPopoverContentProps, 'id'> {
  className?: string;
}

const PopoverContent = ({
  children,
  className,
  ...props
}: PropsWithChildren<PopoverContentProps>) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <ThemeProvider theme={{ color: 'paper' }}>
      <Content
        {...props}
        ref={contentRef}
        className={cx(`theme--paper`, styles.popover, className)}
        sideOffset={props.sideOffset ?? SIDE_OFFSET}>
        {children}
      </Content>
    </ThemeProvider>
  );
};

interface PopoverHeaderProps {
  className?: string;
}

const PopoverHeader = ({ children, className }: PropsWithChildren<PopoverHeaderProps>) => (
  <header className={cx(styles.popoverHeader, className)}>
    {children}

    <Close asChild>
      <IconButton title="Close settings" tooltipProps={{ side: 'top' }}>
        <CloseIcon />
      </IconButton>
    </Close>
  </header>
);

interface PopoverBodyProps {
  className?: string;
}

const PopoverBody = ({ children, className }: PropsWithChildren<PopoverBodyProps>) => (
  <section className={cx(styles.popoverBody, className)}>{children}</section>
);

export const Popover = {
  Root: PopoverRoot,
  Trigger,
  Content: PopoverContent,
  Header: PopoverHeader,
  Body: PopoverBody,
};
