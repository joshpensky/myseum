import { forwardRef, PropsWithChildren } from 'react';
import { GalleryColor } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { NumberField } from '@src/components/NumberField';
import { RadioGroup } from '@src/components/RadioGroup';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { UpdateGalleryDto } from '@src/data/repositories/gallery.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { useAuth } from '@src/providers/AuthProvider';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './detailsScreen.module.scss';
import { CreateGalleryModalContext } from '..';
import { ConfirmDetailsEvent, CreateGalleryState } from '../state';

const detailsSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
  color: z.nativeEnum(GalleryColor),
  height: z.number().positive().int(),
});

type DetailsSchema = z.infer<typeof detailsSchema>;

interface DetailsScreenProps {
  state: CreateGalleryState<'details'>;
  onSubmit(data: ConfirmDetailsEvent): void;
}

export const DetailsScreen = forwardRef<
  FormikProps<DetailsSchema>,
  PropsWithChildren<DetailsScreenProps>
>(function DetailsScreen({ children, state, onSubmit }, ref) {
  const auth = useAuth();

  const initialValues: DetailsSchema = {
    name: state.context.gallery?.name ?? '',
    description: state.context.gallery?.description ?? '',
    color: state.context.gallery?.color ?? 'paper',
    height: state.context.gallery?.height ?? 40,
  };

  const initialErrors = validateZodSchema(detailsSchema, 'sync')(initialValues);

  return (
    <FormModal.Screen title="Details" description="Add details about your gallery.">
      <Formik
        innerRef={ref}
        initialValues={initialValues}
        initialErrors={initialErrors}
        validate={validateZodSchema(detailsSchema)}
        onSubmit={async values => {
          try {
            const data: UpdateGalleryDto = {
              name: values.name,
              description: values.description,
              color: values.color,
              height: values.height,
            };

            let res: AxiosResponse<GalleryDto, any>;
            if (state.context.gallery) {
              res = await axios.put<GalleryDto>(
                `/api/museum/${auth.user?.museumId}/gallery/${state.context.gallery.id}`,
                data,
              );
            } else {
              res = await axios.post<GalleryDto>(
                `/api/museum/${auth.user?.museumId}/gallery`,
                data,
              );
            }

            onSubmit({
              type: 'CONFIRM_DETAILS',
              gallery: res.data,
            });
          } catch (error) {
            toast.error((error as Error).message);
          }
        }}>
        {formik => {
          const { isSubmitting, isValid, values } = formik;

          return (
            <Form className={styles.form} noValidate>
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
                        value: 'pink',
                        display: (
                          <span className={cx(styles.colorOption, 'theme--pink')}>Rosé</span>
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
                        display: <span className={cx(styles.colorOption, 'theme--ink')}>Ink</span>,
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

              <CreateGalleryModalContext.Provider
                value={{ height: values.height, color: values.color }}>
                {children}
              </CreateGalleryModalContext.Provider>

              <div className={styles.actions}>
                <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                  Next
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </FormModal.Screen>
  );
});
