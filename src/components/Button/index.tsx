import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './button.module.scss';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  filled?: boolean;
  id?: string;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { children, className, disabled, filled, id, onClick, type },
  ref,
) {
  return (
    <button
      ref={ref}
      id={id}
      className={cx(styles.button, filled && styles.buttonFilled, className)}
      type={type}
      disabled={disabled}
      onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
