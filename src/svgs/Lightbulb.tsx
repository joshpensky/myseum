import tw from 'twin.macro';

const Lightbulb = () => (
  <svg css={tw`block`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <line
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      x1="6.17143"
      y1="15.4"
      x2="9.82857"
      y2="15.4"
    />
    <path
      css={tw`fill-none stroke-current`}
      vectorEffect="non-scaling-stroke"
      d="M13 5C13 2.5 11 0.5 8 0.5C5 0.5 3 2.5 3 5C3 7 4.5 8.5 5 9.5C5.5 10.5 6 12.1667 6 13H10C10 12.5 10 11 11 9.5C11.6285 8.55732 13 7 13 5Z"
    />
  </svg>
);

export default Lightbulb;
