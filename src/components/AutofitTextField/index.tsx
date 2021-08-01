import { Fragment, ReactNode, useRef } from 'react';
import cx from 'classnames';
import styles from './autofitTextField.module.scss';

interface AutofitTextFieldProps {
  className?: string;
  disabled?: boolean;
  id: string;
  label: string;
  inputClassName?: string;
  onChange(nextValue: string): void;
  placeholder?: string;
  required?: boolean;
  value: string;
}

const AutofitTextField = ({
  className,
  disabled,
  id,
  inputClassName,
  label,
  onChange,
  placeholder,
  required,
  value,
}: AutofitTextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  let fakeValue: ReactNode = placeholder ?? <span>&nbsp;</span>;
  if (value) {
    fakeValue = value
      .split('')
      .map((char, i) => <span key={i}>{char === ' ' ? <Fragment>&nbsp;</Fragment> : char}</span>);
  }

  return (
    <div className={cx(styles.wrapper, disabled && styles.wrapperDisabled, className)}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>

      <span className={cx(styles.fakeInput, inputClassName)} aria-hidden="true">
        {fakeValue}
      </span>

      <input
        ref={inputRef}
        id={id}
        className={cx(styles.input, inputClassName)}
        type="text"
        aria-label={label}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        onChange={evt => onChange(evt.target.value)}
      />
    </div>
  );
};

export default AutofitTextField;
