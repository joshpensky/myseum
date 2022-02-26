import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as Tabs from '@radix-ui/react-tabs';
import * as z from 'zod';
import Button from '@src/components/Button';
import { SEO } from '@src/components/SEO';
import { UserDto } from '@src/data/serializers/user.serializer';
import { SettingsModal } from '@src/features/profile/SettingsModal';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { LockIcon } from '@src/svgs/LockIcon';
import { ShareIcon } from '@src/svgs/ShareIcon';
import { getImageUrl } from '@src/utils/getImageUrl';
import { shareUrl } from '@src/utils/shareUrl';
import { SearchArtworks } from './SearchArtworks';
import { SearchFrames } from './SearchFrames';
import styles from './userView.module.scss';

export interface UserViewProps {
  user: UserDto;
}

export const UserView = ({ user }: UserViewProps) => {
  const auth = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState(() => {
    const parsedTab = z.enum(['artworks', 'frames']).safeParse(router.query.tab);
    if (parsedTab.success) {
      return parsedTab.data;
    } else {
      return 'artworks';
    }
  });

  // Persists the current tab in query param
  useEffect(() => {
    const query = { ...router.query };

    if (tab !== 'artworks') {
      query.tab = tab;
    } else {
      delete query.tab;
    }

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [tab]);

  return (
    <div className={styles.page}>
      <SEO title={router.pathname === '/me' ? 'Profile' : user.name} />

      <header className={styles.header}>
        <div className={styles.headshot}>
          {user.headshot && (
            <Image src={getImageUrl('headshots', user.headshot)} alt="" layout="fill" />
          )}
        </div>

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
            <Link href={auth.user?.id === user.id ? '/' : `/museum/${user.museumId}`}>
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
        <Tabs.Root className={styles.tabs} value={tab} onValueChange={setTab}>
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
            <SearchArtworks user={user} />
          </Tabs.Content>

          <Tabs.Content value="frames" className={styles.tabContent}>
            <h2 className="sr-only">Frames</h2>
            <SearchFrames user={user} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};
