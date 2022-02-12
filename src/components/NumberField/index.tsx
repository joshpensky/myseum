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

  /**
   * Jump 10x steps when holding shift and pressing up or down arrow keys.
   */
  controlProps.onKeyDown = evt => {
    if (evt.shiftKey) {
      const megaStep = (step ?? 1) * 10;
      switch (evt.key) {
        case 'ArrowUp':
        case 'Up': {
          evt.preventDefault();
          let nextValue = field.value + megaStep;
          if (max) {
            nextValue = Math.min(max, nextValue);
          }
          helpers.setValue(nextValue);
          return;
        }
        case 'ArrowDown':
        case 'Down': {
          evt.preventDefault();
          let nextValue = field.value - megaStep;
          if (min) {
            nextValue = Math.max(min, nextValue);
          }
          helpers.setValue(nextValue);
          return;
        }
      }
    }
  };

  const [hasDragIntent, setHasDragIntent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const dragDeltaRef = useRef(0);

  /**
   * Locks the pointer when holding the option key and clicking.
   */
  controlProps.onPointerDown = evt => {
    if (evt.altKey) {
      inputRef.current?.requestPointerLock();
      setDragPosition({ x: evt.clientX, y: evt.clientY });
    }
  };

  /**
   * Adjusts the field value when dragging.
   */
  controlProps.onPointerMove = evt => {
    if (isDragging) {
      // Calculate the new drag delta based on mouse movement
      const PIXELS_PER_STEP = 20;
      const currDragDelta = Math.floor(dragDeltaRef.current / PIXELS_PER_STEP);
      dragDeltaRef.current += evt.movementX;
      const nextDragDelta = Math.floor(dragDeltaRef.current / PIXELS_PER_STEP);

      // Calculate the new value based on the difference in drag
      const valueDelta = (nextDragDelta - currDragDelta) * (step ?? 1);
      let nextValue = field.value + valueDelta;
      if (min) {
        nextValue = Math.max(min, nextValue);
      }
      if (max) {
        nextValue = Math.min(max, nextValue);
      }
      helpers.setValue(nextValue);

      // Update the drag position
      setDragPosition(pos => {
        if (!pos) {
          return null;
        }
        // Loop the X position around when reaching either end of screen
        let x = (pos.x + evt.movementX) % window.innerWidth;
        if (x < 0) {
          x = window.innerWidth + x;
        }
        return { x, y: pos.y };
      });
    }
  };

  /**
   * Releases the pointer lock when click is released.
   */
  controlProps.onPointerUp = () => {
    document.exitPointerLock();
  };

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      /**
       * Updates the dragging state when pointer lock is enabled/disabled.
       */
      const onPointerLockChange = () => {
        const isDragging = document.pointerLockElement === input;
        setIsDragging(isDragging);
        if (!isDragging) {
          setDragPosition(null);
          dragDeltaRef.current = 0;
        }
      };
      document.addEventListener('pointerlockchange', onPointerLockChange);

      /**
       * Sets the drag intent when option key is pressed.
       */
      const onKeyDown = (evt: KeyboardEvent) => {
        if (evt.altKey) {
          setHasDragIntent(true);
        }
      };
      document.addEventListener('keydown', onKeyDown);

      /**
       * Releases the drag intent when option key is released.
       */
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
            className={styles.dragPointer}
            style={{ '--x': `${dragPosition.x}px`, '--y': `${dragPosition.y}px` }}
            aria-hidden="true">
            <EWResizeCursor />
          </div>
        </Portal>
      )}
    </Fragment>
  );
});
