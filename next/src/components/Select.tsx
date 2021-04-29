import { ChangeEvent } from 'react';
import tw from 'twin.macro';
import Caret from '@src/svgs/Caret';
import { BaseProps } from '@src/types';

export type SelectOption = {
  value: string;
  display: string;
};

export type SelectProps = BaseProps & {
  disabled?: boolean;
  id?: string;
  onChange(value: string): void;
  options: SelectOption[];
  required?: boolean;
  value: string;
};

const Select = ({
  className,
  css: customCss,
  disabled,
  id,
  onChange,
  options,
  required,
  value,
}: SelectProps) => {
  const _onChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    onChange(evt.target.value);
  };

  return (
    <div
      css={[
        tw`flex items-center rounded relative border border-white border-opacity-20 bg-white bg-opacity-0`,
        !disabled && tw`hover:(bg-opacity-10) focus-within:(bg-opacity-15)`,
      ]}>
      <select
        id={id}
        className={className}
        css={[
          tw`flex flex-1 bg-transparent py-2 pl-3 pr-9 appearance-none cursor-pointer opacity-100`,
          tw`disabled:(text-gray-300 text-opacity-70 cursor-not-allowed) focus:outline-none`,
          customCss,
        ]}
        required={required}
        disabled={disabled}
        value={value}
        onChange={_onChange}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.display}
          </option>
        ))}
      </select>
      <span
        css={tw`absolute top-1/2 right-3 size-3 transform -translate-y-1/2 pointer-events-none`}>
        <Caret />
      </span>
    </div>
  );
};

export default Select;
