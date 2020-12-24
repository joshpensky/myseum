import useSWR from 'swr';
import tw from 'twin.macro';
import Artwork from '@src/components/Artwork';
import { MuseumCollectionItem } from '@src/types';
import { useMuseum } from '@src/providers/MuseumProvider';

const MuseumCollection = () => {
  const { museum } = useMuseum();

  const { data, error } = useSWR<MuseumCollectionItem[]>(`/api/museums/${museum.id}/collection`);

  if (error) {
    return <p>Error :(</p>;
  } else if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Collection</h1>
      <p>
        {data.length} item{data.length === 1 ? '' : 's'}
      </p>

      <ul css={tw`mt-5 -mb-5 flex flex-wrap`}>
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
