import { ChangeEvent, FocusEventHandler, Fragment, HTMLProps, ReactNode } from 'react';
import cx from 'classnames';
import { Field, useField } from 'formik';
import { FieldWrapperChildProps } from '@src/components/FieldWrapper';
import styles from './radioGroup.module.scss';

export type RadioGroupOption<V extends string | boolean> = {
  value: V;
  display: ReactNode;
};

export interface RadioGroupProps<V extends string | boolean> extends FieldWrapperChildProps {
  className?: string;
  value?: V;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?(evt: ChangeEvent<HTMLInputElement>, option: RadioGroupOption<V>): void;
  options: RadioGroupOption<V>[];
}

export const RadioGroup = <V extends string | boolean>({
  'aria-describedby': ariaDescribedby,
  className,
  id,
  name,
  disabled,
  required,
  value,
  onBlur,
  onChange,
  options,
}: RadioGroupProps<V>) => {
  const [field, , helpers] = useField({ name, value: String(value) });
  const selectedIndex = Math.max(
    0,
    options.findIndex(option => option.value === field.value),
  );

  const controlProps: Partial<HTMLProps<HTMLInputElement>> = {};
  if (typeof onBlur !== 'undefined') {
    controlProps.onBlur = onBlur;
  }

  return (
    <div
      className={cx(styles.group, className)}
      style={{ '--options': options.length, '--selected-index': selectedIndex }}>
      {options.map(option => (
        <Fragment key={String(option.value)}>
          <Field
            id={`${id}-${String(option.value)}`}
            name={name}
            className="sr-only"
            type="radio"
            disabled={disabled}
            required={required}
            value={String(option.value)}
            checked={field.value === option.value}
            {...controlProps}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              helpers.setValue(option.value);
              onChange?.(evt, option);
            }}
            aria-describedby={ariaDescribedby}
          />
          <label htmlFor={`${id}-${String(option.value)}`} className={styles.item}>
            {option.display}
          </label>
        </Fragment>
      ))}
    </div>
  );
};
