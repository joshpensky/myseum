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
import { FieldWrapperChildProps } from '@src/components/FieldWrapper';
import { EWResizeCursor } from '@src/svgs/EWResizeCursor';
import { Position } from '@src/types';
import styles from './numberField.module.scss';

interface NumberFieldProps extends FieldWrapperChildProps {
  className?: string;
  max?: number;
  min?: number;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?(): void;
  placeholder?: string;
  readOnly?: boolean;
  step?: number;
  value?: number;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function TextField(
  {
    'aria-describedby': ariaDescribedby,
    className,
    disabled,
    id,
    name,
    max,
    min,
    onBlur,
    onChange,
    onFocus,
    placeholder,
    readOnly,
    required,
    step,
    value,
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [field, meta, helpers] = useField(name);
  const hasError = !!(meta.touched && meta.error);

  const controlProps: Partial<ComponentProps<'input'>> = {};

  if (typeof value !== 'undefined') {
    controlProps.value = value;
  }

  if (typeof onBlur !== 'undefined') {
    controlProps.onBlur = onBlur;
  }

  if (typeof onChange !== 'undefined') {
    controlProps.onChange = onChange;
  }

  // Allow for 10-step jumps on arrow key up or down
  controlProps.onKeyDown = evt => {
    if (evt.shiftKey) {
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

  const [hasDragIntent, setHasDragIntent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const dragDeltaRef = useRef(0);

  // Lock the pointer when holding option and pressing down
  controlProps.onPointerDown = evt => {
    if (evt.altKey) {
      inputRef.current?.requestPointerLock();
      setDragPosition({ x: evt.clientX, y: evt.clientY });
    }
  };

  // Adjust the field value when the pointer moves when dragging
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

  // Release the pointer lock when no longer dragging
  controlProps.onPointerUp = () => {
    document.exitPointerLock();
  };

  useEffect(() => {
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
  }, []);

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
        type="number"
        min={min}
        max={max}
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
            style={{ '--x': `${dragPosition.x}px`, '--y': `${dragPosition.y}px` }}
            aria-hidden="true">
            <EWResizeCursor />
          </div>
        </Portal>
      )}
    </Fragment>
  );
});
