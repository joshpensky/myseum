import { GetServerSideProps } from 'next';
import Link from 'next/link';
import dayjs from 'dayjs';
import useSWR from 'swr';
import api from '@src/api';
import serverApi from '@src/api/server';
import { UserTag } from '@src/components/UserTag';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import styles from '@src/pages/_styles/admin/index.module.scss';

const Admin = () => {
  const museums = useSWR<MuseumDto[]>('/api/admin/museums', {
    revalidateOnFocus: false,
    fetcher() {
      return api.admin.findAllMuseums();
    },
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin</h1>

      <h2 className={styles.subtitle}>Museums</h2>
      <p>A list of all museums in the application.</p>

      <ul className={styles.museumList}>
        {museums.data?.map(museum => (
          <li key={museum.id} className={styles.museum}>
            <Link href={`/museum/${museum.id}`}>
              <a className={styles.museumName}>{museum.name}</a>
            </Link>

            <p className={styles.museumDesc}>{museum.description}</p>

            <p className={styles.created}>Created {dayjs(museum.addedAt).format('MMM D, YYYY')}</p>
            <p className={styles.lastModified}>
              Last modified {dayjs(museum.modifiedAt).format('MMM D, YYYY h:mma')}
            </p>

            <UserTag user={museum.curator} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await serverApi.auth.findUserByCookie(ctx);
  if (!user || !user.isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
