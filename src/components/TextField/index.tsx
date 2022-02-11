import {
  ChangeEventHandler,
  ComponentProps,
  FocusEventHandler,
  forwardRef,
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Portal } from '@radix-ui/react-portal';
import composeRefs from '@seznam/compose-react-refs';
import cx from 'classnames';
import { Field, useField } from 'formik';
import { EWResizeCursor } from '@src/svgs/EWResizeCursor';
import { Position } from '@src/types';
import styles from './textField.module.scss';
import { FieldWrapperChildProps } from '../FieldWrapper';

interface BaseTextFieldProps extends FieldWrapperChildProps {
  autoComplete?: 'off' | undefined;
  className?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?(): void;
  placeholder?: string;
  readOnly?: boolean;
}

type StringTextFieldProps = {
  // Common props
  type: 'text' | 'search' | 'date' | 'email';
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
}

type TextFieldProps = BaseTextFieldProps & (StringTextFieldProps | NumberTextFieldProps);

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    'aria-describedby': ariaDescribedby,
    autoComplete,
    className,
    disabled,
    id,
    name,
    min,
    onBlur,
    onFocus,
    placeholder,
    readOnly,
    required,
    step,
    ...typedProps
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [field, meta, helpers] = useField(name);
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

  const [hasDragIntent, setHasDragIntent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const dragDeltaRef = useRef(0);
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
            helpers.setValue(Math.max(min ?? 0, field.value - 10));
            return;
          }
        }
      }
    };

    controlProps.onPointerDown = evt => {
      if (evt.altKey) {
        inputRef.current?.requestPointerLock();
        setDragPosition({ x: evt.clientX, y: evt.clientY });
      }
    };

    controlProps.onPointerMove = evt => {
      if (isDragging) {
        const pixelsPerStep = 20;
        const currDelta = Math.floor(dragDeltaRef.current / pixelsPerStep);
        dragDeltaRef.current += evt.movementX;
        const nextDelta = Math.floor(dragDeltaRef.current / pixelsPerStep);
        helpers.setValue(Math.max(min ?? 0, field.value + (nextDelta - currDelta)));

        setDragPosition(pos => {
          if (!pos) {
            return null;
          }
          let x = (pos.x + evt.movementX) % window.innerWidth;
          if (x < 0) {
            x = window.innerWidth + x;
          }
          return { x, y: pos.y };
        });
      }
    };

    controlProps.onPointerUp = () => {
      document.exitPointerLock();
    };
  }

  useEffect(() => {
    if (typedProps.type === 'number') {
      const onPointerLockChange = () => {
        const isDragging = !!(inputRef.current && document.pointerLockElement === inputRef.current);
        setIsDragging(isDragging);
        if (!isDragging) {
          setDragPosition(null);
          dragDeltaRef.current = 0;
        }
      };
      document.addEventListener('pointerlockchange', onPointerLockChange);

      const onKeyDown = (evt: KeyboardEvent) => {
        if (evt.altKey) {
          setHasDragIntent(true);
        }
      };
      document.addEventListener('keydown', onKeyDown);

      const onKeyUp = () => {
        setHasDragIntent(false);
      };
      document.addEventListener('keyup', onKeyUp);

      return () => {
        document.removeEventListener('pointerlockchange', onPointerLockChange);
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
      };
    }
  }, [typedProps.type]);

  return (
    <Fragment>
      <Field
        innerRef={composeRefs(inputRef, ref)}
        id={id}
        name={name}
        className={cx(
          styles.field,
          hasError && styles.fieldError,
          hasDragIntent && styles.dragging,
          className,
        )}
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
      {dragPosition && (
        <Portal>
          <div
            className={styles.pointer}
            style={{ '--x': `${dragPosition.x}px`, '--y': `${dragPosition.y}px` }}>
            <EWResizeCursor />
          </div>
        </Portal>
      )}
    </Fragment>
  );
});
