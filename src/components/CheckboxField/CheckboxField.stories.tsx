import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@src/styles/index.scss';
import { Form, Formik } from 'formik';
import { CheckboxField as CheckboxFieldComponent } from '.';

export default {
  title: 'Forms/Checkbox Field',
  component: CheckboxFieldComponent,
  argTypes: {
    disabled: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    label: {
      defaultValue: 'Toggle volume',
      control: 'text',
    },
  },
} as ComponentMeta<typeof CheckboxFieldComponent>;

export const CheckboxField: ComponentStory<typeof CheckboxFieldComponent> = args => (
  <Formik
    initialValues={{
      checked: false,
    }}
    onSubmit={() => {}}>
    <Form>
      <CheckboxFieldComponent label={args.label} disabled={args.disabled} name="checked" />
    </Form>
  </Formik>
);
