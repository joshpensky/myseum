import { Fragment, useState } from 'react';
import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import Fuse from 'fuse.js';
import useSWR from 'swr';
import api from '@src/api';
import { AlertDialog } from '@src/components/AlertDialog';
import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
import { Loader } from '@src/components/Loader';
import { SearchBar } from '@src/components/SearchBar';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';
import { CreateFrameModal } from '@src/features/frame/CreateFrameModal';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { ExpandIcon } from '@src/svgs/ExpandIcon';
import { FrameIllustration } from '@src/svgs/FrameIllustration';
import { PlusIcon } from '@src/svgs/PlusIcon';
import { TrashIcon } from '@src/svgs/TrashIcon';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './searchFrames.module.scss';

interface FrameRowProps {
  frame: FrameDto;
  onDelete(): void;
}

const FrameRow = ({ frame, onDelete }: FrameRowProps) => {
  const [hasDeleteIntent, setHasDeleteIntent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const auth = useAuth();
  const isOwner = auth.user?.id === frame.owner.id;

  return (
    <div className={styles.row}>
      <img
        className={styles.rowImage}
        src={getImageUrl('frames', frame.src)}
        alt={frame.alt ?? ''}
      />

      <div className={styles.rowMeta}>
        <p>{frame.name}</p>
        <p className={styles.rowMetaDesc}>Added in {dayjs(frame.addedAt).year()}</p>
      </div>

      <div className={styles.rowActions}>
        {/* TODO: fullscreen modal */}
        <IconButton title="Expand">
          <ExpandIcon />
        </IconButton>

        {isOwner && (
          <Fragment>
            {/* TODO: edit frame modal */}
            <IconButton title="Edit">
              <EditIcon />
            </IconButton>

            <AlertDialog
              open={hasDeleteIntent}
              onOpenChange={setHasDeleteIntent}
              title="Delete Frame"
              description={`Are you sure you want to delete the frame "${frame.name}"?`}
              hint="This action cannot be undone."
              action={
                <Button
                  danger
                  filled
                  busy={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await api.frame.delete(frame.id);
                      onDelete();
                    } catch {
                      // TODO: toast error
                      setHasDeleteIntent(false);
                      setIsDeleting(false);
                    }
                  }}>
                  Delete
                </Button>
              }
              trigger={
                <IconButton title="Delete">
                  <TrashIcon />
                </IconButton>
              }
            />
          </Fragment>
        )}
      </div>
    </div>
  );
};

interface SearchFramesProps {
  user: UserDto;
}

export const SearchFrames = ({ user }: SearchFramesProps) => {
  const auth = useAuth();
  const isCurrentUser = auth.user?.id === user.id;

  const frames = useSWR<FrameDto[]>(`/api/user/${user.id}/frames`, {
    revalidateOnFocus: false,
    async fetcher() {
      return await api.frame.findAllByUser(user);
    },
  });
  const data = frames.data ?? [];

  return (
    <Formik
      initialValues={{ search: '' }}
      onSubmit={(values, helpers) => {
        helpers.setSubmitting(false);
      }}>
      {formik => {
        const { values } = formik;

        const fuse = new Fuse(data, {
          keys: ['name', 'alt'],
        });

        let results: { item: FrameDto }[];
        if (values.search) {
          results = fuse.search(values.search);
        } else {
          results = data.map(item => ({ item }));
        }

        return (
          <div className={styles.root}>
            <Form className={styles.form} noValidate>
              <SearchBar name="search" label="Search frames" />
              {isCurrentUser && (
                <CreateFrameModal
                  onComplete={() => {
                    frames.revalidate();
                  }}
                  trigger={
                    <Button className={styles.formAction} type="button" icon={PlusIcon}>
                      Create
                    </Button>
                  }
                />
              )}
            </Form>

            <p className={styles.count}>
              {results.length} item{results.length === 1 ? '' : 's'} {values.search && 'found'}
            </p>

            {frames.isValidating ? (
              <div className={styles.loading}>
                <Loader size="large" />
              </div>
            ) : !results.length ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIllo}>
                  <FrameIllustration />
                </div>
                <p className={styles.emptyStateText}>
                  {values.search
                    ? `No frames found for term "${values.search}."`
                    : `${isCurrentUser ? 'You have' : 'there are'} no frames.`}
                </p>
                {isCurrentUser && (
                  <CreateFrameModal
                    onComplete={() => {
                      frames.revalidate();
                    }}
                    trigger={<Button className={styles.emptyStateAction}>Create frame</Button>}
                  />
                )}
              </div>
            ) : (
              <ul>
                {results.map(result => (
                  <li key={result.item.id} className={styles.rowWrapper}>
                    <FrameRow
                      frame={result.item}
                      onDelete={() => {
                        frames.revalidate();
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }}
    </Formik>
  );
};
