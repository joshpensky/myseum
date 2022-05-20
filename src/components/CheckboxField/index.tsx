import { ChangeEventHandler, FocusEventHandler, HTMLProps, ReactNode } from 'react';
import cx from 'classnames';
import { Field, useField } from 'formik';
import { FieldWrapperChildProps } from '@src/components/FieldWrapper';
import { CheckmarkIcon } from '@src/svgs/icons/CheckmarkIcon';
import styles from './checkboxField.module.scss';

interface CheckboxFieldProps extends Omit<FieldWrapperChildProps, 'id' | 'aria-describedby'> {
  id?: string;
  label: string | ReactNode;
  checked?: boolean;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const CheckboxField = ({
  checked,
  id,
  label,
  name,
  required,
  disabled,
  onBlur,
  onChange,
}: CheckboxFieldProps) => {
  const fieldId = id ?? name;

  const [, meta] = useField(name);
  const hasError = !!(meta.touched && meta.error);

  const controlProps: Partial<HTMLProps<HTMLInputElement>> = {};
  if (typeof checked !== 'undefined') {
    controlProps.checked = checked;
  }
  if (typeof onBlur !== 'undefined') {
    controlProps.onBlur = onBlur;
  }
  if (typeof onChange !== 'undefined') {
    controlProps.onChange = onChange;
  }

  return (
    <div className={styles.wrapper}>
      <Field
        id={fieldId}
        name={name}
        className="sr-only"
        type="checkbox"
        required={required}
        disabled={disabled}
        aria-describedby={`${fieldId}-error`}
        {...controlProps}
      />
      <label htmlFor={fieldId} className={cx(styles.label, hasError && styles.labelError)}>
        {label}
      </label>
      <div className={styles.checkmark} aria-hidden="true">
        <CheckmarkIcon />
      </div>

      {hasError && (
        <p id={`${fieldId}-error`} className={styles.error}>
          {meta.error}
        </p>
      )}
    </div>
  );
};
