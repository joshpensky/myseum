import tw from 'twin.macro';

const Close = () => (
  <svg
    css={tw`block`}
    viewBox="0 0 16 16"
    vectorEffect="non-scaling-stroke"
    xmlns="http://www.w3.org/2000/svg">
    <path css={tw`fill-none stroke-current`} d="M2.5 13.5L13.5 2.5" />
    <path css={tw`fill-none stroke-current`} d="M13.5 13.5L2.5 2.5" />
  </svg>
);

export default Close;
