import React, { ComponentType, forwardRef, MouseEventHandler, PropsWithChildren } from 'react';
import Link, { LinkProps } from 'next/link';
import cx from 'classnames';
import { Loader } from '@src/components/Loader';
import styles from './button.module.scss';

export interface BaseButtonProps {
  'aria-pressed'?: boolean;
  busy?: boolean;
  className?: string;
  disabled?: boolean;
  filled?: boolean;
  danger?: boolean;
  icon?: ComponentType;
  id?: string;
}

export interface ButtonAsLinkProps {
  type: 'link';
  href: LinkProps['href'];
  ref?: React.Ref<HTMLAnchorElement>;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface ButtonAsButtonProps {
  type?: 'button' | 'submit' | 'reset';
  href?: never;
  ref?: React.Ref<HTMLButtonElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export type ButtonProps = BaseButtonProps & (ButtonAsButtonProps | ButtonAsLinkProps);

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, PropsWithChildren<ButtonProps>>(
  function Button(props, ref) {
    const { busy, children, className, danger, disabled, filled, icon: Icon, id } = props;

    const classNames = cx(
      styles.button,
      filled && styles.buttonFilled,
      busy && styles.buttonBusy,
      danger && styles.buttonDanger,
      className,
    );

    const content = (
      <span className={styles.inner}>
        <span className={styles.content}>
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
      </span>
    );

    if (props.type === 'link') {
      return (
        <Link href={props.href}>
          <a
            ref={ref as ButtonAsLinkProps['ref']}
            id={id}
            className={classNames}
            aria-busy={busy}
            aria-disabled={disabled}
            onClick={busy ? undefined : props.onClick}>
            {content}
          </a>
        </Link>
      );
    }

    return (
      <button
        ref={ref as ButtonAsButtonProps['ref']}
        id={id}
        className={classNames}
        type={props.type}
        aria-busy={busy}
        aria-pressed={props['aria-pressed']}
        disabled={disabled}
        onClick={busy ? undefined : props.onClick}>
        {content}
      </button>
    );
  },
) as ComponentType<ButtonProps>;

export default Button;
