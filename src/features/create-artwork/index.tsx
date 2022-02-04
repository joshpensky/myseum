import {
  ComponentType,
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import { useMachine } from '@xstate/react';
import cx from 'classnames';
import IconButton from '@src/components/IconButton';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { AuthUserDto, useAuth } from '@src/providers/AuthProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Close from '@src/svgs/Close';
import { DetailsStep } from './DetailsStep';
import { DimensionsStep } from './DimensionsStep';
import { FramingStep } from './FramingStep';
import { ReviewStep } from './ReviewStep';
import { SelectionStep } from './SelectionStep';
import { UploadStep } from './UploadStep';
import styles from './root.module.scss';
import { createArtworkMachine, CreateArtworkStateValue } from './state';

interface CreateArtworkModalProps {
  user: AuthUserDto;
  onComplete(data: ArtworkDto): void;
}

const CreateArtworkModal = ({ user, onComplete }: CreateArtworkModalProps) => {
  const [state, send] = useMachine(() =>
    createArtworkMachine.withContext({
      upload: undefined,
      dimensions: undefined,
      selection: undefined,
      framing: undefined,
      details: undefined,
    }),
  );

  const onBack = () => {
    if (state.can('GO_BACK')) {
      send({ type: 'GO_BACK' });
    }
  };

  const renderStep = () => {
    if (state.matches('upload')) {
      return <UploadStep state={state} onSubmit={data => send(data)} />;
    } else if (state.matches('dimensions')) {
      return <DimensionsStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('selection')) {
      return <SelectionStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('framing')) {
      return <FramingStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('details')) {
      return <DetailsStep state={state} onBack={onBack} onSubmit={data => send(data)} />;
    } else if (state.matches('review')) {
      return (
        <ReviewStep
          state={state}
          user={user}
          onEdit={event => send(event)}
          onSubmit={data => onComplete(data)}
        />
      );
    } else {
      throw new Error('Form has entered unknown state.');
    }
  };

  // Get the current step index (sans 'complete')
  const stepKeys: CreateArtworkStateValue[] = [
    'upload',
    'dimensions',
    'selection',
    'framing',
    'details',
    'review',
  ];
  const stepIdx = stepKeys.findIndex(value => state.matches(value));

  // Gets the current state's meta data
  const meta = state.meta[`${createArtworkMachine.id}.${state.value}`];

  // Track whether the step title is visible
  const contentRef = useRef<HTMLDivElement>(null);
  const stepTitleRef = useRef<HTMLHeadingElement>(null);
  const [isStepTitleVisible, setIsStepTitleVisible] = useState(true);
  useLayoutEffect(() => {
    if (stepTitleRef.current && contentRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          const [stepTitle] = entries;
          setIsStepTitleVisible(stepTitle.isIntersecting);
        },
        {
          root: contentRef.current,
          rootMargin: styles.varContentMargin,
        },
      );
      observer.observe(stepTitleRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <div className={cx('theme--ink', styles.root)}>
      <ThemeProvider theme={{ color: 'ink' }}>
        <div className={styles.activeArea} />

        <div className={styles.formArea}>
          <header className={styles.header}>
            <div className={styles.headerClose}>
              <Dialog.Close asChild>
                <IconButton title="Close">
                  <Close />
                </IconButton>
              </Dialog.Close>
            </div>

            <div className={styles.headerTitles}>
              <Dialog.Title asChild>
                <h2 className={styles.headerTitlesMain}>Add Artwork</h2>
              </Dialog.Title>
              <p
                className={cx(
                  styles.headerTitlesSub,
                  !isStepTitleVisible && styles.headerTitlesSubReveal,
                )}>
                <span>
                  {meta.title}
                  <span className="sr-only">, </span>
                </span>
                <span>
                  Step {stepIdx + 1} of {stepKeys.length}
                </span>
              </p>
            </div>
          </header>

          <div
            className={styles.progress}
            style={{ '--stepper-progress': (stepIdx + 1) / stepKeys.length }}
          />

          <div ref={contentRef} className={styles.content}>
            <h3 ref={stepTitleRef} className={styles.contentTitle}>
              {meta.title}
            </h3>
            <p className={styles.contentDescription}>{meta.description}</p>

            {renderStep()}
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

interface CreateArtworkContextValue {
  open: boolean;
  onOpenChange(open: boolean): void;
}
export const CreateArtworkContext = createContext<CreateArtworkContextValue>({
  open: false,
  onOpenChange: () => {},
});

export interface CreateArtworkProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  onComplete(data: ArtworkDto): void;
}

export const Root = ({
  children,
  open,
  onOpenChange,
  onComplete,
}: PropsWithChildren<CreateArtworkProps>) => {
  const auth = useAuth();

  return (
    <CreateArtworkContext.Provider value={{ open, onOpenChange }}>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        {children}

        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          {auth.user && (
            <Dialog.Content
              className={styles.dialog}
              onInteractOutside={evt => console.log(evt)}
              onEscapeKeyDown={() => onOpenChange(false)}>
              <CreateArtworkModal user={auth.user} onComplete={data => onComplete(data)} />
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </CreateArtworkContext.Provider>
  );
};

type CreateArtworkTriggerProps = Record<never, string>;

export const Trigger = ({ children }: PropsWithChildren<CreateArtworkTriggerProps>) => {
  const { open, onOpenChange } = useContext(CreateArtworkContext);

  const auth = useAuth();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const didTriggerRef = useRef<boolean>(false);
  useEffect(() => {
    if (!open && didTriggerRef.current) {
      didTriggerRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  const TriggerSlot = Slot as ComponentType<
    React.HTMLProps<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>
  >;

  return (
    <TriggerSlot
      ref={triggerRef}
      disabled={!auth.user}
      onClick={() => {
        didTriggerRef.current = true;
        onOpenChange(true);
      }}>
      {children}
    </TriggerSlot>
  );
};
