import { ChangeEvent, Fragment, MouseEvent as ReactMouseEvent, useEffect, useState } from 'react';
import tw, { css, TwStyle } from 'twin.macro';
import { GalleryColor } from '@prisma/client';
import { createGlobalStyle } from 'styled-components';

type GallerySettingsProps = {
  disabled?: boolean;
  id: string;
  wallColor: GalleryColor;
  onWallColorChange(nextWallColor: GalleryColor): void;
  wallHeight?: {
    minValue: number;
    value: number;
    onChange(nextWallHeight: number): void;
  };
  // minWallHeight: number;
  // wallHeight: number;
  // onWallHeightChange(nextWallHeight: number): void;
};

// Sets the global cursor to "ew-resize" so it remains the same
// no matter where on the screen the user is dragging
// TODO: allow for cursor to appear on other side of screen, ala Figma input dragging?
const GlobalResizeCursor = createGlobalStyle`
  * {
    ${tw`cursor-ew-resize!`}
  }
`;

const GallerySettings = ({
  disabled,
  id,
  wallColor,
  onWallColorChange,
  wallHeight,
}: GallerySettingsProps) => {
  const [startingDragPosition, setStartingDragPosition] = useState<number | null>(null);

  const _onWallHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
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

  type WallColorOption = {
    value: GalleryColor;
    label: string;
    color: TwStyle;
  };

  const wallColorOptions: WallColorOption[] = [
    {
      value: 'mint',
      label: 'Mint',
      color: tw`bg-mint-200 border-mint-300`,
    },
    {
      value: 'pink',
      label: 'Dusty Pink',
      color: tw`bg-pink-200 border-mint-300`,
    },
    {
      value: 'navy',
      label: 'Navy',
      color: tw`bg-navy-200 border-navy-800`,
    },
    {
      value: 'paper',
      label: 'Paper',
      color: tw`bg-paper-200 border-mint-300`,
    },
    {
      value: 'ink',
      label: 'Ink',
      color: tw`bg-black border-white`,
    },
  ];

  return (
    <Fragment>
      <fieldset css={tw`flex flex-col mb-1`}>
        <legend css={tw`text-sm mb-1.5`}>Wall color</legend>
        <div css={tw`flex`}>
          {wallColorOptions.map(({ value, label, color }) => (
            <label
              key={value}
              className="group"
              css={tw`cursor-pointer not-last:mr-2 rounded-full`}>
              <input
                css={tw`sr-only checked:sibling:ring-1 focus:checked:sibling:ring-2`}
                type="radio"
                disabled={disabled}
                checked={value === wallColor}
                onChange={() => onWallColorChange(value)}
                name={`${id}-wallColor`}
              />
              <span
                css={[
                  tw`flex size-8 rounded-full border ring-0 ring-black transition-shadow`,
                  color,
                ]}
              />
              <span css={tw`sr-only`}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {wallHeight && (
        <div css={tw`flex flex-col items-start mt-3`}>
          <label css={tw`text-sm`} htmlFor="wallHeight">
            Wall height
          </label>
          <div css={tw`flex border-b border-mint-300 transition-colors focus-within:border-black`}>
            <div css={tw`relative`}>
              <span css={tw`invisible`} aria-hidden="true">
                {wallHeight.value}
              </span>
              <input
                css={[
                  tw`absolute left-0 m-0 w-full cursor-ew-resize focus:outline-none`,
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
                ]}
                id={`${id}-wallHeight`}
                type="number"
                step={1}
                disabled={disabled}
                min={wallHeight.minValue}
                value={wallHeight.value === 0 ? '' : wallHeight.value}
                onChange={_onWallHeightChange}
                onMouseDown={onInputMouseDown}
              />
              {startingDragPosition !== null && <GlobalResizeCursor />}
            </div>
            <span css={tw`ml-1 text-mint-600`}>
              in<span css={tw`sr-only`}>ches</span>
            </span>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default GallerySettings;
