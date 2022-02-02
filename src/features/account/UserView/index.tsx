import { useRouter } from 'next/router';
import * as Tabs from '@radix-ui/react-tabs';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { FieldWrapper } from '@src/components/FieldWrapper';
import { TextField } from '@src/components/TextField__New';
import { UserDto } from '@src/data/serializers/user.serializer';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { PlusIcon } from '@src/svgs/PlusIcon';
import { ShareIcon } from '@src/svgs/ShareIcon';
import styles from './userView.module.scss';

export interface UserViewProps {
  user: UserDto;
}

export const UserView = ({ user }: UserViewProps) => {
  const auth = useAuth();
  const router = useRouter();

  const shareLink = async () => {
    const url = `${window.location.origin}${router.pathname}`;

    if ('share' in navigator) {
      await navigator.share({ url });
    } else if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
      toast.success('Copied link!');
    } else {
      document.execCommand('copy', false, url);
      toast.success('Copied link!');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headshot}></div>

        <h1 className={styles.name}>{user.name}</h1>

        <p>{user.bio}</p>

        {auth.user?.id === user.id && (
          <dl className={styles.info}>
            <dt>Email</dt>
            <dd>{auth.user.email}</dd>
          </dl>
        )}

        <div className={styles.actions}>
          {auth.user?.id === user.id && (
            <Button className={styles.actionsItem} icon={EditIcon}>
              Edit
            </Button>
          )}
          <Button className={styles.actionsItem} icon={ShareIcon} onClick={() => shareLink()}>
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
