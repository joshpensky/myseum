import { Fragment, PointerEvent, PropsWithChildren, ReactNode, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import cx from 'classnames';
import { motion, useDragControls, HTMLMotionProps } from 'framer-motion';
import { AlertDialog } from '@src/components/AlertDialog';
import IconButton from '@src/components/IconButton';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import { CloseIcon } from '@src/svgs/Close';
import styles from './formModal.module.scss';

const BP_DRAWER = Number.parseInt(styles.varBpDrawer, 10);

interface FormModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  trigger?: ReactNode;
  title: string;
  getIsDirty?(): boolean;
  abandonDialogProps: {
    title: string;
    description: string;
    hint?: string;
    action: ReactNode;
  };
}

export const Root = ({
  children,
  open,
  onOpenChange,
  getIsDirty,
  title,
  trigger,
  abandonDialogProps,
}: PropsWithChildren<FormModalProps>) => {
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const handleOpenChange = (open: boolean) => {
    if (!open && getIsDirty?.()) {
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
        title={abandonDialogProps.title}
        description={abandonDialogProps.description}
        hint={abandonDialogProps.hint}
        action={<Slot onClick={() => onOpenChange(false)}>{abandonDialogProps.action}</Slot>}
      />

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content asChild>
            <motion.div ref={dragConstraintsRef} className={styles.root}>
              <ThemeProvider theme={{ color: 'ink' }}>
                <motion.div className={cx(styles.modal, 'theme--ink')} {...dragProps}>
                  <header className={styles.header} onPointerDown={startDrag}>
                    <Dialog.Close asChild>
                      <IconButton className={styles.headerClose} title="Close">
                        <CloseIcon />
                      </IconButton>
                    </Dialog.Close>

                    <div className={styles.dragHandle} />

                    <Dialog.Title asChild>
                      <h2 className={styles.headerTitle}>{title}</h2>
                    </Dialog.Title>
                  </header>

                  <div className={styles.body}>{children}</div>
                </motion.div>
              </ThemeProvider>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Fragment>
  );
};

interface FormModalScreenProps {
  title: string;
  description: string;
}

export const Screen = ({ children }: PropsWithChildren<FormModalScreenProps>) => (
  <Fragment>
    <h3 className={styles.title}>Edit Museum</h3>
    <p className={styles.description}>Update your museum settings.</p>

    {children}
  </Fragment>
);
