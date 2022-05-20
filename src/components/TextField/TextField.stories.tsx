import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@src/styles/index.scss';
import { Form, Formik } from 'formik';
import { TextField as TextFieldComponent } from '.';

export default {
  title: 'Forms/Text Field',
  component: TextFieldComponent,
  argTypes: {
    readOnly: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    disabled: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    type: {
      defaultValue: 'text',
      control: 'inline-radio',
      options: ['text', 'search', 'date', 'email'],
    },
  },
} as ComponentMeta<typeof TextFieldComponent>;

export const TextField: ComponentStory<typeof TextFieldComponent> = args => (
  <Formik
    initialValues={{
      string: 'Lorem ipsum',
    }}
    onSubmit={() => {}}>
    <Form>
      <TextFieldComponent {...args} name="string" />
    </Form>
  </Formik>
);
