import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './iconButton.module.scss';

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
    return (
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
    );
  },
);

export default IconButton;
