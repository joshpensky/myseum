import tw from 'twin.macro';

const Fullscreen = () => (
  <svg
    css={tw`block`}
    viewBox="0 0 16 16"
    vectorEffect="non-scaling-stroke"
    xmlns="http://www.w3.org/2000/svg">
    <path css={tw`fill-none stroke-current`} d="M2 10V14H6" />
    <path css={tw`fill-none stroke-current`} d="M14 6L14 2L10 2" />
    <path css={tw`fill-none stroke-current`} d="M2 14L6.5 9.5" />
    <path css={tw`fill-none stroke-current`} d="M14 2L9.5 6.5" />
  </svg>
);

export default Fullscreen;