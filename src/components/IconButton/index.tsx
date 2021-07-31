import { forwardRef, MouseEvent, PropsWithChildren, useContext, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import cx from 'classnames';
import { Popover } from '@src/components/Popover';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { useTheme } from '@src/providers/ThemeProvider';
import styles from './iconButton.module.scss';

const SIDE_OFFSET = Number.parseInt(styles.varSideOffset, 10);

export interface IconButtonProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
  type?: 'button' | 'submit' | 'reset';
}

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<IconButtonProps>>(
  function IconButton(
    { children: icon, className, disabled, id, onClick, title, type, ...props },
    ref,
  ) {
    const theme = useTheme();
    const popoverCtx = useContext(Popover.Context);

    // Only allow the tooltip to appear when the popover has finished animating open
    const [allowTooltip, setAllowTooltip] = useState(false);
    useIsomorphicLayoutEffect(() => {
      if (popoverCtx.open) {
        const timeout = setTimeout(() => {
          setAllowTooltip(true);
        }, Popover.constants.AnimationDuration);

        return () => {
          setAllowTooltip(false);
          clearTimeout(timeout);
        };
      }
    }, [popoverCtx.open]);

    return (
      <Tooltip.Root open={popoverCtx.open && !allowTooltip ? false : undefined}>
        <Tooltip.Trigger
          as="span"
          className={cx(styles.wrapper, disabled && styles.wrapperDisabled)}>
          <button
            ref={ref}
            id={id}
            className={cx(styles.button, className)}
            type={type}
            disabled={disabled}
            onClick={onClick}
            {...props}>
            <span className="sr-only">{title}</span>
            <span className={styles.icon}>{icon}</span>
          </button>
        </Tooltip.Trigger>

        <Tooltip.Content
          className={cx(
            `theme--${theme.color}`,
            styles.tooltip,
            disabled && styles.tooltipDisabled,
          )}
          sideOffset={SIDE_OFFSET}>
          {title}
        </Tooltip.Content>
      </Tooltip.Root>
    );
  },
);

export default IconButton;
