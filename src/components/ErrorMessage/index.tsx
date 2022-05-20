import { AxiosError } from 'axios';
import Button from '@src/components/Button';
import { CloseIcon } from '@src/svgs/icons/CloseIcon';
import styles from './errorMessage.module.scss';

interface ErrorMessageProps {
  error: AxiosError<{ code: string }>;
  onRetry(): void;
}

export const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  const code = error.response?.data.code ?? error.code;

  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <CloseIcon />
      </div>

      <p className={styles.message}>Something went wrong.</p>
      {code && <small className={styles.code}>ERR_CODE: {code}</small>}

      <Button className={styles.action} type="button" danger onClick={() => onRetry()}>
        Retry
      </Button>
    </div>
  );
};
