import { BaseProps } from '@src/types';
import { rgba } from 'polished';
import { ChangeEvent, KeyboardEvent } from 'react';
import tw, { css, theme } from 'twin.macro';

type NumberInputProps = BaseProps & {
  id?: string;
  min?: number;
  step?: number;
  onChange(value: number): void;
  value: number;
};

const NumberInput = ({
  className,
  css: customCss,
  id,
  min,
  step,
  onChange,
  value,
}: NumberInputProps) => {
  const _onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    let value = evt.target.valueAsNumber;
    if (Number.isNaN(value)) {
      value = 0;
    }
    onChange(Math.abs(value));
  };

  const onKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.shiftKey) {
      switch (evt.key) {
        case 'ArrowUp':
        case 'Up': {
          evt.preventDefault();
          onChange(value + 10);
          return;
        }
        case 'ArrowDown':
        case 'Down': {
          evt.preventDefault();
          onChange(Math.max(value - 10, 0));
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
        tw`bg-transparent min-w-0 w-full py-1 px-2 rounded hocus:(outline-none bg-white bg-opacity-20)`,
        css`
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
        css`
          &::selection {
            background: ${rgba(theme`colors.white`, 0.35)};
          }
        `,
        customCss,
      ]}
      type="number"
      min={min}
      step={step}
      value={value}
      onKeyDown={onKeyDown}
      onChange={_onChange}
    />
  );
};

export default NumberInput;
