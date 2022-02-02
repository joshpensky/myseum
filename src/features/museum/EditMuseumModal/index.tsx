import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import axios from 'axios';
import cx from 'classnames';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import IconButton from '@src/components/IconButton';
import { TextField } from '@src/components/TextField';
import { UpdateMuseumDto } from '@src/data/repositories/museum.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';
import { CloseIcon } from '@src/svgs/Close';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editMuseumModal.module.scss';

const editMuseumSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
});

type EditMuseumSchema = z.infer<typeof editMuseumSchema>;

interface EditMuseumModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  museum: MuseumDto;
  galleries: GalleryDto[];
  onSave(museum: MuseumWithGalleriesDto): void;
  trigger: ReactNode;
}

export const EditMuseumModal = ({
  open,
  onOpenChange,
  museum,
  galleries,
  onSave,
  trigger,
}: EditMuseumModalProps) => {
  const initialValues: EditMuseumSchema = {
    name: museum.name,
    description: museum.description,
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content asChild onPointerDownOutside={evt => evt.preventDefault()}>
          <div className={cx(styles.root, 'theme--ink')}>
            <header className={styles.header}>
              <Dialog.Close asChild>
                <IconButton className={styles.headerClose} title="Close">
                  <CloseIcon />
                </IconButton>
              </Dialog.Close>

              <Dialog.Title asChild>
                <h2 className={styles.headerTitle}>Edit Museum</h2>
              </Dialog.Title>
            </header>

            <div className={styles.body}>
              <h3 className={styles.title}>Edit Museum</h3>
              <p className={styles.description}>Update your museum settings.</p>

              <Formik
                initialValues={initialValues}
                validate={validateZodSchema(editMuseumSchema)}
                onSubmit={async values => {
                  try {
                    const data: UpdateMuseumDto = {
                      name: values.name,
                      description: values.description,
                    };
                    const res = await axios.put<MuseumWithGalleriesDto>(
                      `/api/museum/${museum.id}`,
                      data,
                    );
                    onSave(res.data);
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}>
                {formik => {
                  const { isSubmitting, isValid } = formik;

                  return (
                    <Form className={styles.form} noValidate>
                      <FieldWrapper name="name" label="Name" required>
                        {field => <TextField {...field} type="text" />}
                      </FieldWrapper>

                      <FieldWrapper name="description" label="Description" required>
                        {field => <TextField {...field} type="text" grow rows={2} />}
                      </FieldWrapper>

                      <fieldset>
                        <legend>Galleries</legend>

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
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
