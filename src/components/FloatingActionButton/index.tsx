import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import { ForwardRefComponent } from '@radix-ui/react-polymorphic';
import cx from 'classnames';
import { useTheme } from '@src/providers/ThemeProvider';
import styles from './floatingActionButton.module.scss';

export interface FloatingActionButtonProps {
  as?: 'button' | ForwardRefComponent<'button', any>;
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
    as,
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
  const Component = as ?? 'button';

  return (
    <Component
      ref={ref}
      className={cx(`theme--${theme.color}`, styles.button, className)}
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}>
      <span className="sr-only">{title}</span>
      <span className={styles.icon}>{children}</span>
    </Component>
  );
});

export default FloatingActionButton;
