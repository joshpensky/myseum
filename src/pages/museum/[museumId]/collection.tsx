import { lazy, Suspense, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import tw from 'twin.macro';
import { Museum } from '@prisma/client';
import useSWR from 'swr';
import * as z from 'zod';
import { Artwork } from '@src/components/Artwork';
import Button from '@src/components/Button';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumHomeLayout } from '@src/layouts/museum';
import { MuseumCollectionItem } from '@src/pages/api/museum/[museumId]/collection';
import { useMuseum } from '@src/providers/MuseumProvider';
import Close from '@src/svgs/Close';

const AddArtworkRoot = lazy(() => import('@src/features/add-artwork/AddArtworkRoot'));

export interface MuseumCollectionViewProps {
  museum: Museum;
}

const MuseumCollectionView = () => {
  const { museum } = useMuseum();

  const collection = useSWR<MuseumCollectionItem[]>(`/api/museum/${museum.id}/collection`);

  const [isAddingItem, setIsAddingItem] = useState(false);

  return (
    <div css={tw`pt-2 px-4`}>
      <Head>
        <title>Collection | {museum.name} | Myseum</title>
      </Head>

      <header css={tw`mb-6`}>
        <h2 css={tw`leading-none font-serif text-3xl`}>Collection</h2>
        {collection.error || !collection.data ? (
          <p>Loading...</p>
        ) : (
          <p>
            {collection.data.length} item{collection.data.length === 1 ? '' : 's'}
          </p>
        )}

        <Button css={tw`mt-4`} onClick={() => setIsAddingItem(true)}>
          <span css={tw`block size-3 mr-3 transform rotate-45`}>
            <Close />
          </span>
          <span>Add item</span>
        </Button>
      </header>

      {isAddingItem && (
        <Suspense fallback={null}>
          <AddArtworkRoot onClose={() => setIsAddingItem(false)} />
        </Suspense>
      )}

      <ul css={tw`-mb-5 flex flex-wrap`}>
        {(collection.data ?? []).map(item => (
          <li key={item.artwork.id} css={tw`flex items-start h-52 mb-5 mr-5 last:mr-0`}>
            <Artwork data={item.artwork} gallery={item.gallery} />
          </li>
        ))}
      </ul>
    </div>
  );
};

MuseumCollectionView.Layout = MuseumHomeLayout;

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
        museum,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
