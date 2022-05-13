import { ReactNode, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { GalleryColor } from '@prisma/client';
import axios from 'axios';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { NumberField } from '@src/components/NumberField';
import { RadioGroup } from '@src/components/RadioGroup';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { UpdateGalleryDto } from '@src/data/repositories/gallery.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { ThemeProvider, useTheme } from '@src/providers/ThemeProvider';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editGalleryModal.module.scss';

const editGallerySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
  color: z.nativeEnum(GalleryColor),
  height: z.number().positive().int(),
});

type EditGallerySchema = z.infer<typeof editGallerySchema>;

interface EditGalleryModalProps {
  gallery: GalleryDto;
  onSave(museum: GalleryDto): void;
  trigger: ReactNode;
}

export const EditGalleryModal = ({ gallery, onSave, trigger }: EditGalleryModalProps) => {
  const theme = useTheme();
  const router = useRouter();

  const initialValues: EditGallerySchema = {
    name: gallery.name,
    description: gallery.description,
    color: gallery.color,
    height: gallery.height,
  };

  const [open, setOpen] = useState(false);
  const [hasDeleteIntent, setHasDeleteIntent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formikRef = useRef<FormikProps<EditGallerySchema>>(null);

  return (
    <FormModal.Root
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Edit Gallery"
      abandonDialogProps={{
        title: 'Discard Changes',
        description: 'Are you sure you want to abandon editing?',
        hint: 'Your changes will not be saved.',
        action: (
          <Button danger filled>
            Discard
          </Button>
        ),
      }}
      getIsDirty={() => formikRef.current?.dirty ?? false}>
      <FormModal.Screen title="Edit Gallery" description="Choose an area to update.">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validate={validateZodSchema(editGallerySchema)}
          onSubmit={async values => {
            try {
              const data: UpdateGalleryDto = {
                name: values.name,
                description: values.description,
                color: values.color,
                height: values.height,
              };
              const res = await axios.put<GalleryDto>(
                `/api/museum/${gallery.museum.id}/gallery/${gallery.id}`,
                data,
              );
              onSave(res.data);
              setOpen(false);
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}>
          {formik => {
            const { isSubmitting, isValid } = formik;

            return (
              <Form className={styles.form} noValidate>
                <FieldWrapper className={styles.field} name="name" label="Name" required>
                  {field => <TextField {...field} type="text" />}
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

                <FieldWrapper className={styles.field} name="height" label="Height" required>
                  {field => <NumberField {...field} min={1} />}
                </FieldWrapper>

                <hr className={styles.separator} />

                <fieldset disabled={isSubmitting}>
                  <legend className={styles.dangerZoneLabel}>Danger zone</legend>
                  <p className={styles.dangerZoneHint}>You cannot undo this action.</p>

                  <ThemeProvider theme={theme}>
                    <AlertDialog
                      open={hasDeleteIntent}
                      onOpenChange={setHasDeleteIntent}
                      busy={isDeleting}
                      title="Confirm Gallery Deletion"
                      description={`Are you sure you want to delete "${gallery.name}"?`}
                      hint="You cannot undo this action."
                      action={
                        <Button
                          danger
                          filled
                          busy={isDeleting}
                          onClick={async () => {
                            try {
                              setIsDeleting(true);
                              await axios.delete(
                                `/api/museum/${gallery.museum.id}/gallery/${gallery.id}`,
                              );
                              setHasDeleteIntent(false);
                              setOpen(false);
                              router.push('/');
                            } catch (error) {
                              toast.error((error as Error).message);
                              setIsDeleting(false);
                            }
                          }}>
                          Delete
                        </Button>
                      }
                      trigger={
                        <Button className={styles.dangerZoneAction} type="button" danger>
                          Delete gallery
                        </Button>
                      }
                    />
                  </ThemeProvider>
                </fieldset>

                <div className={styles.actions}>
                  <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                    Save
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </FormModal.Screen>
    </FormModal.Root>
  );
};