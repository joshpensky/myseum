import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@src/styles/index.scss';
import { Form, Formik } from 'formik';
import { SearchBar as SearchBarComponent } from '.';

export default {
  title: 'Forms/Search Bar',
  component: SearchBarComponent,
  argTypes: {
    label: {
      defaultValue: 'Search',
      control: 'text',
    },
  },
} as ComponentMeta<typeof SearchBarComponent>;

export const SearchBar: ComponentStory<typeof SearchBarComponent> = args => (
  <Formik
    initialValues={{
      string: '',
    }}
    onSubmit={() => {}}>
    <Form>
      <SearchBarComponent {...args} name="string" />
    </Form>
  </Formik>
);
