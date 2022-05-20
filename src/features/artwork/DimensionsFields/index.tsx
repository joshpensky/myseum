import { ChangeEvent, Fragment } from 'react';
import { MeasureUnit } from '@prisma/client';
import { useFormikContext } from 'formik';
import { z } from 'zod';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { NumberField } from '@src/components/NumberField';
import { Select } from '@src/components/Select';
import { CloseIcon } from '@src/svgs/icons/CloseIcon';
import { HintIcon } from '@src/svgs/icons/HintIcon';
import styles from './dimensionsFields.module.scss';

export const dimensionsFieldsSchema = z.object({
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

type DimensionsFieldsSchema = z.infer<typeof dimensionsFieldsSchema>;

interface Preset {
  value: string;
  display: string;
  dimensions: Omit<DimensionsFieldsSchema, 'depth'>;
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

interface DimensionsFieldsProps {
  hidePresets?: boolean;
  onDepthFocus(): void;
  onDepthBlur(): void;
}

export const DimensionsFields = ({
  hidePresets,
  onDepthFocus,
  onDepthBlur,
}: DimensionsFieldsProps) => {
  const { handleChange, setFieldValue } = useFormikContext<DimensionsFieldsSchema>();

  return (
    <Fragment>
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
          <CloseIcon />
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
          <CloseIcon />
        </div>

        <FieldWrapper name="depth" label="Depth" required>
          {field => (
            <NumberField
              {...field}
              min={0}
              onFocus={() => onDepthFocus()}
              onBlur={() => onDepthBlur()}
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

      {!hidePresets && (
        <div className={styles.hint}>
          <div className={styles.hintIcon}>
            <HintIcon />
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
      )}
    </Fragment>
  );
};
