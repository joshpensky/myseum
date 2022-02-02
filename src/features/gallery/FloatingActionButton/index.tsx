import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import { Tooltip } from '@src/components/Tooltip';
import styles from './floatingActionButton.module.scss';

const SIDE_OFFSET = Number.parseInt(styles.varSideOffset, 10);

export interface FloatingActionButtonProps {
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
}

const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<FloatingActionButtonProps>
>(function FloatingActionButton(
  {
    className,
    children,
    disabled,
    onClick,
    title,
    ['aria-controls']: ariaControls,
    ['aria-expanded']: ariaExpanded,
  },
  ref,
) {
  return (
    <Tooltip value={title} side="left" align="center" sideOffset={SIDE_OFFSET} disabled={disabled}>
      <button
        ref={ref}
        className={cx(styles.button, className)}
        onClick={onClick}
        disabled={disabled}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}>
        <span className="sr-only">{title}</span>
        <span className={styles.icon}>{children}</span>
      </button>
    </Tooltip>
  );
});

export default FloatingActionButton;
