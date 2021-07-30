import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './floatingActionButton.module.scss';

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
    <button
      ref={ref}
      className={cx(styles.button, className)}
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}>
      <span className={styles.icon}>{children}</span>
    </button>
  );
});

export default FloatingActionButton;
