import { Fragment, useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import api from '@src/api';
import '@src/styles/index.scss';
import { UserTag as UserTagComponent } from '@src/components/UserTag';
import { UserDto } from '@src/data/serializers/user.serializer';

export default {
  title: 'User Tag',
  component: UserTagComponent,
} as ComponentMeta<typeof UserTagComponent>;

export const UserTag: ComponentStory<typeof UserTagComponent> = () => {
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    (async () => {
      const user = await api.user.findOneById('abc-123');
      setUser(user);
    })();
  }, []);

  if (!user) {
    return <Fragment />;
  }

  return <UserTagComponent user={user} />;
};
