import { ReactNode, useRef, useState } from 'react';
import axios from 'axios';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { TextField } from '@src/components/TextField';
import { UpdateGalleryDto } from '@src/data/repositories/gallery.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editGalleryModal.module.scss';

const editGallerySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
});

type EditGallerySchema = z.infer<typeof editGallerySchema>;

interface EditGalleryModalProps {
  gallery: GalleryDto;
  onSave(museum: GalleryDto): void;
  trigger: ReactNode;
}

export const EditGalleryModal = ({ gallery, onSave, trigger }: EditGalleryModalProps) => {
  const initialValues: EditGallerySchema = {
    name: gallery.name,
    description: gallery.description,
  };

  const [open, setOpen] = useState(false);

  const formikRef = useRef<FormikProps<EditGallerySchema>>(null);

  return (
    <FormModal.Root
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Edit Gallery"
      abandonDialogProps={{
        title: 'Abandon Changes',
        description: 'Are you sure you want to abandon editing?',
        hint: 'Your changes will not be saved.',
        action: (
          <Button danger filled>
            Abandon
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

                <FieldWrapper
                  className={styles.field}
                  name="description"
                  label="Description"
                  required>
                  {field => <TextField {...field} type="text" grow rows={2} />}
                </FieldWrapper>

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
