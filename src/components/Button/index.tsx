import { ComponentType, forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import { Loader } from '@src/components/Loader';
import styles from './button.module.scss';

export interface ButtonProps {
  busy?: boolean;
  className?: string;
  disabled?: boolean;
  filled?: boolean;
  id?: string;
  icon?: ComponentType;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
  { busy, children, className, disabled, filled, icon: Icon, id, onClick, type },
  ref,
) {
  return (
    <button
      ref={ref}
      id={id}
      className={cx(
        styles.button,
        filled && styles.buttonFilled,
        busy && styles.buttonBusy,
        className,
      )}
      type={type}
      aria-busy={busy}
      disabled={disabled}
      onClick={busy ? undefined : onClick}>
      <span className={styles.inner}>
        {Icon && (
          <span className={styles.icon} aria-hidden="true">
            <Icon />
          </span>
        )}

        <span className={styles.text}>{children}</span>

        <span className={styles.loader} aria-hidden="true">
          <Loader />
        </span>
      </span>
    </button>
  );
});

export default Button;
