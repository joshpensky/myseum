import { PropsWithChildren, ReactNode } from 'react';
import cx from 'classnames';
import { useField } from 'formik';
import styles from './fieldWrapper.module.scss';

interface FieldWrapperProps {
  className?: string;
  name: string;
  label: string | ReactNode;
}

export const FieldWrapper = ({
  children,
  className,
  name,
  label,
}: PropsWithChildren<FieldWrapperProps>) => {
  const [field] = useField(name);

  return (
    <div className={cx(styles.wrapper, className)}>
      <label htmlFor={field.name} className={styles.label}>
        {label}
      </label>
      {children}
    </div>
  );
};
