import { ChangeEventHandler, FocusEventHandler, HTMLProps } from 'react';
import cx from 'classnames';
import { Field } from 'formik';
import Caret from '@src/svgs/Caret';
import styles from './select.module.scss';

export type SelectOption<V extends string> = {
  value: V;
  display: string;
};

export interface SelectProps<V extends string> {
  className?: string;
  disabled?: boolean;
  id?: string;
  name: string;
  value?: V;
  onBlur?: FocusEventHandler<HTMLSelectElement>;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption<V>[];
  required?: boolean;
}

export function Select<V extends string>({
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
  const fieldId = id ?? name;

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
        id={fieldId}
        className={cx(styles.select, className)}
        name={name}
        required={required}
        disabled={disabled}
        {...controlProps}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.display}
          </option>
        ))}
      </Field>
      <span className={styles.caret}>
        <Caret />
      </span>
    </div>
  );
}
