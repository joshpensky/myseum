import Caret from '@src/svgs/Caret';
import { BaseProps } from '@src/types';
import { ChangeEvent } from 'react';
import tw from 'twin.macro';

export type SelectOption = {
  value: string;
  display: string;
};

export type SelectProps = BaseProps & {
  id?: string;
  options: SelectOption[];
  onChange(value: string): void;
  value: string;
};

const Select = ({ className, css: customCss, id, options, value, onChange }: SelectProps) => {
  const _onChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    onChange(evt.target.value);
  };

  return (
    <div
      css={[
        tw`flex items-center rounded relative border border-white border-opacity-20 bg-white bg-opacity-0`,
        tw`hover:(bg-opacity-10) focus-within:(bg-opacity-20)`,
      ]}>
      <select
        id={id}
        className={className}
        css={[
          tw`flex flex-1 bg-transparent py-2 pl-3 pr-8 appearance-none cursor-pointer focus:outline-none`,
          customCss,
        ]}
        value={value}
        onChange={_onChange}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.display}
          </option>
        ))}
      </select>
      <span
        css={tw`absolute top-1/2 right-2 size-3 transform -translate-y-1/2 pointer-events-none`}>
        <Caret />
      </span>
    </div>
  );
};

export default Select;
