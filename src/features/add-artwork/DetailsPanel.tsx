import tw from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';
import TextField from '@src/components/TextField';
import FeatureFormModal from '@src/components/FeatureFormModal';

const DetailsPanel = () => {
  const { details, isSubmitting, setDetails } = useAddArtworkContext();

  return (
    <FeatureFormModal.SidebarPanel title="Details">
      <div css={tw`flex flex-col w-full mt-3`}>
        <div css={tw`flex flex-col flex-1 not-last:mb-4`}>
          <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="title">
            Title
          </label>
          <TextField
            id="title"
            type="text"
            autoComplete="off"
            placeholder="Unknown"
            required
            disabled={isSubmitting}
            value={details.title}
            onChange={value =>
              setDetails(details => ({
                ...details,
                title: value,
              }))
            }
          />
        </div>
        <div css={tw`flex flex-col flex-1 not-last:mb-4`}>
          <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="artist">
            Artist
          </label>
          <TextField
            id="artist"
            type="text"
            placeholder="Unknown"
            disabled={isSubmitting}
            value={details.artist}
            onChange={value =>
              setDetails(details => ({
                ...details,
                artist: value,
              }))
            }
          />
        </div>
        <div css={tw`flex flex-col flex-1 not-last:mb-4`}>
          <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="description">
            Description
          </label>
          <TextField
            id="description"
            type="text"
            grow
            placeholder="Unknown"
            required
            disabled={isSubmitting}
            value={details.description}
            onChange={value =>
              setDetails(details => ({
                ...details,
                description: value.slice(0, 128),
              }))
            }
          />
          <p css={tw`pt-1 text-xs text-gray-300 self-end`}>
            {/* TODO: a11y (e.g., https://github.com/rikschennink/short-and-sweet/blob/master/src/short-and-sweet.js) */}
            <span css={tw`sr-only`}>Character count: </span>
            <span>{details.description.length} / 128</span>
          </p>
        </div>
        <div css={tw`flex flex-1`}>
          <div css={tw`flex flex-col flex-1 mr-4`}>
            <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="createdAt">
              Created
            </label>
            <TextField
              id="createdAt"
              type="number"
              min={0}
              disabled={isSubmitting}
              value={details.createdAt}
              onChange={value =>
                setDetails(details => ({
                  ...details,
                  createdAt: value,
                }))
              }
            />
          </div>
          <div css={tw`flex flex-col flex-1`}>
            <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="acquiredAt">
              Acquired
            </label>
            <TextField
              id="acquiredAt"
              type="number"
              min={0}
              disabled={isSubmitting}
              value={details.acquiredAt}
              onChange={value =>
                setDetails(details => ({
                  ...details,
                  acquiredAt: value,
                }))
              }
            />
          </div>
        </div>
      </div>
    </FeatureFormModal.SidebarPanel>
  );
};

export default DetailsPanel;
