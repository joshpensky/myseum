import { Fragment } from 'react';
import Link from 'next/link';
import * as Tabs from '@radix-ui/react-tabs';
import { Form, Formik } from 'formik';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { TextField } from '@src/components/TextField';
import { UserDto } from '@src/data/serializers/user.serializer';
import { SettingsModal } from '@src/features/profile/SettingsModal';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { LockIcon } from '@src/svgs/LockIcon';
import { PlusIcon } from '@src/svgs/PlusIcon';
import { ShareIcon } from '@src/svgs/ShareIcon';
import { shareUrl } from '@src/utils/shareUrl';
import styles from './userView.module.scss';

export interface UserViewProps {
  user: UserDto;
}

export const UserView = ({ user }: UserViewProps) => {
  const auth = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headshot}></div>

        <h1 className={styles.name}>{user.name}</h1>

        {user.bio && <p className={styles.bio}>{user.bio}</p>}

        <dl className={styles.info}>
          {auth.user?.id === user.id && (
            <Fragment>
              <dt>Email</dt>
              <dd>
                {auth.user.email}
                <span className="sr-only">&nbsp;(Your email is hidden from other users.)</span>
                <span className={styles.lock} aria-hidden="true">
                  <LockIcon />
                  <span className={styles.lockMessage}>Your email is hidden from other users.</span>
                </span>
              </dd>
            </Fragment>
          )}

          <dt>Myseum</dt>
          <dd>
            <Link href={auth.user?.id === user.id ? '/me' : `/museum/${user.museumId}`}>
              <a>Visit</a>
            </Link>
          </dd>
        </dl>

        <div className={styles.actions}>
          {auth.user?.id === user.id && (
            <SettingsModal
              user={auth.user}
              onSave={data => {
                auth.updateUserData(data);
              }}
              trigger={
                <Button className={styles.actionsItem} icon={EditIcon}>
                  Edit
                </Button>
              }
            />
          )}
          <Button
            className={styles.actionsItem}
            icon={ShareIcon}
            onClick={() => shareUrl(`/profile/${user.id}`)}>
            Share
          </Button>
        </div>
      </header>

      <div className={styles.main}>
        <Tabs.Root className={styles.tabs} defaultValue="artworks">
          <Tabs.List aria-label={`${user.name}'s Collection`}>
            <Tabs.Trigger value="artworks" className={styles.tabTrigger}>
              Artworks
            </Tabs.Trigger>
            <Tabs.Trigger value="frames" className={styles.tabTrigger}>
              Frames
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="artworks" className={styles.tabContent}>
            <h2 className="sr-only">Artworks</h2>
            <Formik initialValues={{ search: '' }} onSubmit={() => {}}>
              <Form className={styles.searchForm}>
                <FieldWrapper
                  id="search-artworks"
                  name="search"
                  label="Search artworks"
                  className={styles.searchBar}
                  labelClassName="sr-only">
                  {field => <TextField {...field} type="search" placeholder="Search artworks" />}
                </FieldWrapper>

                <Button type="button" icon={PlusIcon}>
                  Create
                </Button>
              </Form>
            </Formik>
          </Tabs.Content>

          <Tabs.Content value="frames" className={styles.tabContent}>
            <h2 className="sr-only">Frames</h2>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};
