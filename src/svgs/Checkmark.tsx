import tw from 'twin.macro';

const Checkmark = () => (
  <svg css={tw`block`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      d="M2.25 8.75L6.11364 12.25L13.75 3.25"
    />
  </svg>
);

export default Checkmark;
