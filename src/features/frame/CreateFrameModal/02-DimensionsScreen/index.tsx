import { useRef, useState } from 'react';
import * as Toggle from '@radix-ui/react-toggle';
import cx from 'classnames';
import { Form, Formik } from 'formik';
import { z } from 'zod';
import Button from '@src/components/Button';
import * as FormModal from '@src/components/FormModal';
// import { ArtworkPreview3D } from '@src/components/Preview3D/ArtworkPreview3D';
import { ObjectPreview3D } from '@src/components/Preview3D/ObjectPreview3D';
import { DimensionsFields, dimensionsFieldsSchema } from '@src/features/artwork/DimensionsFields';
import {
  ConfirmDimensionsEvent,
  CreateFrameState,
} from '@src/features/frame/CreateFrameModal/state';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import Rotate from '@src/svgs/Cube';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { convertUnit } from '@src/utils/convertUnit';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './dimensionsScreen.module.scss';

const dimensionsScreenSchema = z.object({}).merge(dimensionsFieldsSchema);

type DimensionsScreenSchema = z.infer<typeof dimensionsScreenSchema>;

interface DimensionsScreenProps {
  state: CreateFrameState<'dimensions'>;
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
    <FormModal.Screen title="Dimensions" description="Adjust to match the size of your frame.">
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
                    {/* {state.context.selection ? (
                      <ArtworkPreview3D
                        rotated={isDepthFocused || rotated}
                        artwork={{
                          alt: '',
                          unit: values.unit,
                          src: state.context.selection.preview,
                          size: {
                            width: values.width,
                            height: values.height,
                            depth: values.depth,
                          },
                        }}
                        framingOptions={{ isScaled: false, matting: Matting.none, scaling: 1 }}
                      />
                    ) : ( */}
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
                          className={cx(styles.previewBox, styles.previewBoxTop)}
                          style={{
                            '--width': `${previewDimensions.width}px`,
                            '--height': `${previewUnitSize * values.depth}px`,
                          }}
                        />
                      }
                    />
                    {/* )} */}
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
                  hidePresets
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
