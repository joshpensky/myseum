import { ReactNode, useRef, useState } from 'react';
import cx from 'classnames';
import dayjs from 'dayjs';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import api from '@src/api';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import IconButton from '@src/components/IconButton';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { UpdateMuseumDto } from '@src/data/repositories/museum.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';
import { CreateGalleryModal } from '@src/features/gallery/CreateGalleryModal';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import { ThemeProvider, useTheme } from '@src/providers/ThemeProvider';
import { EmptyGalleryIllustration } from '@src/svgs/EmptyGalleryIllustration';
import { TrashIcon } from '@src/svgs/TrashIcon';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editMuseumModal.module.scss';

const editMuseumSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
});

type EditMuseumSchema = z.infer<typeof editMuseumSchema>;

interface EditMuseumModalProps {
  museum: MuseumDto;
  galleries: GalleryDto[];
  onSave(museum: MuseumWithGalleriesDto): void;
  trigger: ReactNode;
}

export const EditMuseumModal = ({ onSave, trigger, museum, galleries }: EditMuseumModalProps) => {
  const theme = useTheme();

  const initialValues: EditMuseumSchema = {
    name: museum.name,
    description: museum.description,
  };

  const [open, setOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<string | null>(null);
  const [isDeletingGallery, setIsDeletingGallery] = useState(false);

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
              const updatedMuseum = await api.museum.update(museum.id, data);
              onSave(updatedMuseum);
              setOpen(false);
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}>
          {formik => {
            const { isSubmitting, isValid } = formik;

            return (
              <Form className={styles.form} noValidate>
                <div className={styles.formBody}>
                  <FieldWrapper className={styles.field} name="name" label="Name" required>
                    {field => <TextField {...field} type="text" />}
                  </FieldWrapper>

                  <FieldWrapper className={styles.field} name="description" label="Description">
                    {field => <TextArea {...field} rows={2} />}
                  </FieldWrapper>

                  <fieldset className={styles.field} disabled={isSubmitting}>
                    <legend className={styles.legend}>Galleries</legend>

                    <div className={styles.galleriesFieldset}>
                      <CreateGalleryModal
                        trigger={
                          <Button className={styles.galleriesFieldsetAction} type="button">
                            Create gallery
                          </Button>
                        }
                        onSave={data => {
                          const galleryIdx = galleries.findIndex(gallery => gallery.id === data.id);
                          let nextGalleries: GalleryDto[];
                          if (galleryIdx < 0) {
                            nextGalleries = [data, ...galleries];
                          } else {
                            nextGalleries = [
                              ...galleries.slice(0, galleryIdx),
                              data,
                              ...galleries.slice(galleryIdx + 1),
                            ];
                          }
                          onSave({
                            ...museum,
                            galleries: nextGalleries,
                          });
                        }}
                      />

                      {!galleries.length ? (
                        <div className={styles.emptyState}>
                          <div className={styles.emptyStateIllo}>
                            <EmptyGalleryIllustration />
                          </div>
                          <p className={styles.emptyStateText}>You have no galleries.</p>
                          <CreateGalleryModal
                            onComplete={data => {
                              onSave({
                                ...museum,
                                galleries: [data, ...galleries],
                              });
                            }}
                            trigger={
                              <Button className={styles.emptyStateAction}>Create gallery</Button>
                            }
                          />
                        </div>
                      ) : (
                        <ul>
                          {galleries.map((gallery, idx) => (
                            <li key={gallery.id} className={styles.gallery}>
                              <div className={cx(styles.galleryPreview, `theme--${gallery.color}`)}>
                                <Grid.Root
                                  preview
                                  size={{ width: 10, height: gallery.height }}
                                  items={gallery.artworks}
                                  step={1}
                                  getItemId={item => item.artwork.id}
                                  renderItem={(item, props) => (
                                    <GridArtwork {...props} item={item} disabled={props.disabled} />
                                  )}>
                                  <Grid.Grid className={styles.galleryPreviewGrid} />
                                </Grid.Root>
                              </div>

                              <div className={styles.galleryMeta}>
                                <p>{gallery.name}</p>
                                <p className={styles.galleryMetaSmall}>
                                  Est. {dayjs(gallery.addedAt).year()}
                                </p>
                              </div>

                              <ThemeProvider theme={theme}>
                                <AlertDialog
                                  open={galleryToDelete === gallery.id}
                                  onOpenChange={open => {
                                    if (open) {
                                      setGalleryToDelete(gallery.id);
                                    } else {
                                      setGalleryToDelete(null);
                                    }
                                  }}
                                  title="Delete Gallery"
                                  description={`Are you sure you want to delete ${gallery.name}?`}
                                  hint="You cannot undo this action."
                                  action={
                                    <Button
                                      danger
                                      filled
                                      busy={isDeletingGallery}
                                      onClick={async () => {
                                        setIsDeletingGallery(true);

                                        try {
                                          await api.gallery.delete(gallery.museum.id, gallery.id);
                                          setGalleryToDelete(null);
                                          setIsDeletingGallery(false);
                                          onSave({
                                            ...museum,
                                            galleries: [
                                              ...galleries.slice(0, idx),
                                              ...galleries.slice(idx + 1),
                                            ],
                                          });
                                        } catch (error) {
                                          setIsDeletingGallery(false);
                                          toast.error((error as Error).message);
                                        }
                                      }}>
                                      Delete
                                    </Button>
                                  }
                                  trigger={
                                    <IconButton type="button" title="Delete">
                                      <TrashIcon />
                                    </IconButton>
                                  }
                                />
                              </ThemeProvider>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </fieldset>
                </div>

                <FormModal.Footer>
                  <Button type="submit" filled busy={isSubmitting} disabled={!isValid}>
                    Save
                  </Button>
                </FormModal.Footer>
              </Form>
            );
          }}
        </Formik>
      </FormModal.Screen>
    </FormModal.Root>
  );
};
