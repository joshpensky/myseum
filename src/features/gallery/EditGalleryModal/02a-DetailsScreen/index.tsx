import { forwardRef, PropsWithChildren, useImperativeHandle, useRef } from 'react';
import { GalleryColor } from '@prisma/client';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import api from '@src/api';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { NumberField } from '@src/components/NumberField';
import { RadioGroup } from '@src/components/RadioGroup';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { EditGalleryModalContext } from '@src/features/gallery/EditGalleryModal';
import {
  ConfirmDetailsEvent,
  EditGalleryState,
  ScreenRefValue,
} from '@src/features/gallery/EditGalleryModal/state';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './detailsScreen.module.scss';

const detailsSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
  color: z.nativeEnum(GalleryColor),
  height: z.number().positive().int(),
});

type DetailsSchema = z.infer<typeof detailsSchema>;

interface DetailsScreenProps {
  state: EditGalleryState<'details'>;
  onBack(): void;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsScreen = forwardRef<ScreenRefValue, PropsWithChildren<DetailsScreenProps>>(
  function DetailsScreen({ children, state, onBack, onSubmit }, ref) {
    const initialValues: DetailsSchema = {
      name: state.context.gallery?.name ?? '',
      description: state.context.gallery?.description ?? '',
      color: state.context.gallery?.color ?? 'paper',
      height: state.context.gallery?.height ?? 40,
    };

    const initialErrors = validateZodSchema(detailsSchema, 'sync')(initialValues);

    const formikRef = useRef<FormikProps<DetailsSchema>>(null);
    useImperativeHandle(ref, () => ({
      getIsDirty() {
        return formikRef.current?.dirty ?? false;
      },
    }));

    return (
      <FormModal.Screen title="Details" description="Add details about your gallery.">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          initialErrors={initialErrors}
          validate={validateZodSchema(detailsSchema)}
          onSubmit={async values => {
            try {
              const gallery = await api.gallery.update(
                state.context.gallery.museum.id,
                state.context.gallery.id,
                {
                  name: values.name,
                  description: values.description,
                  color: values.color,
                  height: values.height,
                },
              );
              onSubmit({
                type: 'CONFIRM_DETAILS',
                gallery,
              });
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}>
          {formik => {
            const { isSubmitting, isValid, values } = formik;

            return (
              <Form className={styles.form} noValidate>
                <div className={styles.formBody}>
                  <FieldWrapper className={styles.field} name="name" label="Name" required>
                    {field => <TextField {...field} type="text" autoComplete="off" />}
                  </FieldWrapper>

                  <FieldWrapper className={styles.field} name="description" label="Description">
                    {field => <TextArea {...field} rows={2} />}
                  </FieldWrapper>

                  <FieldWrapper className={styles.field} name="color" label="Wall Color" required>
                    {field => (
                      <RadioGroup<GalleryColor>
                        {...field}
                        options={[
                          {
                            value: 'paper',
                            display: (
                              <span className={cx(styles.colorOption, 'theme--paper')}>Paper</span>
                            ),
                          },
                          {
                            value: 'rose',
                            display: (
                              <span className={cx(styles.colorOption, 'theme--rose')}>Rosé</span>
                            ),
                          },
                          {
                            value: 'mint',
                            display: (
                              <span className={cx(styles.colorOption, 'theme--mint')}>Mint</span>
                            ),
                          },
                          {
                            value: 'navy',
                            display: (
                              <span className={cx(styles.colorOption, 'theme--navy')}>Navy</span>
                            ),
                          },
                          {
                            value: 'ink',
                            display: (
                              <span className={cx(styles.colorOption, 'theme--ink')}>Ink</span>
                            ),
                          },
                        ]}
                      />
                    )}
                  </FieldWrapper>

                  <div className={styles.row}>
                    <FieldWrapper className={styles.field} name="height" label="Height" required>
                      {field => <NumberField {...field} min={1} />}
                    </FieldWrapper>

                    <FieldWrapper className={styles.field} name="unit" label="Unit" required>
                      {field => <TextField {...field} type="text" value="inches" readOnly />}
                    </FieldWrapper>
                  </div>

                  <EditGalleryModalContext.Provider
                    value={{ height: values.height, color: values.color }}>
                    {children}
                  </EditGalleryModalContext.Provider>
                </div>

                <FormModal.Footer>
                  <Button type="button" disabled={isSubmitting || !isValid} onClick={onBack}>
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
  },
);
