import { ReactNode } from 'react';
import cx from 'classnames';
import { useField, useFormikContext } from 'formik';
import styles from './fieldWrapper.module.scss';

export interface FieldWrapperChildProps {
  id: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  'aria-describedby': string;
}

export interface FieldWrapperProps {
  className?: string;
  children(props: FieldWrapperChildProps): ReactNode;
  id?: string;
  name: string;
  label: string;
  labelClassName?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FieldWrapper = ({
  children,
  className,
  id,
  name,
  label,
  labelClassName,
  required,
  disabled,
}: FieldWrapperProps) => {
  const fieldId = id ?? name;
  const [, meta] = useField(name);
  const formikCtx = useFormikContext();

  const childProps: FieldWrapperChildProps = {
    id: fieldId,
    name,
    required,
    disabled: disabled || formikCtx.isSubmitting,
    'aria-describedby': `${fieldId}-error`,
  };

  return (
    <div className={cx(styles.wrapper, childProps.disabled && styles.wrapperDisabled, className)}>
      <label htmlFor={fieldId} className={cx(styles.label, labelClassName)}>
        {label} {!required && <span className={styles.labelOptional}>(optional)</span>}
      </label>

      {children(childProps)}

      {meta.touched && meta.error && (
        <p id={`${fieldId}-error`} className={styles.error}>
          {meta.error}
        </p>
      )}
    </div>
  );
};
