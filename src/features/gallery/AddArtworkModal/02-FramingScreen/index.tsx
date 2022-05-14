import { useState } from 'react';
import { Matting } from '@prisma/client';
import * as Toggle from '@radix-ui/react-toggle';
import axios from 'axios';
import cx from 'classnames';
import { Field, Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { Preview3d } from '@src/components/Preview3d';
import { AddPlacedArtworkDto } from '@src/data/repositories/gallery.repository';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { AddArtworkState } from '@src/features/gallery/AddArtworkModal/state';
import Checkmark from '@src/svgs/Checkmark';
import Rotate from '@src/svgs/Cube';
import { getImageUrl } from '@src/utils/getImageUrl';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import { FrameSelection } from './FrameSelection';
import { FramingOptions } from './FramingOptions';
import styles from './framingScreen.module.scss';

const positionSchema = z.object({ x: z.number(), y: z.number() });

const framingScreenSchema = z
  .object({
    hasFrame: z.boolean({ required_error: 'You must select a framing option.' }),

    frame: z
      .object({
        id: z.string(),
        name: z.string(),
        src: z.string(),
        alt: z.string(),
        size: z.object({
          width: z.number(),
          height: z.number(),
          depth: z.number(),
        }),
        window: z.tuple([positionSchema, positionSchema, positionSchema, positionSchema]),
        addedAt: z.date(),
        modifiedAt: z.date(),
      })
      .optional(),

    framingOptions: z.object({
      isScaled: z.boolean(),
      scaling: z.number().min(20).max(100),
      matting: z.nativeEnum(Matting),
    }),
  })
  .refine(data => !(data.hasFrame && typeof data.frame === 'undefined'), {
    message: 'You must select a frame.',
    path: ['frame'],
  });

export type FramingScreenSchema = z.infer<typeof framingScreenSchema>;

interface FramingScreenProps {
  gallery: GalleryDto;
  state: AddArtworkState<'framing'>;
  onBack(): void;
  onSubmit(data: PlacedArtworkDto): void;
}

export const FramingScreen = ({ gallery, state, onBack, onSubmit }: FramingScreenProps) => {
  const initialValues: FramingScreenSchema = {
    hasFrame: undefined as any,
    frame: undefined,
    framingOptions: {
      isScaled: false,
      scaling: 100,
      matting: 'none',
    },
  };

  const initialErrors = validateZodSchema(framingScreenSchema, 'sync')(initialValues);

  return (
    <FormModal.Screen title="Framing" description="Choose a framing option for the artwork.">
      <Formik<FramingScreenSchema>
        initialValues={initialValues}
        initialErrors={initialErrors}
        validate={validateZodSchema(framingScreenSchema)}
        onSubmit={async (values, helpers) => {
          helpers.setSubmitting(true);
          try {
            const createArtworkData: AddPlacedArtworkDto = {
              artworkId: state.context.artwork.id,
              frameId: values.hasFrame && values.frame ? values.frame?.id : undefined,
              framingOptions: values.framingOptions,
            };

            const res = await axios.post<PlacedArtworkDto>(
              `/api/museum/${gallery.museum.id}/gallery/${gallery.id}/artworks`,
              createArtworkData,
            );
            onSubmit(res.data);
          } catch (error) {
            console.error(error);
            helpers.setSubmitting(false);
          }
        }}>
        {formik => {
          const { values, setFieldValue, isSubmitting, isValid } = formik;

          const [rotated, setRotated] = useState(false);

          let previewDepth = 0;
          if (values.hasFrame === false) {
            previewDepth = state.context.artwork.size.depth;
          }

          return (
            <Form className={styles.form} noValidate>
              <FormModal.Sidecar className={cx(styles.sidecar, `theme--${gallery.color}`)}>
                <div className={styles.preview}>
                  <div className={styles.previewInner}>
                    <Preview3d
                      rotated={rotated}
                      artwork={{
                        ...state.context.artwork,
                        src: getImageUrl('artworks', state.context.artwork.src),
                        size: {
                          ...state.context.artwork.size,
                          depth: previewDepth,
                        },
                      }}
                      frame={values.hasFrame && values.frame ? values.frame : undefined}
                      framingOptions={values.framingOptions}
                    />
                  </div>
                </div>

                <div className={cx(styles.toolbar, `theme--ink`)}>
                  <Toggle.Root pressed={rotated} onPressedChange={setRotated} asChild>
                    <button
                      className={styles.toolbarButton}
                      title="Toggle 3D View"
                      aria-label="Toggle 3D View">
                      <Rotate />
                    </button>
                  </Toggle.Root>
                </div>
              </FormModal.Sidecar>

              <div className={styles.formBody}>
                <div className={styles.radioGroup}>
                  <Field
                    id="hasFrame-false"
                    className="sr-only"
                    type="radio"
                    name="hasFrame"
                    required
                    value="false"
                    checked={values.hasFrame === false}
                    onChange={() => setFieldValue('hasFrame', false)}
                  />

                  <label className={styles.radioGroupLabel} htmlFor="hasFrame-false">
                    <span className={styles.radioGroupButton} aria-hidden="true">
                      <Checkmark />
                    </span>
                    No Frame
                  </label>

                  <fieldset
                    className={styles.radioGroupFieldset}
                    disabled={values.hasFrame !== false}>
                    <legend className="sr-only">No Frame</legend>
                  </fieldset>

                  <div className={styles.radioGroupFrame} />
                </div>

                <div className={styles.radioGroup}>
                  <Field
                    id="hasFrame-true"
                    className="sr-only"
                    type="radio"
                    name="hasFrame"
                    required
                    value="true"
                    checked={values.hasFrame === true}
                    onChange={() => setFieldValue('hasFrame', true)}
                  />

                  <label className={styles.radioGroupLabel} htmlFor="hasFrame-true">
                    <span className={styles.radioGroupButton} aria-hidden="true">
                      <Checkmark />
                    </span>
                    Framed
                  </label>

                  <fieldset
                    className={styles.radioGroupFieldset}
                    disabled={values.hasFrame !== true}>
                    <legend className="sr-only">Framed</legend>
                    <p className={styles.radioGroupDescription}>
                      Create or choose an existing frame.
                    </p>

                    <FrameSelection
                      value={values.frame}
                      onChange={data => setFieldValue('frame', data)}
                    />

                    {/* TODO: add create frame modal */}
                    <Button className={styles.createButton} type="button">
                      Create frame
                    </Button>

                    <hr className={styles.separator} />

                    <FramingOptions />
                  </fieldset>

                  <div className={styles.radioGroupFrame} />
                </div>
              </div>

              <FormModal.Footer>
                <Button type="button" disabled={isSubmitting} onClick={onBack}>
                  Back
                </Button>

                <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                  Save
                </Button>
              </FormModal.Footer>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
};
