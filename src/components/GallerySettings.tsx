import { ChangeEvent } from 'react';
import tw, { css } from 'twin.macro';

type GallerySettingsProps = {
  minWallHeight: number;
  wallHeight: number;
  onWallHeightChange(nextWallHeight: number): void;
};

const GallerySettings = ({
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

  return (
    <div>
      <div css={tw`flex flex-col mb-4`}>
        <label css={tw`text-sm`} htmlFor="wallColor">
          Wall color
        </label>
      </div>
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
    </div>
  );
};

export default GallerySettings;
