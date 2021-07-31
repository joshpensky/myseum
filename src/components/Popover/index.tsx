import { PropsWithChildren } from 'react';
import { Content, Root, Close, Trigger, PopoverContentOwnProps } from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import cx from 'classnames';
import IconButton from '@src/components/IconButton';
import { useTheme } from '@src/providers/ThemeProvider';
import CloseIcon from '@src/svgs/Close';
import styles from './popover.module.scss';

const POPOVER_OFFSET = Number.parseInt(styles.varPopoverOffset);

interface PopoverContentProps extends PopoverContentOwnProps {
  className?: string;
}

const PopoverContent = ({
  children,
  className,
  ...props
}: PropsWithChildren<PopoverContentProps>) => {
  const theme = useTheme();

  return (
    <Content
      {...props}
      className={cx(`theme--${theme.color}`, styles.popover, className)}
      sideOffset={props.sideOffset ?? POPOVER_OFFSET}>
      {children}
    </Content>
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
  Root,
  Trigger,
  Content: PopoverContent,
  Header: PopoverHeader,
  Body: PopoverBody,
};
