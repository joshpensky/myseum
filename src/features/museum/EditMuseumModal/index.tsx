import { Fragment, PointerEvent, ReactNode, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import axios from 'axios';
import cx from 'classnames';
import { Form, Formik, FormikProps } from 'formik';
import { motion, useDragControls, HTMLMotionProps } from 'framer-motion';
import toast from 'react-hot-toast';
import * as z from 'zod';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import IconButton from '@src/components/IconButton';
import { TextField } from '@src/components/TextField';
import { UpdateMuseumDto } from '@src/data/repositories/museum.repository';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { CloseIcon } from '@src/svgs/Close';
import { validateZodSchema } from '@src/utils/validateZodSchema';
import styles from './editMuseumModal.module.scss';

const editMuseumSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
});

type EditMuseumSchema = z.infer<typeof editMuseumSchema>;

const BP_DRAWER = Number.parseInt(styles.varBpDrawer, 10);

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

  const formikRef = useRef<FormikProps<EditMuseumSchema>>(null);

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const handleOpenChange = (open: boolean) => {
    if (!open && formikRef.current?.dirty) {
      setShowAlertDialog(true);
    } else {
      onOpenChange(open);
    }
  };

  const [isMobile, setIsMobile] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const query = window.matchMedia(`(max-width: ${BP_DRAWER - 1}px)`);
    setIsMobile(query.matches);
    query.addEventListener('change', query => {
      setIsMobile(query.matches);
    });
  }, []);

  const dragControls = useDragControls();
  const startDrag = (evt: PointerEvent<HTMLDivElement>) => {
    if (isMobile) {
      evt.preventDefault();
      dragControls.start(evt);
    }
  };

  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  const dragProps: HTMLMotionProps<'div'> = {
    drag: 'y',
    dragListener: false,
    dragControls: dragControls,
    dragConstraints: dragConstraintsRef,
    dragElastic: { top: 0.05, bottom: 0.2 },
    onDragStart: () => {
      if (isMobile) {
        document.body.classList.add('dragging');
      }
    },
    onDragEnd: (evt, info) => {
      if (isMobile) {
        if (info.offset.y > window.innerHeight / 2) {
          handleOpenChange(false);
        }
      }
      document.body.classList.remove('dragging');
    },
  };

  return (
    <Fragment>
      <AlertDialog
        open={showAlertDialog}
        onOpenChange={setShowAlertDialog}
        title="Abandon Changes"
        description="Are you sure you want to leave editing?"
        hint="Your changes will not be saved."
        action={
          <Button danger filled onClick={() => onOpenChange(false)}>
            Abandon
          </Button>
        }
      />

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content asChild>
            <motion.div ref={dragConstraintsRef} className={styles.root}>
              <motion.div className={cx(styles.modal, 'theme--ink')} {...dragProps}>
                <header className={styles.header} onPointerDown={startDrag}>
                  <Dialog.Close asChild>
                    <IconButton className={styles.headerClose} title="Close">
                      <CloseIcon />
                    </IconButton>
                  </Dialog.Close>

                  <div className={styles.dragHandle} />

                  <Dialog.Title asChild>
                    <h2 className={styles.headerTitle}>Edit Museum</h2>
                  </Dialog.Title>
                </header>

                <div className={styles.body}>
                  <h3 className={styles.title}>Edit Museum</h3>
                  <p className={styles.description}>Update your museum settings.</p>

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
              </motion.div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Fragment>
  );
};
