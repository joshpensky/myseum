import { ReactNode, useRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import api from '@src/api';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { ImageField } from '@src/components/ImageField';
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
              const updatedUser = await api.user.update(user.id, data);
              onSave(updatedUser);
              setOpen(false);
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}>
          {formik => {
            const { isSubmitting, isValid, setFieldValue, values } = formik;

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
                  {() => (
                    <ImageField
                      value={(() => {
                        if (!values.headshot) {
                          return null;
                        }
                        const image = new Image();
                        image.src = values.headshot.includes('base64')
                          ? values.headshot
                          : getImageUrl('headshots', values.headshot);
                        return image;
                      })()}
                      onChange={data => {
                        setFieldValue('headshot', data?.image.src);
                      }}
                      preview={img => (
                        <div className={styles.fieldHeadshotPreview}>
                          <img src={img.src} alt="" />
                        </div>
                      )}
                    />
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
                              await api.user.delete(user.id);
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
