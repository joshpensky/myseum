import { ReactNode } from 'react';
import Link from 'next/link';
import tw, { css } from 'twin.macro';
import Logo from '@src/svgs/Logo';
import UserAuthState from './UserAuthState';

const replaceableContent = css`
  > *:not(.no-replace):not(:first-child) {
    ${tw`hidden invisible`}
  }
`;

export interface NavProps {
  overrides?: {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
  };
}

const Nav = ({ overrides }: NavProps) => (
  <nav id="nav" css={replaceableContent}>
    <div css={tw`flex flex-1 py-2 px-4`}>
      <div id="nav-left" css={[tw`flex flex-1 items-center justify-start`, replaceableContent]}>
        {overrides?.left}
      </div>

      <div id="nav-center" css={[tw`flex flex-1 items-center justify-center`, replaceableContent]}>
        {overrides?.center}
        <Link passHref href="/">
          <a css={tw`flex h-8`}>
            <Logo />
          </a>
        </Link>
      </div>

      <div id="nav-right" css={[tw`flex flex-1 items-center justify-end`, replaceableContent]}>
        {overrides?.right}
        <UserAuthState />
      </div>
    </div>
  </nav>
);

export default Nav;
