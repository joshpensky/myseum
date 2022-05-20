import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@src/styles/index.scss';
import { Form, Formik } from 'formik';
import { TextArea as TextAreaComponent } from '.';

export default {
  title: 'Forms/Text Area',
  component: TextAreaComponent,
  argTypes: {
    rows: {
      defaultValue: 2,
      control: { type: 'number' },
    },
    readOnly: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    disabled: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
  },
} as ComponentMeta<typeof TextAreaComponent>;

export const TextArea: ComponentStory<typeof TextAreaComponent> = args => (
  <Formik
    initialValues={{
      string: 'Non non minim quis sit ex voluptate minim excepteur.',
    }}
    onSubmit={() => {}}>
    <Form>
      <TextAreaComponent {...args} name="string" />
    </Form>
  </Formik>
);
