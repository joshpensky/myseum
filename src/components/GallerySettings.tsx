import { ChangeEvent, Fragment } from 'react';
import tw, { css, TwStyle } from 'twin.macro';
import { GalleryColor } from '@src/types';

type GallerySettingsProps = {
  wallColor: GalleryColor;
  onWallColorChange(nextWallColor: GalleryColor): void;
  minWallHeight: number;
  wallHeight: number;
  onWallHeightChange(nextWallHeight: number): void;
};

const GallerySettings = ({
  wallColor,
  onWallColorChange,
  minWallHeight,
  wallHeight,
  onWallHeightChange,
}: GallerySettingsProps) => {
  const _onWallHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
    let value = evt.target.valueAsNumber;
    if (Number.isNaN(value)) {
      value = 0;
    }
    onWallHeightChange(value);
  };

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
  ];

  return (
    <Fragment>
      <fieldset css={tw`flex flex-col mb-4`}>
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
                checked={value === wallColor}
                onChange={() => onWallColorChange(value)}
                name="wallColor"
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

      <div css={tw`flex flex-col items-start`}>
        <label css={tw`text-sm`} htmlFor="wallHeight">
          Wall height
        </label>
        <div css={tw`flex border-b border-mint-300 transition-colors focus-within:border-black`}>
          <div css={tw`relative`}>
            <span css={tw`invisible`} aria-hidden="true">
              {wallHeight}
            </span>
            <input
              css={[
                tw`absolute left-0 m-0 w-full focus:outline-none`,
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
              id="wallHeight"
              type="number"
              step={1}
              min={minWallHeight}
              value={wallHeight === 0 ? '' : wallHeight}
              onChange={_onWallHeightChange}
            />
          </div>
          <span css={tw`ml-1 text-mint-600`}>
            in<span css={tw`sr-only`}>ches</span>
          </span>
        </div>
      </div>
    </Fragment>
  );
};

export default GallerySettings;
