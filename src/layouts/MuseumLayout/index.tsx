import { PropsWithChildren } from 'react';
import Link from 'next/link';
import tw from 'twin.macro';
import { pages } from 'next-pages-gen';
import { MuseumDto } from '@src/data/MuseumSerializer';
import { MuseumProvider } from '@src/providers/MuseumProvider';
import { LayoutComponent } from '@src/types';

export interface MuseumLayoutProps {
  forGallery?: boolean;
  museum: MuseumDto;
}

export const MuseumLayout: LayoutComponent<PropsWithChildren<MuseumLayoutProps>> = ({
  children,
  museum,
}) => <MuseumProvider museum={museum}>{children}</MuseumProvider>;

MuseumLayout.getGlobalLayoutProps = layoutProps => ({
  navOverrides: {
    center: (
      <h1
        css={[
          tw`font-serif text-3xl leading-none text-center`,
          layoutProps.forGallery && tw`transform scale-90`,
        ]}>
        <Link passHref href={pages.museum(layoutProps.museum.id).index}>
          <a css={tw`transform[translateY(3px)]`}>{layoutProps.museum.name}</a>
        </Link>
      </h1>
    ),
  },
});
