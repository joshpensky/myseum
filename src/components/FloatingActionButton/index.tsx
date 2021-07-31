import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import { useTheme } from '@src/providers/ThemeProvider';
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
  const theme = useTheme();

  return (
    <button
      ref={ref}
      className={cx(`theme--${theme.color}`, styles.button, className)}
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}>
      <span className="sr-only">{title}</span>
      <span className={styles.icon}>{children}</span>
    </button>
  );
});

export default FloatingActionButton;
