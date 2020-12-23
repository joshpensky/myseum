import tw from 'twin.macro';
import { PropsWithChildren } from 'react';
import Nav from '@src/components/Nav';

export type LayoutProps = Record<string, unknown>;
const Layout = ({ children }: PropsWithChildren<LayoutProps>) => (
  <div css={tw`flex flex-col flex-1 min-h-screen`}>
    <Nav />
    <main css={tw`flex flex-col flex-1`}>{children}</main>
  </div>
);

export default Layout;
