import tw from 'twin.macro';

const Caret = () => (
  <svg css={tw`block`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      d="M2 5L8.00011 11.0001L14.0002 5"
    />
  </svg>
);

export default Caret;
