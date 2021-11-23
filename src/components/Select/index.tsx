import { ChangeEvent } from 'react';
import tw from 'twin.macro';
import cx from 'classnames';
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
  onChange(value: V): void;
  options: SelectOption<V>[];
  required?: boolean;
  value: V;
}

export function Select<V extends string>({
  className,
  disabled,
  id,
  onChange,
  options,
  required,
  value,
}: SelectProps<V>) {
  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    onChange(evt.target.value as V);
  };

  return (
    <div className={cx(styles.wrapper, disabled && styles.wrapperDisabled)}>
      <select
        id={id}
        className={className}
        css={[
          tw`flex flex-1 bg-transparent py-2 pl-3 pr-9 appearance-none cursor-pointer opacity-100`,
          tw`disabled:(text-gray-300 text-opacity-70 cursor-not-allowed) focus:outline-none`,
        ]}
        required={required}
        disabled={disabled}
        value={value}
        onChange={handleChange}>
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
}
