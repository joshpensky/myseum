import { Children, FormEvent, PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import tw, { css, theme } from 'twin.macro';
import anime from 'animejs';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { rgba } from 'polished';
import FocusLock from 'react-focus-lock';
import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
import Portal from '@src/components/Portal';
import Close from '@src/svgs/Close';
import { BaseProps } from '@src/types';

type FeatureFormModalOutsideFormProps = { ''?: unknown };
const FeatureFormModalOutsideForm = ({
  children,
}: PropsWithChildren<FeatureFormModalOutsideFormProps>) => <div>{children}</div>;

export type FeatureFormModalProps = {
  'aria-label': string;
  disabledClose?: boolean;
  disabledSubmit?: boolean;
  hideSubmit?: boolean;
  id: string;
  title: ReactNode;
  onClose(): void;
  onSubmit(evt: FormEvent<HTMLFormElement>): boolean | Promise<boolean>;
};

const FeatureFormModal = ({
  'aria-label': ariaLabel,
  children,
  disabledClose,
  disabledSubmit,
  hideSubmit,
  id,
  onClose,
  onSubmit,
  title,
}: PropsWithChildren<FeatureFormModalProps>) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const ModalAnimations = {
    enter() {
      const scalePadding = 24; // # of pixels to end smaller
      const scaleXStart = (window.innerWidth - scalePadding) / window.innerWidth;
      const scaleYStart = (window.innerHeight - scalePadding) / window.innerHeight;
      const t = anime
        .timeline()
        .add({
          targets: rootRef.current,
          scaleX: [scaleXStart, 1],
          scaleY: [scaleYStart, 1],
          opacity: [0, 1],
          duration: 300,
          easing: 'easeOutQuint',
        })
        .add(
          {
            targets: contentRef.current,
            opacity: [0, 1],
            duration: 150,
            easing: 'easeOutQuad',
          },
          50,
        );
      return t.finished;
    },
    leave() {
      const scalePadding = 24; // # of pixels to start smaller
      const scaleXEnd = (window.innerWidth - scalePadding) / window.innerWidth;
      const scaleYEnd = (window.innerHeight - scalePadding) / window.innerHeight;
      const t = anime
        .timeline()
        .add({
          targets: contentRef.current,
          opacity: [1, 0],
          duration: 150,
          easing: 'easeOutSine',
        })
        .add(
          {
            targets: rootRef.current,
            scaleX: [1, scaleXEnd],
            scaleY: [1, scaleYEnd],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeOutQuint',
          },
          50,
        );
      return t.finished;
    },
  };

  /**
   * Wrapper for the close handler. Plays the close animation, then calls the
   * passed handler.
   */
  const _onClose = async () => {
    await ModalAnimations.leave();
    onClose();
  };

  /**
   * Key handler. Closes the modal form on escape key.
   */
  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Escape':
      case 'Esc': {
        if (!disabledClose) {
          evt.preventDefault();
          _onClose();
        }
      }
    }
  };

  /**
   * Callback handler for when the form submits. Validates and saves data
   * to the API, then closes the modal.
   */
  const _onSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (disabledSubmit) {
      return;
    }
    const submitSuccess = await onSubmit(evt);
    if (submitSuccess) {
      _onClose();
    }
  };

  // Adds the key handler
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  // Disables/enables body scroll on mount/unmount, respectively
  useEffect(() => {
    if (rootRef.current) {
      ModalAnimations.enter();
      disableBodyScroll(rootRef.current);
    }
    return () => {
      if (rootRef.current) {
        enableBodyScroll(rootRef.current);
      }
    };
  }, []);

  const isChildOutsideForm = (child: ReactNode) =>
    child &&
    typeof child === 'object' &&
    'type' in child &&
    typeof child.type === 'function' &&
    child.type.name === FeatureFormModalOutsideForm.name;

  return (
    <Portal to="modal-root">
      <FocusLock returnFocus>
        <div
          ref={rootRef}
          id={id}
          css={[
            tw`fixed inset-0 bg-black text-white z-modal overflow-hidden`,
            tw`opacity-0`,
            css`
              box-shadow: 0 0 70px 0 ${rgba(theme`colors.white`, 0.5)};
              & *::selection {
                background: ${rgba(theme`colors.white`, 0.35)};
              }
            `,
          ]}
          role="dialog"
          aria-label={ariaLabel}
          aria-modal="true">
          <div
            ref={contentRef}
            id={`${id}-content`}
            css={[tw`flex flex-col size-full`, tw`opacity-0`]}>
            <header css={tw`flex items-center border-b border-white p-4`}>
              <div css={tw`mr-5`}>
                <IconButton
                  ref={cancelBtnRef}
                  title="Cancel"
                  disabled={disabledClose}
                  onClick={_onClose}>
                  <Close />
                </IconButton>
              </div>
              <div css={[disabledClose && tw`opacity-50`]}>{title}</div>
            </header>
            <div css={tw`flex flex-1 relative`}>
              <form css={tw`flex flex-1 overflow-hidden`} onSubmit={_onSubmit}>
                {Children.map(children, child => {
                  if (isChildOutsideForm(child)) {
                    return null;
                  }
                  return child;
                })}

                {/* Render Save button in top right corner, last in tab order */}
                {!hideSubmit && (
                  <div css={tw`fixed right-4 top-8 transform -translate-y-1/2`}>
                    <Button disabled={disabledSubmit} filled type="submit">
                      Save
                    </Button>
                  </div>
                )}
              </form>

              {Children.map(children, child => {
                if (!isChildOutsideForm(child)) {
                  return null;
                }
                return child;
              })}
            </div>
          </div>
        </div>
      </FocusLock>
    </Portal>
  );
};

type FeatureFormModalMainProps = { ''?: unknown };
const FeatureFormModalMain = ({ children }: PropsWithChildren<FeatureFormModalMainProps>) => (
  <div css={tw`flex flex-col flex-1`}>{children}</div>
);

type FeatureFormModalSidebarProps = { ''?: unknown };
const FeatureFormModalSidebar = ({ children }: PropsWithChildren<FeatureFormModalSidebarProps>) => (
  <div css={tw`relative flex-shrink-0 max-w-lg w-full border-l border-white`}>
    <div
      css={tw`absolute inset-0 size-full flex flex-col overflow-x-hidden overflow-y-auto divide-y divide-white`}>
      {children}
    </div>
  </div>
);

type FeatureFormModalSidebarPanelProps = BaseProps & {
  headerAction?: ReactNode;
  title: string;
};
const FeatureFormModalSidebarPanel = ({
  children,
  className,
  css: customCss,
  headerAction,
  title,
}: PropsWithChildren<FeatureFormModalSidebarPanelProps>) => (
  <section className={className} css={[tw`flex flex-col px-6 pt-5 pb-6 items-start`, customCss]}>
    <header css={tw`flex w-full items-center justify-between mb-1`}>
      <h2 css={tw`font-medium mr-4`}>{title}</h2>
      {headerAction}
    </header>
    {children}
  </section>
);

// Assign components with dot notation
FeatureFormModal.Main = FeatureFormModalMain;
FeatureFormModal.Sidebar = FeatureFormModalSidebar;
FeatureFormModal.SidebarPanel = FeatureFormModalSidebarPanel;
FeatureFormModal.OutsideForm = FeatureFormModalOutsideForm;

export default FeatureFormModal;
