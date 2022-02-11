import { ReactNode, useRef, useState } from 'react';
import axios from 'axios';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { UpdateMuseumDto } from '@src/data/repositories/museum.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';
import { CreateGalleryModal } from '@src/features/gallery/_new/CreateGalleryModal';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editMuseumModal.module.scss';

const editMuseumSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
  galleries: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      // TODO: fill out
    }),
  ),
});

type EditMuseumSchema = z.infer<typeof editMuseumSchema>;

interface EditMuseumModalProps {
  museum: MuseumDto;
  galleries: GalleryDto[];
  onSave(museum: MuseumWithGalleriesDto): void;
  trigger: ReactNode;
}

export const EditMuseumModal = ({ museum, galleries, onSave, trigger }: EditMuseumModalProps) => {
  const initialValues: EditMuseumSchema = {
    name: museum.name,
    description: museum.description,
    galleries,
  };

  const [open, setOpen] = useState(false);

  const formikRef = useRef<FormikProps<EditMuseumSchema>>(null);

  return (
    <FormModal.Root
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Edit Museum"
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
      <FormModal.Screen title="Edit Museum" description="Update your museum settings.">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validate={validateZodSchema(editMuseumSchema)}
          onSubmit={async values => {
            try {
              const data: UpdateMuseumDto = {
                name: values.name,
                description: values.description,
              };
              const res = await axios.put<MuseumWithGalleriesDto>(`/api/museum/${museum.id}`, data);
              onSave(res.data);
              setOpen(false);
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}>
          {formik => {
            const { isSubmitting, isValid, setFieldValue, values } = formik;

            return (
              <Form className={styles.form} noValidate>
                <FieldWrapper className={styles.field} name="name" label="Name" required>
                  {field => <TextField {...field} type="text" />}
                </FieldWrapper>

                <FieldWrapper className={styles.field} name="description" label="Description">
                  {field => <TextArea {...field} rows={2} />}
                </FieldWrapper>

                <fieldset className={styles.field} disabled={isSubmitting}>
                  <legend className={styles.legend}>Galleries</legend>

                  <CreateGalleryModal
                    trigger={<Button type="button">Create gallery</Button>}
                    onSave={data => {
                      const galleryIdx = values.galleries.findIndex(
                        gallery => gallery.id === data.id,
                      );
                      if (galleryIdx < 0) {
                        setFieldValue('galleries', [data, ...values.galleries]);
                      } else {
                        setFieldValue('galleries', [
                          ...values.galleries.slice(0, galleryIdx),
                          data,
                          ...values.galleries.slice(galleryIdx + 1),
                        ]);
                      }
                    }}
                  />

                  <ul>
                    {values.galleries.map(gallery => (
                      <li key={gallery.id}>{gallery.name}</li>
                    ))}
                  </ul>
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
