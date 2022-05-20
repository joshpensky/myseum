import {
  ChangeEvent,
  ChangeEventHandler,
  FocusEventHandler,
  HTMLProps,
  KeyboardEvent,
  useRef,
} from 'react';
import cx from 'classnames';
import { Field, useField } from 'formik';
import { FieldWrapperChildProps } from '@src/components/FieldWrapper';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import styles from './textArea.module.scss';

export interface TextAreaProps extends FieldWrapperChildProps {
  className?: string;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onFocus?(): void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  value?: string;
}

export const TextArea = ({
  'aria-describedby': ariaDescribedby,
  className,
  disabled,
  id,
  name,
  rows,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  readOnly,
  required,
  value,
}: TextAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateGrowingHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const height = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${height + 2}px`; // account for top/bottom border
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (textareaRef.current) {
      const observer = new ResizeObserver(entries => {
        entries.forEach(updateGrowingHeight);
      });
      observer.observe(textareaRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const [field, meta, helpers] = useField({ name, value });
  const hasError = !!(meta.touched && meta.error);

  const controlProps: Partial<HTMLProps<HTMLTextAreaElement>> = {};
  if (typeof onBlur !== 'undefined') {
    controlProps.onBlur = onBlur;
  }

  return (
    <Field
      as="textarea"
      innerRef={textareaRef}
      id={id}
      name={name}
      className={cx(styles.field, hasError && styles.fieldError, className)}
      rows={rows ?? 1}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      placeholder={placeholder}
      aria-describedby={ariaDescribedby}
      {...controlProps}
      value={field.value}
      onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = evt.target.value.replace(/(\r\n|\n|\r)/gm, '');
        helpers.setValue(nextValue);
        updateGrowingHeight();
        if (onChange) {
          onChange({
            ...evt,
            target: {
              ...evt.target,
              value: nextValue,
            },
          });
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
};
