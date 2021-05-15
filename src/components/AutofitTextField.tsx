import { useEffect, useRef, useState } from 'react';
import tw, { theme as twTheme } from 'twin.macro';
import { rgba, parseToRgb, rgbToColorString } from 'polished';
import { css, CSSProp } from 'styled-components';
import { BaseProps } from '@src/types';

interface AutofitTextFieldProps extends BaseProps {
  disabled?: boolean;
  id: string;
  label: string;
  inputCss?: CSSProp<any>;
  onChange(nextValue: string): void;
  required?: boolean;
  value: string;
}

const AutofitTextField = ({
  className,
  css: wrapperCss,
  disabled,
  id,
  inputCss,
  label,
  onChange,
  required,
  value,
}: AutofitTextFieldProps) => {
  const [colorTheme, setColorTheme] = useState<'dark' | 'light'>('dark');
  const inputRef = useRef<HTMLInputElement>(null);

  const rafId = useRef<number | null>(null);

  const updateColorTheme = () => {
    try {
      // Check if input ref has been assigned
      if (!inputRef.current) {
        return;
      }

      // Check if color has been assigned
      const styles = window.getComputedStyle(inputRef.current);
      if (!styles.color) {
        return;
      }

      // Once color has been assigned, set theme
      if (
        rgbToColorString(parseToRgb(styles.color)) ===
        rgbToColorString(parseToRgb(twTheme`colors.white`))
      ) {
        setColorTheme('light');
      } else {
        setColorTheme('dark');
      }
    } finally {
      // And loop
      rafId.current = requestAnimationFrame(updateColorTheme);
    }
  };

  useEffect(() => {
    updateColorTheme();

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, []);

  let selectionColor = rgba(twTheme`colors.black`, 0.15);
  if (colorTheme === 'light') {
    selectionColor = rgba(twTheme`colors.white`, 0.35);
  }

  return (
    <div
      className={className}
      css={[
        colorTheme === 'light'
          ? tw`bg-white hover:bg-opacity-20 focus-within:bg-opacity-20`
          : tw`bg-black hover:bg-opacity-10 focus-within:bg-opacity-10`,
        tw`p-2 relative bg-opacity-0 rounded max-w-full transition-all`,
        !value && tw`w-0 overflow-x-hidden`,
        wrapperCss,
      ]}>
      <label css={[tw`sr-only`]} htmlFor={id}>
        {label}
      </label>

      <span css={[tw`invisible whitespace-nowrap`, inputCss]} aria-hidden="true">
        {Array(value.length - value.trimStart().length)
          .fill(null)
          .map((_, index) => (
            <span key={index}>&nbsp;</span>
          ))}
        {value ? value.trim() : <span>&nbsp;</span>}
        {value.trim().length > 0 &&
          Array(value.length - value.trimEnd().length)
            .fill(null)
            .map((_, index) => <span key={index}>&nbsp;</span>)}
      </span>

      <input
        ref={inputRef}
        id={id}
        css={[
          tw`absolute left-2 top-2 bg-transparent text-current focus:outline-none`,
          css`
            width: calc(100% - ${twTheme`spacing.4`});
            &::selection {
              background: ${selectionColor};
            }
          `,
          inputCss,
        ]}
        type="text"
        aria-label={label}
        value={value}
        disabled={disabled}
        required={required}
        onChange={evt => onChange(evt.target.value)}
      />
    </div>
  );
};

export default AutofitTextField;
