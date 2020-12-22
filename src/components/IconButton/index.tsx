import { ComponentType, forwardRef, MouseEvent, PropsWithChildren } from 'react';
import styles from './iconButton.module.scss';

export type IconButtonProps = {
  icon: ComponentType;
  title: string;
  onClick?(event: MouseEvent<HTMLButtonElement>): void;
};

const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<IconButtonProps>>(
  function IconButton({ icon: Icon, title, onClick }, ref) {
    return (
      <button ref={ref} className={styles.button} title={title} onClick={onClick}>
        <span className={styles.icon}>
          <Icon />
        </span>
      </button>
    );
  },
);

export default IconButton;
