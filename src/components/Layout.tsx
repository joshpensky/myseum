import { ReactNode } from 'react';
import tw from 'twin.macro';
import Nav from '@src/components/Nav';

export type LayoutProps = {
  children: ReactNode;
};
const Layout = ({ children }: LayoutProps) => (
  <div css={tw`flex flex-col flex-1 min-h-screen`}>
    <Nav />
    <main css={tw`flex flex-col flex-1`}>{children}</main>
  </div>
);

export default Layout;
