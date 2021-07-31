import tw from 'twin.macro';

export const Info = () => (
  <svg css={tw`block`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <line
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      x1="8"
      y1="7"
      x2="8"
      y2="11"
    />
    <circle
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      cx="8"
      cy="8"
      r="6.5"
    />
    <circle css={tw`fill-current`} cx="8" cy="5.625" r="0.625" />
  </svg>
);
