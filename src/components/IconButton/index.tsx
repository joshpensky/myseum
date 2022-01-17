import { forwardRef, MouseEvent, PropsWithChildren } from 'react';
import cx from 'classnames';
import { Tooltip, TooltipProps } from '@src/components/Tooltip';
import styles from './iconButton.module.scss';

export interface IconButtonProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
  tooltipProps?: Pick<TooltipProps, 'side' | 'align'>;
  type?: 'button' | 'submit' | 'reset';
}

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<IconButtonProps>>(
  function IconButton(
    { children: icon, className, disabled, id, onClick, title, tooltipProps, type, ...props },
    ref,
  ) {
    // <Tooltip {...tooltipProps} disabled={disabled} value={title}>
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
    // </Tooltip>
  },
);

export default IconButton;
