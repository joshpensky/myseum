import tw, { css } from 'twin.macro';
import Logo from '@src/svgs/Logo';

const replaceableContent = css`
  > *:not(.no-replace):not(:first-child) {
    ${tw`hidden invisible`}
  }
`;

const Nav = () => (
  <nav id="nav" css={replaceableContent}>
    <div css={tw`flex justify-between`}>
      <div id="nav-left" css={[tw`flex flex-1 justify-start`, replaceableContent]} />

      <div id="nav-center" css={[tw`flex flex-1 justify-center`, replaceableContent]}>
        <span css={tw`flex h-8`}>
          <Logo />
        </span>
      </div>

      <div id="nav-right" css={[tw`flex flex-1 justify-end`, replaceableContent]} />
    </div>
  </nav>
);

export default Nav;
