import cx from 'classnames';
import { Toaster as BaseToaster } from 'react-hot-toast';
import styles from './toaster.module.scss';

const TOP_OFFSET = Number.parseInt(styles.varTopOffset, 10);
const GUTTER = Number.parseInt(styles.varGutter, 10);

export const Toaster = () => (
  <BaseToaster
    position="top-center"
    containerStyle={{ top: TOP_OFFSET }}
    gutter={GUTTER}
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
