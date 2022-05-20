import { ReactNode, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { GalleryColor } from '@prisma/client';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import api from '@src/api';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { NumberField } from '@src/components/NumberField';
import { RadioGroup } from '@src/components/RadioGroup';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { UpdateGalleryDto } from '@src/data/repositories/gallery.repository';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import { ThemeProvider, useTheme } from '@src/providers/ThemeProvider';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editGalleryModal.module.scss';

const editGallerySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
  color: z.nativeEnum(GalleryColor),
  artworks: z.array(z.object({})),
  width: z.number().positive(),
  height: z.number().positive().int(),
});

type EditGallerySchema = z.infer<typeof editGallerySchema>;

export interface EditGalleryModalProps {
  gallery: GalleryDto;
  onSave(museum: GalleryDto): void;
  trigger: ReactNode;
}

export const EditGalleryModal = ({ gallery, onSave, trigger }: EditGalleryModalProps) => {
  const theme = useTheme();
  const router = useRouter();

  const galleryWidth =
    10 +
    Math.max(
      0,
      ...gallery.artworks.map(
        item => item.position.x + (item.frame?.size.width ?? item.artwork.size.width),
      ),
    );

  const initialValues: EditGallerySchema = {
    name: gallery.name,
    description: gallery.description,
    color: gallery.color,
    artworks: gallery.artworks,
    width: galleryWidth,
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
                artworks: (values.artworks as PlacedArtworkDto[]).map(item => ({
                  artworkId: item.artwork.id,
                  frameId: item.frame?.id,
                  framingOptions: item.framingOptions,
                  position: item.position,
                })),
              };
              const updatedGallery = await api.gallery.update(gallery.museum.id, gallery.id, data);
              onSave(updatedGallery);
              setOpen(false);
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}>
          {formik => {
            const { errors, values, setFieldValue, isSubmitting, isValid } = formik;
            console.log(errors);

            return (
              <Form className={styles.form} noValidate>
                <Grid.Root
                  size={{ width: values.width, height: values.height }}
                  items={values.artworks as PlacedArtworkDto[]}
                  step={1}
                  getItemId={item => String(item.artwork.id)}
                  renderItem={(item, props) => (
                    <GridArtwork {...props} item={item} isEditing disabled={props.disabled} />
                  )}
                  onSizeChange={size => {
                    setFieldValue('width', size.width);
                  }}
                  onItemChange={(index, value) => {
                    setFieldValue('artworks', [
                      ...values.artworks.slice(0, index),
                      value,
                      ...values.artworks.slice(index + 1),
                    ]);
                  }}>
                  <FormModal.Sidecar className={cx(styles.gridBlock, `theme--${values.color}`)}>
                    <div className={styles.gridBlockGridWrapper}>
                      <Grid.Grid className={styles.gridBlockGrid} />
                    </div>
                    <div className={styles.gridBlockMap}>
                      <Grid.Map />
                    </div>
                  </FormModal.Sidecar>
                </Grid.Root>

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
                              await api.gallery.delete(gallery.museum.id, gallery.id);
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
