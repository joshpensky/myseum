import { ChangeEvent, DragEvent, Fragment, ReactNode, useRef, useState } from 'react';
import axios from 'axios';
import { Field, Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { TextArea } from '@src/components/TextArea';
import { TextField } from '@src/components/TextField';
import { UpdateUserDto } from '@src/data/repositories/user.repository';
import { UserDto } from '@src/data/serializers/user.serializer';
import { AuthUserDto, useAuth } from '@src/providers/AuthProvider';
import { ThemeProvider, useTheme } from '@src/providers/ThemeProvider';
import { getImageUrl } from '@src/utils/getImageUrl';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './settingsModal.module.scss';

const userSettingsSchema = z.object({
  email: z.string(),
  name: z.string().min(1, 'Name is required.'),
  bio: z.string(),
  headshot: z.string().nullable(),
});

type UserSettingsSchema = z.infer<typeof userSettingsSchema>;

interface SettingsModalProps {
  user: AuthUserDto;
  onSave(user: UserDto): void;
  trigger: ReactNode;
}

export const SettingsModal = ({ user, onSave, trigger }: SettingsModalProps) => {
  const auth = useAuth();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [hasDeleteIntent, setHasDeleteIntent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formikRef = useRef<FormikProps<UserSettingsSchema>>(null);
  const initialValues: UserSettingsSchema = {
    email: user.email,
    name: user.name,
    bio: user.bio,
    headshot: user.headshot,
  };

  return (
    <FormModal.Root
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Profile"
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
      <FormModal.Screen title="Settings" description="Update your profile settings.">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validate={validateZodSchema(userSettingsSchema)}
          onSubmit={async values => {
            try {
              const data: UpdateUserDto = {
                name: values.name,
                bio: values.bio,
                headshot: values.headshot,
              };
              const res = await axios.put<UserDto>(`/api/user/${user.id}`, data);
              onSave(res.data);
              setOpen(false);
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}>
          {formik => {
            const { isSubmitting, isValid, setFieldValue, values } = formik;

            const accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            const [isDroppingUpload, setIsDroppingUpload] = useState(false);
            const [isUploadingHeadshot, setIsUploadingHeadshot] = useState(false);

            const onFileUpload = (files: FileList | null) => {
              setIsUploadingHeadshot(true);
              const imageFile = files?.item(0);
              if (!imageFile || !accept.includes(imageFile.type)) {
                setIsUploadingHeadshot(false);
                return;
              }

              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  const image = new Image();
                  image.onload = () => {
                    setFieldValue('headshot', image.src);
                    setIsUploadingHeadshot(false);
                  };
                  image.src = reader.result;
                } else {
                  setIsUploadingHeadshot(false);
                }
              };
              reader.readAsDataURL(imageFile);
            };

            /**
             * Handler for when the user enters the drop area.
             */
            const onDropStart = (evt: DragEvent<HTMLLabelElement>) => {
              evt.preventDefault();
              setIsDroppingUpload(true);
            };

            /**
             * Handler for when the user leaves the drop area.
             */
            const onDropEnd = (evt: DragEvent<HTMLLabelElement>) => {
              evt.preventDefault();
              setIsDroppingUpload(false);
            };

            /**
             * Handler for when the user drops an image in the drop area.
             */
            const onDrop = (evt: DragEvent<HTMLLabelElement>) => {
              onDropEnd(evt);
              onFileUpload(evt.dataTransfer.files);
            };

            return (
              <Form className={styles.form} noValidate>
                <FieldWrapper
                  className={styles.field}
                  name="email"
                  label="Email"
                  hint="Connected via Google OAuth."
                  required
                  disabled>
                  {field => <TextField {...field} type="text" />}
                </FieldWrapper>

                <FieldWrapper className={styles.field} name="name" label="Name" required>
                  {field => <TextField {...field} type="text" />}
                </FieldWrapper>

                <FieldWrapper className={styles.field} name="bio" label="Bio">
                  {field => <TextArea {...field} rows={2} />}
                </FieldWrapper>

                <FieldWrapper className={styles.field} name="headshot" label="Headshot">
                  {field => (
                    <div className={styles.fieldHeadshot} data-dropping={isDroppingUpload}>
                      {!values.headshot ? (
                        <Fragment>
                          <Field
                            {...field}
                            type="file"
                            className="sr-only"
                            accept={accept.join(', ')}
                            disabled={isUploadingHeadshot}
                            value=""
                            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                              onFileUpload(evt.target.files);
                            }}
                          />
                          <label
                            htmlFor={field.name}
                            className={styles.fieldHeadshotInput}
                            onDragOver={onDropStart}
                            onDragEnter={onDropStart}
                            onDragLeave={onDropEnd}
                            onDragEnd={onDropEnd}
                            onDrop={onDrop}>
                            Tap or drag & drop to upload
                          </label>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <div className={styles.fieldHeadshotPreview}>
                            <img
                              src={
                                values.headshot.includes('base64')
                                  ? values.headshot
                                  : getImageUrl('headshots', values.headshot)
                              }
                              alt=""
                            />
                          </div>

                          <Button
                            className={styles.fieldHeadshotChange}
                            type="button"
                            onClick={() => {
                              setFieldValue('headshot', null);
                            }}>
                            Change
                          </Button>
                        </Fragment>
                      )}
                    </div>
                  )}
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
                      title="Confirm Account Deletion"
                      description={`Are you sure you want to delete your account?`}
                      hint="You cannot undo this action."
                      action={
                        <Button
                          danger
                          filled
                          busy={isDeleting}
                          onClick={async () => {
                            try {
                              setIsDeleting(true);
                              await axios.delete(`/api/user/${user.id}`);
                              try {
                                await auth.signOut();
                              } catch {
                                // This will produce an error because the user no longer exists
                                // Safe to ignore!
                              }
                              toast.success('Account deleted!');
                              setHasDeleteIntent(false);
                              setOpen(false);
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
                          Delete account
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
