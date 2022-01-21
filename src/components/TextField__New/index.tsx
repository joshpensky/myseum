import {
  ChangeEvent,
  ChangeEventHandler,
  FocusEventHandler,
  HTMLProps,
  KeyboardEvent,
  useEffect,
  useRef,
} from 'react';
import cx from 'classnames';
import dayjs from 'dayjs';
import { Field, useField } from 'formik';
import styles from './textField.module.scss';

interface BaseTextFieldProps {
  autoComplete?: 'off' | undefined;
  className?: string;
  disabled?: boolean;
  id?: string;
  name: string;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?(): void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  'aria-describedby'?: string;
}

interface BasicTextFieldProps<Grow extends boolean> {
  type: 'text';
  grow?: Grow;
  rows?: Grow extends true ? number : never;
}

interface DateTextFieldProps {
  type: 'date';
  grow?: never;
  rows?: never;
}

interface EmailTextFieldProps {
  type: 'email';
  grow?: never;
  rows?: never;
}

type StringTextFieldProps = (
  | BasicTextFieldProps<boolean>
  | DateTextFieldProps
  | EmailTextFieldProps
) & {
  // Common props
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
  // Disable string-only props
  grow?: never;
  rows?: never;
}

type TextFieldProps = BaseTextFieldProps & (StringTextFieldProps | NumberTextFieldProps);

export const TextField = ({
  autoComplete,
  className,
  disabled,
  id,
  name,
  min,
  rows,
  onBlur,
  onFocus,
  placeholder,
  readOnly,
  required,
  step,
  'aria-describedby': ariaDescribedby,
  ...typedProps
}: TextFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fieldId = id ?? name;

  const updateGrowingHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const height = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${height + 2}px`; // account for top/bottom border
    }
  };

  useEffect(() => {
    if (typedProps.type === 'text' && typedProps.grow && textareaRef.current) {
      const observer = new ResizeObserver(entries => {
        entries.forEach(updateGrowingHeight);
      });
      observer.observe(textareaRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const [field, , helpers] = useField(name);

  if (typedProps.type === 'text' && typedProps.grow) {
    const controlProps: Partial<HTMLProps<HTMLTextAreaElement>> = {};
    if (typeof onBlur !== 'undefined') {
      controlProps.onBlur = onBlur;
    }

    return (
      <Field
        as="textarea"
        innerRef={textareaRef}
        id={fieldId}
        name={name}
        className={cx(styles.field, className)}
        rows={rows ?? 1}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-describedby={ariaDescribedby}
        {...controlProps}
        value={field.value}
        onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => {
          const { value } = evt.target;
          helpers.setValue(value.replace(/(\r\n|\n|\r)/gm, ''));
          updateGrowingHeight();
          if (typedProps.onChange) {
            typedProps.onChange(evt);
          }
        }}
        onFocus={onFocus}
        onKeyDown={(evt: KeyboardEvent) => {
          if (evt.key === 'Enter') {
            evt.preventDefault();
          }
        }}
      />
    );
  }

  const controlProps: Partial<HTMLProps<HTMLInputElement>> = {};

  if (typeof typedProps.value !== 'undefined') {
    controlProps.value = typedProps.value;
  } else if (typedProps.type === 'date') {
    controlProps.value = dayjs(field.value).format('YYYY-MM-DD');
  }

  if (typeof onBlur !== 'undefined') {
    controlProps.onBlur = onBlur;
  }

  if (typeof typedProps.onChange !== 'undefined') {
    controlProps.onChange = typedProps.onChange as any;
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
      id={fieldId}
      name={name}
      className={cx(styles.field, className)}
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
