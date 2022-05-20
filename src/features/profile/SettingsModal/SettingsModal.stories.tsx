import { Fragment } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from '@src/components/Button';
import { SettingsModal } from '@src/features/profile/SettingsModal';
import { AuthProvider, useAuth } from '@src/providers/AuthProvider';
import Cog from '@src/svgs/Cog';
import '@src/styles/index.scss';

export default {
  title: 'Modals/Settings',
  component: SettingsModal,
} as ComponentMeta<typeof SettingsModal>;

export const Settings: ComponentStory<typeof SettingsModal> = () => {
  function InnerSettingsModal() {
    const auth = useAuth();

    if (!auth.user) {
      return <Fragment />;
    }

    return (
      <SettingsModal
        user={auth.user}
        trigger={<Button icon={Cog}>Settings</Button>}
        onSave={() => {}}
      />
    );
  }

  return (
    <AuthProvider>
      <InnerSettingsModal />
    </AuthProvider>
  );
};
