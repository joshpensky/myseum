import useSWR from 'swr';
import tw from 'twin.macro';
import Artwork from '@src/components/Artwork';
import Button from '@src/components/Button';
import { useMuseum } from '@src/providers/MuseumProvider';
import Close from '@src/svgs/Close';
import { MuseumCollectionItem } from '@src/types';

const MuseumCollection = () => {
  const { museum } = useMuseum();

  const { data, error } = useSWR<MuseumCollectionItem[]>(`/api/museums/${museum.id}/collection`);

  if (error) {
    return <p>Error :(</p>;
  } else if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div css={tw`pt-2 px-4`}>
      <header css={tw`mb-6`}>
        <h2 css={tw`leading-none font-serif text-3xl`}>Collection</h2>
        <p>
          {data.length} item{data.length === 1 ? '' : 's'}
        </p>

        <Button css={tw`mt-4`}>
          <span css={tw`block size-3 mr-3 transform rotate-45`}>
            <Close />
          </span>
          <span>Add item</span>
        </Button>
      </header>

      <ul css={tw`-mb-5 flex flex-wrap`}>
        {data.map(artwork => (
          <li key={artwork.id} css={tw`flex items-start h-52 mb-5 mr-5 last:mr-0`}>
            <Artwork data={artwork} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MuseumCollection;
