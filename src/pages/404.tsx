import Button from '@src/components/Button';
import { SEO } from '@src/components/SEO';
import { NotFoundIllustration } from '@src/svgs/NotFoundIllustration';
import styles from './_styles/404.module.scss';

const NotFound = () => (
  <div className={styles.page}>
    <SEO title="Page Not Found" />

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
