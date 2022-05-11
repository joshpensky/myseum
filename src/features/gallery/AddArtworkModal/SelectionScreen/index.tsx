import { forwardRef, Fragment, useState } from 'react';
import { MeasureUnit } from '@prisma/client';
import * as Toggle from '@radix-ui/react-toggle';
import { AxiosError } from 'axios';
import cx from 'classnames';
import dayjs from 'dayjs';
import { Form, Formik, FormikProps } from 'formik';
import Fuse from 'fuse.js';
import useSWR from 'swr';
import * as z from 'zod';
import Button from '@src/components/Button';
import { ErrorMessage } from '@src/components/ErrorMessage';
import * as FormModal from '@src/components/FormModal';
import { Loader } from '@src/components/Loader';
import { SearchBar } from '@src/components/SearchBar';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import * as CreateArtwork from '@src/features/create-artwork-OLD';
import { ConfirmSelectionEvent } from '@src/features/gallery/AddArtworkModal/state';
import { ArtworkIllustration } from '@src/svgs/ArtworkIllustration';
import { PlusIcon } from '@src/svgs/PlusIcon';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './selectionScreen.module.scss';
import { AddArtworkState } from '../state';

const selectionSchema = z.object({
  search: z.string(),
  artwork: z
    .object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      src: z.string(),
      alt: z.string(),
      size: z.object({
        width: z.number(),
        height: z.number(),
      }),
      unit: z.nativeEnum(MeasureUnit),
      artist: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .nullable(),
      createdAt: z.date().nullable(),
    })
    .nullable(),
});

type SelectionSchema = z.infer<typeof selectionSchema>;

interface SelectionScreenProps {
  state: AddArtworkState<'selection'>;
  onSubmit(data: ConfirmSelectionEvent): void;
}

export const SelectionScreen = forwardRef<FormikProps<any>, SelectionScreenProps>(
  function SelectionScreen({ state, onSubmit }, ref) {
    const [isCreating, setIsCreating] = useState(false);
    const artworks = useSWR<ArtworkDto[], AxiosError>('/api/me/artworks', {
      revalidateOnFocus: false,
    });
    const data = artworks.data ?? [];

    const initialValues: SelectionSchema = {
      search: '',
      artwork: state.context.artwork ?? null,
    };

    return (
      <FormModal.Screen
        title="Selection"
        description="Create or choose a piece from your collection.">
        <Formik
          innerRef={ref}
          initialValues={initialValues}
          onSubmit={(values, helpers) => {
            if (!values.artwork) {
              helpers.setFieldError('artwork', 'You must choose an artwork.');
              helpers.setSubmitting(false);
              return;
            }
            onSubmit({
              type: 'CONFIRM_SELECTION',
              artwork: values.artwork as ArtworkDto,
            });
          }}>
          {formik => {
            const { isSubmitting, setFieldValue, values } = formik;

            const fuse = new Fuse(data, {
              keys: ['title', 'description', 'alt', 'artist.name'],
            });

            let results: { item: ArtworkDto }[];
            if (values.search) {
              results = fuse.search(values.search);
            } else {
              results = data.map(item => ({ item }));
            }

            const count = results.length;

            return (
              <Form className={styles.form} noValidate>
                <CreateArtwork.Root
                  open={isCreating}
                  onOpenChange={setIsCreating}
                  onComplete={() => {
                    artworks.revalidate();
                    setIsCreating(false);
                  }}>
                  {artworks.error ? (
                    <div className={styles.error}>
                      <ErrorMessage error={artworks.error} onRetry={() => artworks.revalidate()} />
                    </div>
                  ) : (
                    <Fragment>
                      <div className={styles.search}>
                        <SearchBar name="search" label="Search artworks" />
                        <CreateArtwork.Trigger>
                          <Button className={styles.searchAction} icon={PlusIcon}>
                            Create
                          </Button>
                        </CreateArtwork.Trigger>
                      </div>

                      <p className={styles.count}>
                        {count} item{results.length === 1 ? '' : 's'} {values.search && 'found'}
                      </p>

                      <div className={styles.content}>
                        {artworks.isValidating ? (
                          <div className={styles.loading}>
                            <Loader size="large" />
                          </div>
                        ) : !results.length ? (
                          <div className={styles.emptyState}>
                            <div className={styles.emptyStateIllo}>
                              <ArtworkIllustration />
                            </div>
                            <p className={styles.emptyStateText}>
                              {values.search
                                ? `No artworks found for term "${values.search}."`
                                : `You have no artworks.`}
                            </p>
                            <CreateArtwork.Trigger>
                              <Button className={styles.emptyStateAction}>Create artwork</Button>
                            </CreateArtwork.Trigger>
                          </div>
                        ) : (
                          <ul>
                            {results.map(({ item: artwork }) => {
                              const pressed = values.artwork?.id === artwork.id;

                              return (
                                <li key={artwork.id} className={styles.row}>
                                  <div
                                    className={cx(
                                      styles.rowImage,
                                      artwork.size.height > artwork.size.width &&
                                        styles.rowImageVertical,
                                    )}
                                    style={{
                                      '--aspect-ratio': artwork.size.width / artwork.size.height,
                                    }}>
                                    <img
                                      src={getImageUrl('artworks', artwork.src)}
                                      alt={artwork.alt ?? ''}
                                    />
                                  </div>

                                  <div className={styles.rowMeta}>
                                    <p>{artwork.title}</p>
                                    <p className={styles.rowMetaDesc}>
                                      {Array.from(
                                        new Set([
                                          artwork.artist?.name ?? 'Unknown',
                                          artwork.createdAt
                                            ? dayjs(artwork.createdAt).year()
                                            : 'Unknown',
                                        ]),
                                      ).join(', ')}
                                    </p>
                                  </div>

                                  <Toggle.Root
                                    pressed={pressed}
                                    onPressedChange={() => {
                                      setFieldValue('artwork', artwork);
                                    }}
                                    asChild>
                                    <Button>{pressed ? 'Selected' : 'Select'}</Button>
                                  </Toggle.Root>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </Fragment>
                  )}

                  {values.artwork && (
                    <section className={styles.selected}>
                      <h4 className={styles.selectedLabel}>Selected</h4>
                      <div className={styles.row}>
                        <div
                          className={cx(
                            styles.rowImage,
                            values.artwork.size.height > values.artwork.size.width &&
                              styles.rowImageVertical,
                          )}
                          style={{
                            '--aspect-ratio':
                              values.artwork.size.width / values.artwork.size.height,
                          }}>
                          <img
                            src={getImageUrl('artworks', values.artwork.src)}
                            alt={values.artwork.alt ?? ''}
                          />
                        </div>

                        <div className={styles.rowMeta}>
                          <p>{values.artwork.title}</p>
                          <p className={styles.rowMetaDesc}>
                            {Array.from(
                              new Set([
                                values.artwork.artist?.name ?? 'Unknown',
                                values.artwork.createdAt
                                  ? dayjs(values.artwork.createdAt).year()
                                  : 'Unknown',
                              ]),
                            ).join(', ')}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  <div className={styles.actions}>
                    <Button type="submit" filled disabled={!values.artwork} busy={isSubmitting}>
                      Next
                    </Button>
                  </div>
                </CreateArtwork.Root>
              </Form>
            );
          }}
        </Formik>
      </FormModal.Screen>
    );
  },
);
