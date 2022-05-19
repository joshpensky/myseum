import { ChangeEvent, useState } from 'react';
import { Matting, MeasureUnit } from '@prisma/client';
import * as Toggle from '@radix-ui/react-toggle';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { NumberField } from '@src/components/NumberField';
import { ArtworkPreview3D } from '@src/components/Preview3D/ArtworkPreview3D';
import { Select } from '@src/components/Select';
import {
  ConfirmDimensionsEvent,
  EditArtworkState,
} from '@src/features/artwork/EditArtworkModal/state';
import Close from '@src/svgs/Close';
import Rotate from '@src/svgs/Cube';
import Lightbulb from '@src/svgs/Lightbulb';
import { getImageUrl } from '@src/utils/getImageUrl';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './dimensionsScreen.module.scss';

const dimensionsScreenSchema = z.object({
  width: z
    .number({ required_error: 'Width is required.' })
    .positive('Width must be greater than 0.'),

  height: z
    .number({ required_error: 'Height is required.' })
    .positive('Height must be greater than 0.'),

  depth: z
    .number({ required_error: 'Depth is required.' })
    .nonnegative('Depth must be greater than or equal to 0.'),

  unit: z.nativeEnum(MeasureUnit, {
    invalid_type_error: 'Invalid unit.',
    required_error: 'Unit is required.',
  }),
});

type DimensionsScreenSchema = z.infer<typeof dimensionsScreenSchema>;

interface Preset {
  value: string;
  display: string;
  dimensions: Omit<DimensionsScreenSchema, 'depth'>;
}

const presets: Preset[] = [
  {
    value: 'a4',
    display: 'A4',
    dimensions: {
      width: 210,
      height: 297,
      unit: 'mm',
    },
  },
  {
    value: 'poster',
    display: 'Poster',
    dimensions: {
      width: 11,
      height: 17,
      unit: 'in',
    },
  },
];

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
          const { handleChange, isSubmitting, isValid, values, setFieldValue } = formik;

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
                <div className={styles.row}>
                  <FieldWrapper name="width" label="Width" required>
                    {field => (
                      <NumberField
                        {...field}
                        min={0}
                        onChange={evt => {
                          handleChange(evt);
                          setFieldValue('preset', 'custom');
                        }}
                      />
                    )}
                  </FieldWrapper>

                  <div className={styles.timesIcon}>
                    <Close />
                  </div>

                  <FieldWrapper name="height" label="Height" required>
                    {field => (
                      <NumberField
                        {...field}
                        min={0}
                        onChange={evt => {
                          handleChange(evt);
                          setFieldValue('preset', 'custom');
                        }}
                      />
                    )}
                  </FieldWrapper>

                  <div className={styles.timesIcon}>
                    <Close />
                  </div>

                  <FieldWrapper name="depth" label="Depth" required>
                    {field => (
                      <NumberField
                        {...field}
                        min={0}
                        onFocus={() => setIsDepthFocused(true)}
                        onBlur={() => setIsDepthFocused(false)}
                      />
                    )}
                  </FieldWrapper>
                </div>

                <div className={styles.row}>
                  <FieldWrapper name="unit" label="Unit" required>
                    {field => (
                      <Select<MeasureUnit>
                        {...field}
                        options={[
                          { value: 'px', display: 'pixels' },
                          { value: 'in', display: 'inches' },
                          { value: 'cm', display: 'centimeters' },
                          { value: 'mm', display: 'millimeters' },
                        ]}
                        onChange={evt => {
                          handleChange(evt);
                          setFieldValue('preset', 'custom');
                        }}
                      />
                    )}
                  </FieldWrapper>
                </div>

                <div className={styles.hint}>
                  <div className={styles.hintIcon}>
                    <Lightbulb />
                  </div>

                  <p className={styles.hintText}>
                    Is your artwork a standard size? Use one of the below presets.
                  </p>

                  <FieldWrapper name="preset" label="Preset" labelClassName="sr-only">
                    {field => (
                      <Select<string>
                        {...field}
                        options={[{ value: 'custom', display: 'Custom' }, ...presets]}
                        onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                          handleChange(evt);
                          const preset = presets.find(preset => preset.value === evt.target.value);
                          if (preset) {
                            setFieldValue('width', preset.dimensions.width);
                            setFieldValue('height', preset.dimensions.height);
                            setFieldValue('unit', preset.dimensions.unit);
                          }
                        }}
                      />
                    )}
                  </FieldWrapper>
                </div>
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
