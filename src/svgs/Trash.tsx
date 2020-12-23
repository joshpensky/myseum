import tw from 'twin.macro';

const Trash = () => (
  <svg
    css={tw`block`}
    viewBox="0 0 16 16"
    vectorEffect="non-scaling-stroke"
    xmlns="http://www.w3.org/2000/svg">
    <path
      css={tw`fill-none stroke-current`}
      d="M12.8001 4.3999L11.4287 13.9999H4.57156L3.20013 4.3999"
    />
    <path css={tw`fill-none stroke-current`} d="M2 4.3999H14" />
    <path css={tw`fill-none stroke-current`} d="M5.60034 3.2V2H10.4003V3.2" />
  </svg>
);

export default Trash;
