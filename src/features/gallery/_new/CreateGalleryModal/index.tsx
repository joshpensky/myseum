import { ReactNode, useRef, useState } from 'react';
import { GalleryColor } from '@prisma/client';
import axios from 'axios';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { RadioGroup } from '@src/components/RadioGroup';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { UpdateGalleryDto } from '@src/data/repositories/gallery.repository';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { Grid } from '@src/features/grid';
import { useAuth } from '@src/providers/AuthProvider';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './createGalleryModal.module.scss';
import { GridArtwork } from '../../GridArtwork';

const createGallerySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string(),
  color: z.nativeEnum(GalleryColor),
  height: z.number().positive().int(),
});

type CreateGallerySchema = z.infer<typeof createGallerySchema>;

interface CreateGalleryModalProps {
  onSave(gallery: GalleryDto): void;
  trigger: ReactNode;
}

export const CreateGalleryModal = ({ onSave, trigger }: CreateGalleryModalProps) => {
  const auth = useAuth();
  const initialValues: CreateGallerySchema = {
    name: '',
    description: '',
    color: 'paper',
    height: 40,
  };
  const initialErrors = validateZodSchema(createGallerySchema, 'sync')(initialValues);

  const [open, setOpen] = useState(false);
  const [openBackground, setOpenBackground] = useState(false);
  const [color, setColor] = useState(initialValues.color);

  const formikRef = useRef<FormikProps<CreateGallerySchema>>(null);

  return (
    <FormModal.Root
      open={open}
      onOpenChange={setOpen}
      background={{
        open: openBackground,
        onOpenChange: setOpenBackground,
        content: (
          <div className={styles.gridWrapper}>
            <button>Close</button>
            <Grid
              className={styles.grid}
              rootClassName={styles.gridRoot}
              size={{ width: 100, height: 100 }}
              items={[] as PlacedArtworkDto[]}
              step={1}
              getItemId={item => String(item.artwork.id)}
              renderItem={(item, props) => (
                <GridArtwork {...props} item={item} disabled={props.disabled} />
              )}
            />
          </div>
        ),
      }}
      trigger={trigger}
      title="Create Gallery"
      description="Step 1 of 2"
      progress={0.5}
      overlayClassName={cx(styles.overlay, `theme--${color}`)}
      abandonDialogProps={{
        title: 'Discard Gallery',
        description: 'Are you sure you want to discard your new gallery?',
        hint: 'Your data will not be saved.',
        action: (
          <Button danger filled>
            Discard
          </Button>
        ),
      }}
      getIsDirty={() => formikRef.current?.dirty ?? false}>
      <FormModal.Screen title="Details" description="Add details about your gallery.">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          initialErrors={initialErrors}
          validate={validateZodSchema(createGallerySchema)}
          onSubmit={async values => {
            try {
              const data: UpdateGalleryDto = {
                name: values.name,
                description: values.description,
                color: values.color,
                height: values.height,
              };

              const res = await axios.post<GalleryDto>(
                `/api/museum/${auth.user?.museumId}/gallery`,
                data,
              );

              setOpen(false);
              onSave(res.data);
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
                      onChange={(evt, option) => setColor(option.value)}
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
                            <span className={cx(styles.colorOption, 'theme--pink')}>Pink</span>
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
                  {field => <TextField {...field} type="number" min={1} />}
                </FieldWrapper>

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
    </FormModal.Root>
  );
};
