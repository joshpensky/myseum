import { BaseProps } from '@src/types';
import { PropsWithChildren, ReactNode } from 'react';
import tw from 'twin.macro';

type PanelProps = BaseProps & {
  headerAction?: ReactNode;
  title: string;
};

const Panel = ({
  children,
  className,
  css: customCss,
  headerAction,
  title,
}: PropsWithChildren<PanelProps>) => (
  <section className={className} css={[tw`flex flex-col px-6 pt-5 pb-6 items-start`, customCss]}>
    <header css={tw`flex w-full items-center justify-between mb-1`}>
      <h2 css={tw`font-medium mr-4`}>{title}</h2>
      {headerAction}
    </header>
    {children}
  </section>
);

export default Panel;
