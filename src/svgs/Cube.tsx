import tw from 'twin.macro';

const Rotate = () => (
  <svg css={tw`block`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      d="M7.77501 1.22361L2.55279 3.83472C2.214 4.00411 2 4.35037 2 4.72915V11.2709C2 11.6496 2.214 11.9959 2.55279 12.1653L7.77501 14.7764C8.05654 14.9172 8.38791 14.9172 8.66944 14.7764L13.8917 12.1653C14.2304 11.9959 14.4444 11.6496 14.4444 11.2709V4.72915C14.4444 4.35037 14.2304 4.00411 13.8917 3.83472L8.66944 1.22361C8.38791 1.08284 8.05654 1.08284 7.77501 1.22361Z"
    />
    <path
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      d="M2 4.11111L8.22222 7.22223L14.4444 4.11111"
    />
    <path
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      d="M8.22222 7.22223V15"
    />
  </svg>
);

export default Rotate;
