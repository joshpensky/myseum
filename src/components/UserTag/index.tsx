import Link from 'next/link';
import cx from 'classnames';
import { UserDto } from '@src/data/serializers/user.serializer';
import { useAuth } from '@src/providers/AuthProvider';
import styles from './userTag.module.scss';

interface UserTagProps {
  className?: string;
  user: UserDto;
}

export const UserTag = ({ className, user }: UserTagProps) => {
  const auth = useAuth();

  let href: string;
  if (auth.user?.id === user.id) {
    href = '/me';
  } else {
    href = `/profile/${user.id}`;
  }

  return (
    <Link href={href}>
      <a className={cx(styles.wrapper, className)}>
        <span className={styles.headshot}>
          {user.headshot && <img src={user.headshot} alt="" />}
        </span>

        {user.name}
      </a>
    </Link>
  );
};
