import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import { ForwardRefComponent } from '@radix-ui/react-polymorphic';
import cx from 'classnames';
import styles from './iconButton.module.scss';

export interface IconButtonProps {
  as?: 'button' | ForwardRefComponent<'button', any>;
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
  type?: 'button' | 'submit' | 'reset';
}

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<IconButtonProps>>(
  function IconButton(
    { as, children: icon, className, disabled, id, onClick, title, type, ...props },
    ref,
  ) {
    const Component = as ?? 'button';

    return (
      <Component
        ref={ref}
        id={id}
        className={cx(styles.button, className)}
        type={type}
        disabled={disabled}
        title={title}
        onClick={onClick}
        {...props}>
        <span className="sr-only">{title}</span>
        <span className={styles.icon}>{icon}</span>
      </Component>
    );
  },
);

export default IconButton;
