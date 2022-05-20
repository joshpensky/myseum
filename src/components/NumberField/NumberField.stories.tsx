import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@src/styles/index.scss';
import { Form, Formik } from 'formik';
import { NumberField as NumberFieldComponent } from '.';

export default {
  title: 'Forms/Number Field',
  component: NumberFieldComponent,
  argTypes: {
    min: {
      defaultValue: 0,
      control: { type: 'number' },
    },
    max: {
      defaultValue: 10,
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
} as ComponentMeta<typeof NumberFieldComponent>;

export const NumberField: ComponentStory<typeof NumberFieldComponent> = args => (
  <Formik initialValues={{ number: 0 }} onSubmit={() => {}}>
    <Form>
      <NumberFieldComponent {...args} name="number" />
    </Form>
  </Formik>
);
