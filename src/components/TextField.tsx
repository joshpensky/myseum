import { ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import tw, { css } from 'twin.macro';
import { BaseProps } from '@src/types';

type BaseTextFieldProps = BaseProps & {
  autoComplete?: 'off' | undefined;
  disabled?: boolean;
  id?: string;
  onBlur?(): void;
  onFocus?(): void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
};

type EmailTextFieldProps = {
  type: 'email';
  grow?: never;
  rows?: never;
};

type GrowTextFieldProps<T extends boolean> = {
  grow: T;
  rows?: T extends true ? number : never;
};
type BasicTextFieldProps = {
  type: 'text';
} & GrowTextFieldProps<boolean>;

type StringTextFieldProps = (EmailTextFieldProps | BasicTextFieldProps) & {
  // Common props
  onChange(value: string): void;
  value: string;
  // Disable number-only props
  min?: never;
  step?: never;
};

type NumberTextFieldProps = {
  // Common props
  type: 'number';
  onChange(value: number): void;
  value: number;
  // Number-only props
  min?: number;
  // Disable string-only props
  step?: number;
  grow?: never;
  rows?: never;
};

type TextFieldProps = BaseTextFieldProps & (StringTextFieldProps | NumberTextFieldProps);

const TextField = ({
  autoComplete,
  className,
  css: customCss,
  disabled,
  id,
  min,
  grow,
  rows,
  onBlur,
  onFocus,
  placeholder,
  readOnly,
  required,
  step,
  ...typedProps
}: TextFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const _onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (typedProps.type === 'number') {
      let value = evt.target.valueAsNumber;
      if (Number.isNaN(value)) {
        value = 0;
      }
      typedProps.onChange(Math.abs(value));
    } else {
      typedProps.onChange(evt.target.value);
    }
  };

  const updateGrowingHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const height = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${height + 2}px`; // account for top/bottom border
    }
  };

  useEffect(() => {
    if (typedProps.type === 'text' && grow && textareaRef.current) {
      const observer = new ResizeObserver(entries => {
        entries.forEach(updateGrowingHeight);
      });
      observer.observe(textareaRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const commonStyles = [
    tw`bg-transparent min-w-0 w-full py-2 px-3 border border-white border-opacity-20 bg-white bg-opacity-0 rounded`,
    tw`ring-1 ring-black ring-opacity-20 not-disabled:(hover:ring-opacity-40 focus:ring-opacity-100 transition-shadow)`,
    tw`placeholder-gray-300 placeholder-opacity-70`,
    [
      tw`disabled:(text-gray-300 text-opacity-70 placeholder-opacity-50 cursor-not-allowed)`,
      tw`not-disabled:hover:(bg-opacity-10) not-disabled:focus:(outline-none bg-opacity-15)`,
    ],
    customCss,
  ];

  if (typedProps.type === 'text' && grow) {
    return (
      <textarea
        ref={textareaRef}
        id={id}
        className={className}
        css={[tw`max-h-36 resize-none`, commonStyles]}
        rows={rows ?? 1}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        value={typedProps.value}
        onBlur={onBlur}
        onChange={evt => {
          const { value } = evt.target;
          typedProps.onChange(value.replace(/(\r\n|\n|\r)/gm, ''));
          updateGrowingHeight();
        }}
        onFocus={onFocus}
        onKeyDown={evt => {
          if (evt.key === 'Enter') {
            evt.preventDefault();
          }
        }}
      />
    );
  }

  const onNumberKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (typedProps.type === 'number' && evt.shiftKey) {
      switch (evt.key) {
        case 'ArrowUp':
        case 'Up': {
          evt.preventDefault();
          typedProps.onChange(typedProps.value + 10);
          return;
        }
        case 'ArrowDown':
        case 'Down': {
          evt.preventDefault();
          typedProps.onChange(Math.max(typedProps.value - 10, 0));
          return;
        }
      }
    }
  };

  return (
    <input
      id={id}
      className={className}
      css={[
        commonStyles,
        typedProps.type === 'number' &&
          css`
            // Disable the up/down arrow buttons on number fields
            /* Chrome, Safari, Edge, Opera */
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
              -webkit-appearance: none;
            }
            /* Firefox */
            &[type='number'] {
              -moz-appearance: textfield;
            }
          `,
      ]}
      type={typedProps.type}
      autoComplete={autoComplete}
      min={min}
      step={step}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      placeholder={placeholder}
      value={typedProps.value}
      onBlur={onBlur}
      onChange={_onChange}
      onFocus={onFocus}
      onKeyDown={typedProps.type === 'number' ? onNumberKeyDown : undefined}
    />
  );
};

export default TextField;
