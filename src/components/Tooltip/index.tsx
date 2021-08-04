import {
  FocusEventHandler,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Root, Trigger, Content, TooltipContentOwnProps } from '@radix-ui/react-tooltip';
import cx from 'classnames';
import { useAnimationStatus } from '@src/providers/AnimationStatus';
import { useTheme } from '@src/providers/ThemeProvider';
import styles from './tooltip.module.scss';

const SIDE_OFFSET = Number.parseInt(styles.varSideOffset, 10);
const COLLISION_TOLERANCE = Number.parseInt(styles.varCollisionTolerance, 10);

export interface TooltipProps extends TooltipContentOwnProps {
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

  const triggerRef = useRef<HTMLSpanElement>(null);
  const focusEventRef = useRef<FocusEvent | null>(null);

  // Force close the tooltip if a parent element is animating
  const isAnimating = useAnimationStatus();
  const [open, setOpen] = useState(false);

  /**
   * If a trigger child element is focused when a parent element is animating,
   * stop the event from propogating immediately and store the event to be dispatched
   * once the animation has stopped.
   *
   * @param evt the focus capture event
   */
  const onTriggerFocusCapture: FocusEventHandler<HTMLSpanElement> = evt => {
    if (isAnimating) {
      evt.stopPropagation();
      focusEventRef.current = evt.nativeEvent;
    }
  };

  // Once the animation has completed and there's a stored focus event,
  // dispatch the event again so the focus event gets triggered and the tooltip opens
  useEffect(() => {
    if (!isAnimating && focusEventRef.current) {
      // Only re-trigger the focus event if the trigger is still focused!
      if (triggerRef.current && triggerRef.current.contains(document.activeElement)) {
        triggerRef.current.dispatchEvent(focusEventRef.current);
      }
      focusEventRef.current = null;
    }
  }, [isAnimating]);

  return (
    <Root open={open} onOpenChange={open => setOpen(open)} delayDuration={300}>
      <Trigger ref={triggerRef} as="span" onFocusCapture={onTriggerFocusCapture}>
        {children}
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
