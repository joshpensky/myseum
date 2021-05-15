import tw from 'twin.macro';
import Arrow from '@src/svgs/Arrow';

const Entrance = () => (
  <div
    css={tw`h-32 px-6 py-2 bg-gradient-to-b from-transparent to-paper-300 flex flex-col flex-shrink-0 self-center items-center rounded-b-lg`}>
    <p>Entrance</p>
    <span css={tw`block mt-1 size-4 transform rotate-180`}>
      <Arrow />
    </span>
  </div>
);

export default Entrance;
