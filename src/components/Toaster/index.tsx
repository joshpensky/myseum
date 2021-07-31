import cx from 'classnames';
import { Toaster as BaseToaster } from 'react-hot-toast';
import Close from '@src/svgs/Close';
import { Info } from '@src/svgs/Info';
import styles from './toaster.module.scss';

export const Toaster = () => (
  <BaseToaster
    position="bottom-left"
    toastOptions={{
      className: cx(`theme--paper`, styles.toast),
      duration: 6000,
      success: {
        icon: (
          <span className={styles.icon}>
            <Info />
          </span>
        ),
      },
      error: {
        className: cx(`theme--paper`, styles.toast, styles.toastError),
        duration: 10000,
        icon: (
          <span className={cx(styles.icon, styles.iconError)}>
            <Close />
          </span>
        ),
      },
    }}
  />
);
