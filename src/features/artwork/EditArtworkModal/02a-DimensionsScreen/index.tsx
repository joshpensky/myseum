import { useState } from 'react';
import { Matting } from '@prisma/client';
import * as Toggle from '@radix-ui/react-toggle';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
import { ArtworkPreview3D } from '@src/components/Preview3D/ArtworkPreview3D';
import { DimensionsFields, dimensionsFieldsSchema } from '@src/features/artwork/DimensionsFields';
import {
  ConfirmDimensionsEvent,
  EditArtworkState,
} from '@src/features/artwork/EditArtworkModal/state';
import Rotate from '@src/svgs/Cube';
import { getImageUrl } from '@src/utils/getImageUrl';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './dimensionsScreen.module.scss';

const dimensionsScreenSchema = z.object({}).merge(dimensionsFieldsSchema);

type DimensionsScreenSchema = z.infer<typeof dimensionsScreenSchema>;

interface DimensionsScreenProps {
  state: EditArtworkState<'dimensions'>;
  onBack(): void;
  onSubmit(data: ConfirmDimensionsEvent): void;
}

export const DimensionsScreen = ({ state, onBack, onSubmit }: DimensionsScreenProps) => {
  const [rotated, setRotated] = useState(false);
  const [isDepthFocused, setIsDepthFocused] = useState(false);

  const initialValues: DimensionsScreenSchema = {
    width: state.context.dimensions.width ?? 0,
    height: state.context.dimensions.height ?? 0,
    depth: state.context.dimensions.depth ?? 0,
    unit: state.context.dimensions.unit ?? 'in',
  };

  const initialErrors = validateZodSchema(dimensionsScreenSchema, 'sync')(initialValues);

  return (
    <FormModal.Screen title="Dimensions" description="Adjust to match the size of your artwork.">
      <Formik<DimensionsScreenSchema>
        initialValues={initialValues}
        initialErrors={initialErrors}
        validate={validateZodSchema(dimensionsScreenSchema)}
        onSubmit={values => {
          onSubmit({
            type: 'CONFIRM_DIMENSIONS',
            dimensions: {
              width: values.width,
              height: values.height,
              depth: values.depth,
              unit: values.unit,
            },
          });
        }}>
        {formik => {
          const { isSubmitting, isValid, values } = formik;

          return (
            <Form className={styles.form} noValidate>
              <FormModal.Sidecar>
                <div className={styles.sidecar}>
                  <div className={styles.preview}>
                    <ArtworkPreview3D
                      rotated={isDepthFocused || rotated}
                      artwork={{
                        alt: '',
                        unit: values.unit,
                        src: state.context.selection.preview.includes('base64')
                          ? state.context.selection.preview
                          : getImageUrl('artworks', state.context.selection.preview),
                        size: {
                          width: values.width,
                          height: values.height,
                          depth: values.depth,
                        },
                      }}
                      framingOptions={{ isScaled: false, matting: Matting.none, scaling: 1 }}
                    />
                  </div>

                  <div className={styles.toolbar}>
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
              </FormModal.Sidecar>

              <div className={styles.formBody}>
                <DimensionsFields
                  onDepthFocus={() => setIsDepthFocused(true)}
                  onDepthBlur={() => setIsDepthFocused(false)}
                />
              </div>

              <FormModal.Footer>
                <Button type="button" onClick={onBack}>
                  Back
                </Button>

                <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                  Next
                </Button>
              </FormModal.Footer>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
};
