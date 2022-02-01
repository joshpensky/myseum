import cx from 'classnames';
import { Toaster as BaseToaster } from 'react-hot-toast';
import styles from './toaster.module.scss';

export const Toaster = () => (
  <BaseToaster
    position="top-center"
    toastOptions={{
      className: styles.toast,
      duration: 6000,
      icon: null,
      success: {
        icon: null,
      },
      error: {
        className: cx(styles.toast, styles.toastError),
        duration: 10000,
        icon: null,
      },
    }}
  />
);
