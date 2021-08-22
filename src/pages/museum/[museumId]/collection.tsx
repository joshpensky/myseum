import { useState } from 'react';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import tw from 'twin.macro';
import { pages } from 'next-pages-gen';
import useSWR from 'swr';
import * as z from 'zod';
import { Artwork } from '@src/components/Artwork';
import Button from '@src/components/Button';
import ViewToggle from '@src/components/ViewToggle';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumCollectionItemDto, MuseumDto, MuseumSerializer } from '@src/data/MuseumSerializer';
import { MuseumLayout, MuseumLayoutProps } from '@src/layouts/MuseumLayout';
import { useMuseum } from '@src/providers/MuseumProvider';
import Close from '@src/svgs/Close';
import { PageComponent } from '@src/types';

const AddArtworkRoot = dynamic(() => import('@src/features/add-artwork/AddArtworkRoot'));

export interface MuseumCollectionViewProps {
  museum: MuseumDto;
}

const MuseumCollectionView: PageComponent<MuseumCollectionViewProps, MuseumLayoutProps> = () => {
  const { museum } = useMuseum();

  const collection = useSWR<MuseumCollectionItemDto[]>(pages.api.museum(museum.id).collection);

  const [isAddingItem, setIsAddingItem] = useState(false);

  const [openedArtworkId, setOpenedArtworkId] = useState<number | null>(null);

  return (
    <div css={tw`pt-2 px-4`}>
      <Head>
        <title>Collection | {museum.name} | Myseum</title>
      </Head>

      <header css={tw`mb-6`}>
        <h2 css={tw`leading-none font-serif text-3xl`}>Collection</h2>
        {collection.error || !collection.data ? (
          <p css={tw`mb-4`}>Loading...</p>
        ) : (
          <p css={tw`mb-4`}>
            {collection.data.length} item{collection.data.length === 1 ? '' : 's'}
          </p>
        )}

        <Button onClick={() => setIsAddingItem(true)}>
          <span css={tw`block size-3 mr-3 transform rotate-45`}>
            <Close />
          </span>
          <span>Add item</span>
        </Button>
      </header>

      {isAddingItem && <AddArtworkRoot onClose={() => setIsAddingItem(false)} />}

      <ul css={tw`-mb-5 flex flex-wrap`}>
        {(collection.data ?? []).map(item => (
          <li
            key={item.artwork.id}
            css={[
              tw`flex items-start h-52 mb-5 mr-5 last:mr-0`,
              openedArtworkId !== null && openedArtworkId !== item.artwork.id && tw`opacity-50`,
            ]}>
            <Artwork
              data={item.artwork}
              galleries={item.galleries}
              onDetailsOpenChange={open => {
                if (open) {
                  setOpenedArtworkId(item.artwork.id);
                } else {
                  setOpenedArtworkId(null);
                }
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

MuseumCollectionView.layout = MuseumLayout;
MuseumCollectionView.getPageLayoutProps = pageProps => ({
  museum: pageProps.museum,
});
MuseumCollectionView.getGlobalLayoutProps = pageProps => ({
  navOverrides: {
    left: (
      <Link passHref href={pages.museum(pageProps.museum.id).about}>
        <a>About</a>
      </Link>
    ),
    right: <ViewToggle />,
  },
});

export default MuseumCollectionView;

export const getServerSideProps: GetServerSideProps<
  MuseumCollectionViewProps,
  { museumId: string }
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  if (!museumId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = await MuseumRepository.findOne(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        museum: MuseumSerializer.serialize(museum),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
