import Head from 'next/head';
import Button from '@src/components/Button';
import { NotFoundIllustration } from '@src/svgs/NotFoundIllustration';
import styles from './_styles/404.module.scss';

const NotFound = () => (
  <div className={styles.page}>
    <Head>
      <title>Page Not Found</title>
    </Head>

    <div className={styles.illo}>
      <NotFoundIllustration />
    </div>

    <h1 className={styles.title}>Page Not Found</h1>
    <p className={styles.desc}>We couldn't find that page.</p>

    <Button type="link" href="/">
      Go home
    </Button>
  </div>
);

export default NotFound;
