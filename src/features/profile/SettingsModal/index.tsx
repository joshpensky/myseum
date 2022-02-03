import { ReactNode, useRef, useState } from 'react';
import axios from 'axios';
import { Form, Formik, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import * as z from 'zod';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import * as FormModal from '@src/components/FormModal';
import { TextField } from '@src/components/TextField';
import { UpdateUserDto } from '@src/data/repositories/user.repository';
import { UserDto } from '@src/data/serializers/user.serializer';
import { AuthUserDto } from '@src/providers/AuthProvider';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './settingsModal.module.scss';

const userSettingsSchema = z.object({
  email: z.string(),
  name: z.string().min(1, 'Name is required.'),
  bio: z.string(),
});

type UserSettingsSchema = z.infer<typeof userSettingsSchema>;

interface SettingsModalProps {
  user: AuthUserDto;
  onSave(user: UserDto): void;
  trigger: ReactNode;
}

export const SettingsModal = ({ user, onSave, trigger }: SettingsModalProps) => {
  const initialValues: UserSettingsSchema = {
    email: user.email,
    name: user.name,
    bio: user.bio,
  };

  const [open, setOpen] = useState(false);

  const formikRef = useRef<FormikProps<UserSettingsSchema>>(null);

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
              };
              const res = await axios.put<UserDto>(`/api/user/${user.id}`, data);
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

                <FieldWrapper className={styles.field} name="bio" label="Bio" required>
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
