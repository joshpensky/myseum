import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './button.module.scss';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  filled?: boolean;
  size?: 'small' | 'large';
  id?: string;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { children, className, disabled, filled, id, onClick, size, type },
  ref,
) {
  return (
    <button
      ref={ref}
      id={id}
      className={cx(
        styles.button,
        filled && styles.buttonFilled,
        styles[`button--${size ?? 'small'}`],
        className,
      )}
      type={type}
      disabled={disabled}
      onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
