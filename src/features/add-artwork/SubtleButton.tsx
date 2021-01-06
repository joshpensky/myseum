import tw, { styled } from 'twin.macro';

const SubtleButton = styled.button(() => [
  tw`px-2 py-1 -my-1 -mx-2 rounded bg-white bg-opacity-0 ring-0 ring-white ring-opacity-20`,
  tw`disabled:(opacity-50 cursor-not-allowed)`,
  tw`not-disabled:hocus:(bg-opacity-20) not-disabled:focus:(outline-none transition-shadow ring-2)`,
]);

export default SubtleButton;
