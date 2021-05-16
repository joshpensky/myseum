import tw from 'twin.macro';

const DragHandle = () => (
  <svg css={tw`block`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <line
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      x1="14"
      y1="8"
      x2="2"
      y2="8"
    />
    <line
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      x1="8"
      y1="2"
      x2="8"
      y2="14"
    />
    <path css={tw`fill-current`} d="M6 2.5L10 2.5L8 0.5L6 2.5Z" />
    <path css={tw`fill-current`} d="M10 13.5H6L8 15.5L10 13.5Z" />
    <path css={tw`fill-current`} d="M13.5 6L13.5 10L15.5 8L13.5 6Z" />
    <path css={tw`fill-current`} d="M2.5 10L2.5 6L0.5 8L2.5 10Z" />
  </svg>
);

export default DragHandle;
