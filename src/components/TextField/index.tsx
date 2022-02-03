import { ChangeEventHandler, ComponentProps, FocusEventHandler } from 'react';
import cx from 'classnames';
import { Field, useField } from 'formik';
import styles from './textField.module.scss';
import { FieldWrapperChildProps } from '../FieldWrapper';

interface BaseTextFieldProps extends FieldWrapperChildProps {
  autoComplete?: 'off' | undefined;
  className?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?(): void;
  placeholder?: string;
  readOnly?: boolean;
}

type StringTextFieldProps = {
  // Common props
  type: 'text' | 'search' | 'date' | 'email';
  value?: string;
  // Disable number-only props
  min?: never;
  step?: never;
};

interface NumberTextFieldProps {
  // Common props
  type: 'number';
  value?: number;
  // Number-only props
  min?: number;
  step?: number;
}

type TextFieldProps = BaseTextFieldProps & (StringTextFieldProps | NumberTextFieldProps);

export const TextField = ({
  'aria-describedby': ariaDescribedby,
  autoComplete,
  className,
  disabled,
  id,
  name,
  min,
  onBlur,
  onFocus,
  placeholder,
  readOnly,
  required,
  step,
  ...typedProps
}: TextFieldProps) => {
  const [field, meta, helpers] = useField(name);
  const hasError = !!(meta.touched && meta.error);

  const controlProps: Partial<ComponentProps<'input'>> = {};

  if (typeof typedProps.value !== 'undefined') {
    controlProps.value = typedProps.value;
  }

  if (typeof onBlur !== 'undefined') {
    controlProps.onBlur = onBlur;
  }

  if (typeof typedProps.onChange !== 'undefined') {
    controlProps.onChange = typedProps.onChange;
  }

  if (typedProps.type === 'number') {
    controlProps.onKeyDown = evt => {
      if (typedProps.type === 'number' && evt.shiftKey) {
        switch (evt.key) {
          case 'ArrowUp':
          case 'Up': {
            evt.preventDefault();
            helpers.setValue(field.value + 10);
            return;
          }
          case 'ArrowDown':
          case 'Down': {
            evt.preventDefault();
            helpers.setValue(Math.max(field.value - 10, 0));
            return;
          }
        }
      }
    };
  }

  return (
    <Field
      id={id}
      name={name}
      className={cx(styles.field, hasError && styles.fieldError, className)}
      type={typedProps.type}
      autoComplete={autoComplete}
      min={min}
      step={step}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      placeholder={placeholder}
      aria-describedby={ariaDescribedby}
      {...controlProps}
      onFocus={onFocus}
    />
  );
};
