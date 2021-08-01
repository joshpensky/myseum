import { ChangeEvent, Fragment, MouseEvent as ReactMouseEvent, useEffect, useState } from 'react';
import { GalleryColor } from '@prisma/client';
import { useId } from '@radix-ui/react-id';
import cx from 'classnames';
import styles from './gallerySettings.module.scss';

interface WallColorOption {
  value: GalleryColor;
  label: string;
}
const wallColorOptions: WallColorOption[] = [
  {
    value: 'mint',
    label: 'Mint',
  },
  {
    value: 'pink',
    label: 'Dusty Pink',
  },
  {
    value: 'navy',
    label: 'Navy',
  },
  {
    value: 'paper',
    label: 'Paper',
  },
  {
    value: 'ink',
    label: 'Ink',
  },
];

type GallerySettingsProps = {
  disabled?: boolean;
  wallColor: GalleryColor;
  onWallColorChange(nextWallColor: GalleryColor): void;
  wallHeight?: {
    minValue: number;
    value: number;
    onChange(nextWallHeight: number): void;
  };
};

const GallerySettings = ({
  disabled,
  wallColor,
  onWallColorChange,
  wallHeight,
}: GallerySettingsProps) => {
  const id = useId();

  const [startingDragPosition, setStartingDragPosition] = useState<number | null>(null);

  const handleWallHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
    let value = evt.target.valueAsNumber;
    if (Number.isNaN(value)) {
      value = 0;
    }
    wallHeight?.onChange(value);
  };

  // Starts the drag listening on the wall height input
  const onInputMouseDown = (evt: ReactMouseEvent<HTMLInputElement>) => {
    if (!disabled) {
      setStartingDragPosition(evt.clientX);
    }
  };

  // When the mouse drags on the input, resize the wall height accordingly
  const onInputDrag = (evt: MouseEvent) => {
    if (startingDragPosition !== null) {
      evt.preventDefault();
      const delta = Math.ceil((evt.clientX - startingDragPosition) / 16);
      wallHeight?.onChange(Math.max(wallHeight.minValue, wallHeight.value + delta));
    }
  };

  // When the mouse is released, stop the drag listeners
  const onInputDragRelease = (evt: MouseEvent) => {
    evt.preventDefault();
    setStartingDragPosition(null);

    // Stops the Popover component's "click" listener from closing the container
    // when the mouse is released outside the popover
    const captureInputClick = (evt: MouseEvent) => {
      evt.stopPropagation();
      document.removeEventListener('click', captureInputClick, true);
    };

    document.addEventListener('click', captureInputClick, true);
  };

  // Attaches drag and release listeners when drag is detected
  useEffect(() => {
    if (startingDragPosition !== null && !disabled) {
      document.addEventListener('mousemove', onInputDrag);
      document.addEventListener('mouseup', onInputDragRelease);

      return () => {
        document.removeEventListener('mousemove', onInputDrag);
        document.removeEventListener('mouseup', onInputDragRelease);
      };
    }
  }, [startingDragPosition, disabled]);

  // Sets the global cursor to "ew-resize" so it remains the same
  // no matter where on the screen the user is dragging
  // TODO: allow for cursor to appear on other side of screen, ala Figma input dragging?
  useEffect(() => {
    const isDragging = startingDragPosition !== null;
    document.documentElement.classList.toggle(styles.dragging, isDragging);
  }, [startingDragPosition]);

  return (
    <Fragment>
      <fieldset className={styles.colorFieldset}>
        <legend className={styles.formLabel}>Wall color</legend>
        <ul className={styles.colorList}>
          {wallColorOptions.map(({ value, label }) => (
            <li key={value} className={styles.colorOption}>
              <input
                className={cx('sr-only', styles.colorInput)}
                id={`${id}-wallColor-${value}`}
                name={`${id}-wallColor`}
                type="radio"
                disabled={disabled}
                checked={value === wallColor}
                onChange={() => onWallColorChange(value)}
              />
              <label
                className={cx(`theme--${value}`, styles.colorOptionItem)}
                htmlFor={`${id}-wallColor-${value}`}>
                <span className="sr-only">{label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {wallHeight && (
        <div className={styles.heightFieldset}>
          <label className={styles.formLabel} htmlFor="wallHeight">
            Wall height
          </label>
          <div className={styles.heightInput}>
            <div className={styles.heightInputInner}>
              <span className={styles.heightInputFakeValue} aria-hidden="true">
                {wallHeight.value}
              </span>
              <input
                id={`${id}-wallHeight`}
                className={styles.heightInputActual}
                type="number"
                step={1}
                disabled={disabled}
                min={wallHeight.minValue}
                value={wallHeight.value === 0 ? '' : wallHeight.value}
                onChange={handleWallHeightChange}
                onMouseDown={onInputMouseDown}
              />
            </div>
            <abbr className={styles.heightInputSuffix} title="inches">
              in
            </abbr>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default GallerySettings;
