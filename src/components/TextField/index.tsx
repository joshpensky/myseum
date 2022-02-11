import { ChangeEventHandler, ComponentProps, FocusEventHandler, forwardRef, useRef } from 'react';
import composeRefs from '@seznam/compose-react-refs';
import cx from 'classnames';
import { Field, useField } from 'formik';
import styles from './textField.module.scss';
import { FieldWrapperChildProps } from '../FieldWrapper';

interface TextFieldProps extends FieldWrapperChildProps {
  autoComplete?: 'off' | undefined;
  className?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?(): void;
  placeholder?: string;
  readOnly?: boolean;
  type?: 'text' | 'search' | 'date' | 'email';
  value?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    'aria-describedby': ariaDescribedby,
    autoComplete,
    className,
    disabled,
    id,
    name,
    onBlur,
    onFocus,
    placeholder,
    readOnly,
    required,
    ...typedProps
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [, meta] = useField(name);
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

  return (
    <Field
      innerRef={composeRefs(inputRef, ref)}
      id={id}
      name={name}
      className={cx(styles.field, hasError && styles.fieldError, className)}
      type={typedProps.type ?? 'text'}
      autoComplete={autoComplete}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      placeholder={placeholder}
      aria-describedby={ariaDescribedby}
      {...controlProps}
      onFocus={onFocus}
    />
  );
});
