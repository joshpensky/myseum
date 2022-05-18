import { useEffect, useState } from 'react';
import { ComponentMeta } from '@storybook/react';
import api from '@src/api';
import Button from '@src/components/Button';
import '@src/styles/index.scss';
import { UserTag } from '@src/components/UserTag';
import { UserDto } from '@src/data/serializers/user.serializer';

export default {
  title: 'User Tag',
  component: UserTag,
} as ComponentMeta<typeof Button>;

export const Default = () => {
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    (async () => {
      const user = await api.user.findOneById('abc-123');
      setUser(user);
    })();
  }, []);

  if (!user) {
    return null;
  }

  return <UserTag user={user} />;
};
