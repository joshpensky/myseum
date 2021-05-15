import tw from 'twin.macro';

const DragHandle = () => (
  <svg css={tw`block`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <line
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      x1="13"
      y1="8.11051"
      x2="3.2002"
      y2="8.11051"
    />
    <line
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      x1="8.16712"
      y1="3.5"
      x2="8.16712"
      y2="12.5"
    />
    <path css={tw`fill-current`} d="M6.19995 3.5L10.2 3.5L8.19995 1.5L6.19995 3.5Z" />
    <path css={tw`fill-current`} d="M10.2 12.5H6.19995L8.19995 14.5L10.2 12.5Z" />
    <path css={tw`fill-current`} d="M12.5 6.1001L12.5 10.1001L14.5 8.1001L12.5 6.1001Z" />
    <path css={tw`fill-current`} d="M3.5 10.1001L3.5 6.1001L1.5 8.1001L3.5 10.1001Z" />
  </svg>
);

export default DragHandle;
