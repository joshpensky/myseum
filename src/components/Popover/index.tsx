import { createContext, PropsWithChildren, useRef, useState } from 'react';
import {
  Content,
  Root,
  Close,
  Trigger,
  PopoverContentOwnProps,
  PopoverOwnProps,
} from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import cx from 'classnames';
import IconButton from '@src/components/IconButton';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import CloseIcon from '@src/svgs/Close';
import styles from './popover.module.scss';

const ANIMATION_DURATION = Number.parseInt(styles.varAnimDuration, 10);
const SIDE_OFFSET = Number.parseInt(styles.varSideOffset, 10);

const PopoverContext = createContext({ open: false });

const PopoverRoot = ({ children, ...props }: PropsWithChildren<PopoverOwnProps>) => {
  const [open, setOpen] = useState(props.defaultOpen ?? false);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    props.onOpenChange?.(open);
  };

  return (
    <PopoverContext.Provider value={{ open }}>
      <Root {...props} onOpenChange={onOpenChange}>
        {children}
      </Root>
    </PopoverContext.Provider>
  );
};

interface PopoverContentProps extends PopoverContentOwnProps {
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

    <Close as={Slot}>
      <IconButton title="Close settings">
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
  constants: {
    AnimationDuration: ANIMATION_DURATION,
  },
  Context: PopoverContext,
  Root: PopoverRoot,
  Trigger,
  Content: PopoverContent,
  Header: PopoverHeader,
  Body: PopoverBody,
};
