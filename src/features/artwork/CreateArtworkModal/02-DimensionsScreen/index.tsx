import { ChangeEvent, useRef, useState } from 'react';
import { MeasureUnit } from '@prisma/client';
import * as Toggle from '@radix-ui/react-toggle';
import cx from 'classnames';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { NumberField } from '@src/components/NumberField';
import { ObjectPreview3D } from '@src/components/Preview3D/ObjectPreview3D';
import { Select } from '@src/components/Select';
import {
  ConfirmDimensionsEvent,
  CreateArtworkState,
} from '@src/features/artwork/CreateArtworkModal/state';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import Close from '@src/svgs/Close';
import Rotate from '@src/svgs/Cube';
import Lightbulb from '@src/svgs/Lightbulb';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { convertUnit } from '@src/utils/convertUnit';
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
  state: CreateArtworkState<'dimensions'>;
  onBack(): void;
  onSubmit(data: ConfirmDimensionsEvent): void;
}

export const DimensionsScreen = ({ state, onBack, onSubmit }: DimensionsScreenProps) => {
  const [rotated, setRotated] = useState(false);
  const [isDepthFocused, setIsDepthFocused] = useState(false);

  // Track preview area dimensions on resize
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [previewAreaDimensions, setPreviewAreaDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  useIsomorphicLayoutEffect(() => {
    if (previewAreaRef.current) {
      const observer = new ResizeObserver(entries => {
        const [previewArea] = entries;
        setPreviewAreaDimensions({
          height: previewArea.contentRect.height,
          width: previewArea.contentRect.width,
        });
      });
      observer.observe(previewAreaRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

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

          const unitPxRatio = convertUnit(1, values.unit, 'px');
          const pxDimensions: Dimensions = {
            width: values.width * unitPxRatio,
            height: values.height * unitPxRatio,
          };

          const previewDimensions = CanvasUtils.objectScaleDown(
            previewAreaDimensions,
            pxDimensions,
          );
          const previewRatio = previewDimensions.width / pxDimensions.width;
          const previewUnitSize = previewRatio * unitPxRatio;

          return (
            <Form className={styles.form} noValidate>
              <FormModal.Sidecar>
                <div className={styles.sidecar}>
                  <div
                    ref={previewAreaRef}
                    className={styles.preview}
                    style={{
                      '--unit': values.unit === 'px' ? 0 : `${previewUnitSize}px`,
                    }}>
                    <ObjectPreview3D
                      size={{ ...previewDimensions, depth: previewUnitSize * values.depth }}
                      rotated={isDepthFocused || rotated}
                      front={
                        <div
                          className={cx(
                            styles.previewBox,
                            previewAreaDimensions.width === 0 && styles.previewBoxHidden,
                          )}
                          style={{
                            '--width': `${previewDimensions.width}px`,
                            '--height': `${previewDimensions.height}px`,
                          }}
                        />
                      }
                      left={
                        <div
                          className={cx(styles.previewBox)}
                          style={{
                            '--width': `${previewUnitSize * values.depth}px`,
                            '--height': `${previewDimensions.height}px`,
                          }}
                        />
                      }
                      top={
                        <div
                          className={cx(styles.previewBox)}
                          style={{
                            '--width': `${previewDimensions.width}px`,
                            '--height': `${previewUnitSize * values.depth}px`,
                          }}
                        />
                      }
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
