import tw from 'twin.macro';

type LayerProps = {
  as: 'frame' | 'window';
};

const Layer = ({ as }: LayerProps) => (
  <svg css={tw`block`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect
      css={[tw`fill-none stroke-current`, as === 'window' && tw`opacity-50`]}
      x="2.5"
      y="0.5"
      width="19"
      height="23"
    />
    <rect
      css={[tw`fill-none stroke-current`, as === 'frame' && tw`opacity-50`]}
      x="7.5"
      y="5.5"
      width="9"
      height="13"
    />
  </svg>
);

export default Layer;
