import { forwardRef, useState } from 'react';
import { Matting, MeasureUnit } from '@prisma/client';
import * as Toggle from '@radix-ui/react-toggle';
import cx from 'classnames';
import { Field, Form, Formik, FormikProps } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { NumberField } from '@src/components/NumberField';
import { Preview3d } from '@src/components/Preview3d';
import { Select } from '@src/components/Select';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import Checkmark from '@src/svgs/Checkmark';
import Rotate from '@src/svgs/Cube';
import { getImageUrl } from '@src/utils/getImageUrl';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import { FrameSelection } from './FrameSelection';
import { FramingOptions } from './FramingOptions';
import styles from './framingScreen.module.scss';
import { AddArtworkState } from '../state';

const positionSchema = z.object({ x: z.number(), y: z.number() });

const framingScreenSchema = z
  .object({
    hasFrame: z.boolean({ required_error: 'You must select a framing option.' }),

    depth: z.number().nonnegative('Depth must be greater than or equal to 0.'),

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
      scaled: z.boolean(),
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

export const FramingScreen = forwardRef<FormikProps<any>, FramingScreenProps>(
  function FramingScreen({ gallery, state, onBack, onSubmit }, ref) {
    const initialValues: FramingScreenSchema = {
      hasFrame: undefined as any,
      depth: 0,
      frame: undefined,
      framingOptions: {
        scaled: false,
        scaling: 100,
        matting: 'none',
      },
    };

    const initialErrors = validateZodSchema(framingScreenSchema, 'sync')(initialValues);

    return (
      <FormModal.Screen title="Framing" description="Choose a framing option for the artwork.">
        <Formik<FramingScreenSchema>
          innerRef={ref}
          initialValues={initialValues}
          initialErrors={initialErrors}
          validate={validateZodSchema(framingScreenSchema)}
          onSubmit={(values, helpers) => {
            const maxX = Math.max(...gallery.artworks.map(a => a.position.x + a.size.width));

            // if (values.hasFrame) {
            //   if (!values.frame) {
            //     helpers.setFieldError('frame', 'You must select a frame.');
            //     return;
            //   }
            //   onSubmit({
            //     type: 'CONFIRM_FRAMING',
            //     framing: {
            //       hasFrame: true,
            //       depth: values.depth,
            //       frame: values.frame,
            //       framingOptions: values.framingOptions,
            //     },
            //   });
            // } else {
            //   onSubmit({
            //     type: 'CONFIRM_FRAMING',
            //     framing: {
            //       hasFrame: false,
            //       depth: values.depth,
            //       frame: values.frame,
            //       framingOptions: values.framingOptions,
            //     },
            //   });
            // }
          }}>
          {formik => {
            const { values, setFieldValue, isSubmitting, isValid } = formik;

            const [isDepthFocused, setIsDepthFocused] = useState(false);
            const [rotated, setRotated] = useState(false);

            let previewDepth = 0;
            if (values.hasFrame === false) {
              previewDepth = values.depth;
            }

            return (
              <Form className={styles.form} noValidate>
                <div className={cx(styles.activeContent, `theme--${gallery.color}`)}>
                  <div className={styles.preview}>
                    <div className={styles.previewInner}>
                      <Preview3d
                        rotated={rotated || isDepthFocused}
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
                </div>

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
                    <p className={styles.radioGroupDescription}>Adjust the depth of the piece.</p>

                    <div className={styles.fieldRow}>
                      <FieldWrapper
                        className={styles.fieldRowItem}
                        name="depth"
                        label="Depth"
                        required>
                        {field => (
                          <NumberField
                            {...field}
                            min={0}
                            onFocus={() => setIsDepthFocused(true)}
                            onBlur={() => setIsDepthFocused(false)}
                          />
                        )}
                      </FieldWrapper>

                      <FieldWrapper
                        className={styles.fieldRowItem}
                        name="depth-unit"
                        label="Unit"
                        disabled
                        required>
                        {field => (
                          <Select<MeasureUnit>
                            {...field}
                            value={state.context.artwork.unit}
                            options={[
                              { value: 'px', display: 'pixels' },
                              { value: 'in', display: 'inches' },
                              { value: 'cm', display: 'centimeters' },
                              { value: 'mm', display: 'millimeters' },
                            ]}
                          />
                        )}
                      </FieldWrapper>
                    </div>
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

                <div className={styles.formActions}>
                  <Button type="button" disabled={isSubmitting} onClick={onBack}>
                    Back
                  </Button>

                  <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                    Save
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </FormModal.Screen>
    );
  },
);
