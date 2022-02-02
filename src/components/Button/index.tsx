import React, { ComponentType, MouseEventHandler, PropsWithChildren } from 'react';
import Link, { LinkProps } from 'next/link';
import cx from 'classnames';
import { Loader } from '@src/components/Loader';
import styles from './button.module.scss';

export interface BaseButtonProps {
  busy?: boolean;
  className?: string;
  disabled?: boolean;
  filled?: boolean;
  icon?: ComponentType;
  id?: string;
}

interface ButtonAsLinkProps {
  type: 'link';
  href: LinkProps['href'];
  innerRef?: React.Ref<HTMLAnchorElement>;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

interface ButtonAsButtonProps {
  type?: 'button' | 'submit' | 'reset';
  href?: never;
  innerRef?: React.Ref<HTMLButtonElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

type ButtonProps = BaseButtonProps & (ButtonAsButtonProps | ButtonAsLinkProps);

const Button = (props: PropsWithChildren<ButtonProps>) => {
  const { busy, children, className, disabled, filled, icon: Icon, id } = props;

  const classNames = cx(
    styles.button,
    filled && styles.buttonFilled,
    busy && styles.buttonBusy,
    className,
  );

  const content = (
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
  );

  if (props.type === 'link') {
    return (
      <Link href={props.href}>
        <a
          ref={props.innerRef}
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
      ref={props.innerRef}
      id={id}
      className={classNames}
      type={props.type}
      aria-busy={busy}
      disabled={disabled}
      onClick={busy ? undefined : props.onClick}>
      {content}
    </button>
  );
};

export default Button;
