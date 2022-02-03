import { ReactNode } from 'react';
import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';
import cx from 'classnames';
import Button from '@src/components/Button';
import { ThemeProvider, useTheme } from '@src/providers/ThemeProvider';
import styles from './alertDialog.module.scss';

interface AlertDialogProps {
  busy?: boolean;
  open: boolean;
  onOpenChange(open: boolean): void;
  action: ReactNode;
  description: string;
  hint?: string;
  title: string;
  trigger?: ReactNode;
}

export const AlertDialog = ({
  busy,
  open,
  onOpenChange,
  action,
  description,
  hint,
  title,
  trigger,
}: AlertDialogProps) => {
  const theme = useTheme();

  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixAlertDialog.Trigger asChild>{trigger}</RadixAlertDialog.Trigger>}

      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className={cx(styles.overlay, `theme--${theme.color}`)} />
        <ThemeProvider theme={{ color: 'ink' }}>
          <RadixAlertDialog.Content
            className={cx(styles.root, 'theme--ink')}
            onEscapeKeyDown={evt => {
              if (busy) {
                evt.preventDefault();
              }
            }}>
            <RadixAlertDialog.Title className={styles.title}>{title}</RadixAlertDialog.Title>

            <div className={styles.body}>
              <RadixAlertDialog.Description>{description}</RadixAlertDialog.Description>

              {hint && <p className={styles.hint}>{hint}</p>}

              <div className={styles.actions}>
                <RadixAlertDialog.Cancel asChild disabled={busy}>
                  <Button>Cancel</Button>
                </RadixAlertDialog.Cancel>

                {action}
              </div>
            </div>
          </RadixAlertDialog.Content>
        </ThemeProvider>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
};
