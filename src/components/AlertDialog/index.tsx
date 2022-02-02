import { ReactNode } from 'react';
import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';
import cx from 'classnames';
import Button from '@src/components/Button';
import styles from './alertDialog.module.scss';

interface AlertDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  action: ReactNode;
  description: string;
  hint?: string;
  title: string;
  trigger?: ReactNode;
}

export const AlertDialog = ({
  open,
  onOpenChange,
  action,
  description,
  hint,
  title,
  trigger,
}: AlertDialogProps) => (
  <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <RadixAlertDialog.Trigger>{trigger}</RadixAlertDialog.Trigger>}

    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay className={styles.overlay} />
      <RadixAlertDialog.Content className={cx(styles.root, 'theme--ink')}>
        <RadixAlertDialog.Title className={styles.title}>{title}</RadixAlertDialog.Title>

        <div className={styles.body}>
          <RadixAlertDialog.Description>{description}</RadixAlertDialog.Description>

          {hint && <p className={styles.hint}>{hint}</p>}

          <div className={styles.actions}>
            <RadixAlertDialog.Cancel asChild>
              <Button>Cancel</Button>
            </RadixAlertDialog.Cancel>

            <RadixAlertDialog.Action asChild>{action}</RadixAlertDialog.Action>
          </div>
        </div>
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  </RadixAlertDialog.Root>
);
