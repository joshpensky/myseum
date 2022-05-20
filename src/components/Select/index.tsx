import { ChangeEventHandler, FocusEventHandler, HTMLProps } from 'react';
import cx from 'classnames';
import { Field, useField } from 'formik';
import { CaretIcon } from '@src/svgs/icons/CaretIcon';
import styles from './select.module.scss';
import { FieldWrapperChildProps } from '../FieldWrapper';

export type SelectOption<V extends string> = {
  value: V;
  display: string;
};

export interface SelectProps<V extends string> extends FieldWrapperChildProps {
  className?: string;
  value?: V;
  onBlur?: FocusEventHandler<HTMLSelectElement>;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption<V>[];
}

export function Select<V extends string>({
  'aria-describedby': ariaDescribedby,
  className,
  disabled,
  id,
  name,
  options,
  value,
  onBlur,
  onChange,
  required,
}: SelectProps<V>) {
  const [, meta] = useField(name);
  const hasError = !!(meta.touched && meta.error);

  const controlProps: Partial<HTMLProps<HTMLSelectElement>> = {};
  if (typeof value !== 'undefined') {
    controlProps.value = value;
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
        as="select"
        id={id}
        className={cx(styles.select, hasError && styles.selectError, className)}
        name={name}
        required={required}
        disabled={disabled}
        {...controlProps}
        aria-describedby={ariaDescribedby}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.display}
          </option>
        ))}
      </Field>

      <span className={styles.caret}>
        <CaretIcon />
      </span>
    </div>
  );
}
