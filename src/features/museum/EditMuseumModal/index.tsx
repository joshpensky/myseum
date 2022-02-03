import { ReactNode, useRef, useState } from 'react';
import axios from 'axios';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { TextField } from '@src/components/TextField';
import { UpdateMuseumDto } from '@src/data/repositories/museum.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editMuseumModal.module.scss';

const editMuseumSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
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
            const { isSubmitting, isValid } = formik;

            return (
              <Form className={styles.form} noValidate>
                <div className={styles.test} />

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

                <fieldset className={styles.field} disabled={isSubmitting}>
                  <legend className={styles.legend}>Galleries</legend>

                  <Button type="button">Create gallery</Button>

                  <ul>
                    {galleries.map(gallery => (
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
