import { PropsWithChildren, ReactNode, useState } from 'react';
import { Root, Trigger, Content, TooltipContentProps } from '@radix-ui/react-tooltip';
import cx from 'classnames';
import { useTheme } from '@src/providers/ThemeProvider';
import styles from './tooltip.module.scss';

const SIDE_OFFSET = Number.parseInt(styles.varSideOffset, 10);
const COLLISION_TOLERANCE = Number.parseInt(styles.varCollisionTolerance, 10);

export interface TooltipProps extends TooltipContentProps {
  className?: string;
  disabled?: boolean;
  value: ReactNode;
}

export const Tooltip = ({
  children,
  className,
  disabled,
  value,
  ...props
}: PropsWithChildren<TooltipProps>) => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  return (
    <Root open={open} onOpenChange={open => setOpen(open)} delayDuration={300}>
      <Trigger asChild>
        <span>{children}</span>
      </Trigger>
      <Content
        {...props}
        className={cx(
          `theme--${theme.color}`,
          styles.tooltip,
          disabled && styles.tooltipDisabled,
          className,
        )}
        sideOffset={props?.sideOffset ?? SIDE_OFFSET}
        collisionTolerance={props?.collisionTolerance ?? COLLISION_TOLERANCE}>
        <span className={styles.tooltipContent}>{value}</span>
      </Content>
    </Root>
  );
};
