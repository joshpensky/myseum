import { lazy, Suspense, useState } from 'react';
import { GetServerSideProps } from 'next';
import tw from 'twin.macro';
import * as z from 'zod';
import Artwork from '@src/components/Artwork';
import Button from '@src/components/Button';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumHomeLayout } from '@src/layouts/MuseumLayout';
import Close from '@src/svgs/Close';
import { Museum, MuseumCollectionItem } from '@src/types';

const AddArtworkRoot = lazy(() => import('@src/features/add-artwork/AddArtworkRoot'));

export interface MuseumCollectionViewProps {
  collection: MuseumCollectionItem[];
  museum: Museum;
}

const MuseumCollectionView = ({ collection }: MuseumCollectionViewProps) => {
  const [isAddingItem, setIsAddingItem] = useState(false);

  return (
    <div css={tw`pt-2 px-4`}>
      <header css={tw`mb-6`}>
        <h2 css={tw`leading-none font-serif text-3xl`}>Collection</h2>
        <p>
          {collection.length} item{collection.length === 1 ? '' : 's'}
        </p>

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
        {collection.map(artwork => (
          <li key={artwork.id} css={tw`flex items-start h-52 mb-5 mr-5 last:mr-0`}>
            <Artwork data={artwork} />
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
    const museum = await MuseumRepository.findById(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        basePath: `/museum/${museum.id}`,
        museum: JSON.parse(JSON.stringify(museum)),
        collection: [], // TODO: add collection
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
