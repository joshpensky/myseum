import { Fragment, PointerEvent, PropsWithChildren, ReactNode, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import cx from 'classnames';
import { motion, useDragControls, HTMLMotionProps, MotionStyle } from 'framer-motion';
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
  background?: {
    open: boolean;
    onOpenChange(open: boolean): void;
    content: ReactNode;
  };
  trigger?: ReactNode;
  title: string;
  description?: string;
  getIsDirty?(): boolean;
  /**
   * Progress within the modal, from 0–1. Default 1.
   */
  progress?: number;
  overlayClassName?: string;
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
  background,
  getIsDirty,
  progress,
  title,
  description,
  trigger,
  overlayClassName,
  abandonDialogProps,
}: PropsWithChildren<FormModalProps>) => {
  const theme = useTheme();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [backgroundContainer, setBackgroundContainer] = useState<HTMLDivElement | null>(null);

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const handleOpenChange = (open: boolean) => {
    if (!open && getIsDirty?.()) {
      setShowAlertDialog(true);
    } else {
      onOpenChange(open);
      if (!open) {
        background?.onOpenChange(false);
      }
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
        if (background) {
          background.onOpenChange(!background.open);
        } else {
          handleOpenChange(false);
        }
      }
      document.body.classList.remove('dragging');
    },
  };
  const rootStyle: MotionStyle = {};
  if (background?.open) {
    rootStyle.y = 'calc(100% - 100px)';
    rootStyle.transition = `400ms ${styles.varDrawerEasing}`;
    rootStyle.animation = 'none';
  }

  return (
    <Fragment>
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

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

        <Dialog.Portal>
          <Dialog.Overlay
            className={cx(styles.overlay, `theme--${theme.color}`, overlayClassName)}
          />

          <Dialog.Content
            asChild
            onEscapeKeyDown={evt => {
              if (background?.open) {
                evt.preventDefault();
              }
            }}
            onInteractOutside={evt => {
              if (background) {
                evt.preventDefault();
                if (
                  evt.type.includes('focusOutside') &&
                  !(
                    dragConstraintsRef.current?.contains(document.activeElement) ||
                    backgroundContainer?.contains(document.activeElement)
                  )
                ) {
                  closeButtonRef.current?.focus();
                }
              }
            }}>
            <motion.div ref={dragConstraintsRef} className={styles.root} style={rootStyle}>
              <ThemeProvider theme={{ color: 'ink' }}>
                <motion.div
                  className={cx(
                    styles.modal,
                    !!background && styles.modalBackgroundable,
                    'theme--ink',
                  )}
                  {...dragProps}>
                  <header className={styles.header} onPointerDown={startDrag}>
                    <Dialog.Close asChild>
                      <IconButton ref={closeButtonRef} className={styles.headerClose} title="Close">
                        <CloseIcon />
                      </IconButton>
                    </Dialog.Close>

                    {!!background && (
                      <button
                        className={styles.headerDragHandle}
                        title={`Move to ${background.open ? 'foreground' : 'background'}`}
                        aria-label={`Move to ${background.open ? 'foreground' : 'background'}`}
                        onClick={() => background.onOpenChange(!background.open)}
                      />
                    )}

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

      {open && !!background && (
        <Fragment>
          <div ref={setBackgroundContainer} className={styles.background} />
          <Dialog.Root open={open && background.open} onOpenChange={background.onOpenChange}>
            <Dialog.Portal forceMount={open} container={backgroundContainer}>
              <Dialog.Content
                forceMount={open}
                asChild
                onOpenAutoFocus={evt => evt.preventDefault()}
                onEscapeKeyDown={() => background.onOpenChange(false)}
                onPointerDownOutside={evt => evt.preventDefault()}>
                <div className={styles.backgroundContent}>{background.content}</div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </Fragment>
      )}
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
  <Fragment>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.description}>{description}</p>

    {children}
  </Fragment>
);
