import Link from 'next/link';
import { UserDto } from '@src/data/serializers/user.serializer';
import { useAuth } from '@src/providers/AuthProvider';
import styles from './userTag.module.scss';

interface UserTagProps {
  user: UserDto;
}

export const UserTag = ({ user }: UserTagProps) => {
  const auth = useAuth();

  let href: string;
  if (auth.user?.id === user.id) {
    href = '/me';
  } else {
    href = `/profile/${user.id}`;
  }

  return (
    <Link href={href}>
      <a>
        <span className={styles.headshot}>
          {user.headshot && <img src={user.headshot} alt="" />}
        </span>

        {user.name}
      </a>
    </Link>
  );
};
