import { createContext, ReactNode, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { GalleryColor } from '@prisma/client';
import { useMachine } from '@xstate/react';
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
import { ReviewScreen } from './01-ReviewScreen';
import styles from './editGalleryModal.module.scss';
import { EditGalleryContext, editGalleryMachine } from './state';
import { GridSidecar } from '../CreateGalleryModal/GridSidecar';

const editGallerySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
  color: z.nativeEnum(GalleryColor),
  artworks: z.array(z.object({})),
  width: z.number().positive(),
  height: z.number().positive().int(),
});

type EditGallerySchema = Omit<z.infer<typeof editGallerySchema>, 'artworks'> & {
  // add the type manually, rather than define via zod!
  artworks: PlacedArtworkDto[];
};

export interface EditGalleryModalProps {
  gallery: GalleryDto;
  onSave(museum: GalleryDto): void;
  trigger: ReactNode;
}

export const EditGalleryModalContext = createContext<{ height: number; color: GalleryColor }>({
  height: 0,
  color: 'paper',
});

export const EditGalleryModal = ({ gallery, onSave, trigger }: EditGalleryModalProps) => {
  const theme = useTheme();
  const router = useRouter();

  const galleryWidth =
    10 + Math.max(0, ...gallery.artworks.map(item => item.position.x + item.size.width));

  const initialValues: EditGallerySchema = {
    name: gallery.name,
    description: gallery.description,
    color: gallery.color,
    artworks: gallery.artworks,
    width: galleryWidth,
    height: gallery.height,
  };

  const initialContext: EditGalleryContext = {
    width: galleryWidth,
    gallery,
  };

  const [state, send] = useMachine(() => editGalleryMachine.withContext(initialContext));

  const [open, setOpen] = useState(false);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      send({ type: 'RESET', context: initialContext });
    }
  };

  const formikRef = useRef<FormikProps<EditGallerySchema>>(null);

  const renderScreen = () => {
    if (state.matches('review')) {
      return (
        <ReviewScreen
          state={state}
          onDelete={() => {
            onOpenChange(false);
            router.push('/');
          }}
          onEdit={evt => send(evt)}
          onSubmit={() => {}}>
          <GridSidecar
            color={state.context.gallery.color}
            height={state.context.gallery.height}
            state={state}
            send={send}
          />
        </ReviewScreen>
      );
    }
    return null;
  };

  return (
    <FormModal.Root
      open={open}
      onOpenChange={onOpenChange}
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
      {renderScreen()}
      {/* <FormModal.Screen title="Edit Gallery" description="Choose an area to update.">
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
                artworks: values.artworks.map(item => ({
                  id: item.id,
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
            const { values, setFieldValue, isSubmitting, isValid } = formik;

            return (
              <Form className={styles.form} noValidate>
                <Grid.Root
                  size={{ width: values.width, height: values.height }}
                  items={values.artworks}
                  step={1}
                  getItemId={item => item.id}
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
      </FormModal.Screen> */}
    </FormModal.Root>
  );
};
