import { Fragment, PointerEvent, PropsWithChildren, ReactNode, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import cx from 'classnames';
import { motion, useDragControls, HTMLMotionProps } from 'framer-motion';
import { AlertDialog } from '@src/components/AlertDialog';
import IconButton from '@src/components/IconButton';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { ThemeProvider, useTheme } from '@src/providers/ThemeProvider';
import { CloseIcon } from '@src/svgs/Close';
import styles from './formModal.module.scss';

const BP_DRAWER = Number.parseInt(styles.varBpDrawer, 10);

interface FormModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  getIsDirty?(): boolean;
  /**
   * Progress within the modal, from 0–1. Default 1.
   */
  progress?: number;
  overlayClassName?: string;
  abandonDialogProps?: {
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
  progress,
  title,
  description,
  trigger,
  overlayClassName,
  abandonDialogProps,
}: PropsWithChildren<FormModalProps>) => {
  const theme = useTheme();

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const handleOpenChange = (open: boolean) => {
    if (!open && abandonDialogProps && getIsDirty?.()) {
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
    dragElastic: {
      top: 0.05,
      bottom: 0.2,
    },
    dragTransition: {
      min: 0,
      max: 300,
      bounceStiffness: 300,
    },
    onDragStart: () => {
      if (isMobile) {
        document.body.classList.add('dragging');
      }
    },
    onDragEnd: (evt, info) => {
      if (isMobile && Math.abs(info.offset.y) > 150) {
        handleOpenChange(false);
      }
      document.body.classList.remove('dragging');
    },
  };

  return (
    <Fragment>
      {abandonDialogProps && (
        <AlertDialog
          open={showAlertDialog}
          onOpenChange={setShowAlertDialog}
          title={abandonDialogProps.title}
          description={abandonDialogProps.description}
          hint={abandonDialogProps.hint}
          action={
            <Slot
              onClick={() => {
                setShowAlertDialog(false);
                onOpenChange(false);
              }}>
              {abandonDialogProps.action}
            </Slot>
          }
        />
      )}

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

        <Dialog.Portal>
          <Dialog.Overlay
            className={cx(styles.overlay, `theme--${theme.color}`, overlayClassName)}
          />

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

                    <Dialog.Title asChild>
                      <h2 className={styles.headerTitle}>{title}</h2>
                    </Dialog.Title>

                    {description && (
                      <Dialog.Description asChild>
                        <p className={styles.headerDesc}>{description}</p>
                      </Dialog.Description>
                    )}

                    <div
                      className={styles.headerProgress}
                      style={{ '--progress': progress ?? 1 }}
                    />
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

export const Screen = ({
  children,
  title,
  description,
}: PropsWithChildren<FormModalScreenProps>) => (
  <div className={styles.screen}>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.description}>{description}</p>

    {children}
  </div>
);

type FormModalSidecarProps = Record<string, unknown>;

export const Sidecar = ({ children }: PropsWithChildren<FormModalSidecarProps>) => (
  <div className={styles.sidecar}>{children}</div>
);

type FormModalFooterProps = Record<string, unknown>;

export const Footer = ({ children }: PropsWithChildren<FormModalFooterProps>) => (
  <footer className={styles.footer}>{children}</footer>
);
