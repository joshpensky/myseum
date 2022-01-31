import { MeasureUnit } from '@prisma/client';

const PX_TO_IN = 1 / 72;
const CM_TO_IN = 1 / 2.54;

export const convertUnit = (value: number, from: MeasureUnit, to: MeasureUnit) => {
  let inches: number;
  switch (from) {
    case 'in': {
      inches = value;
      break;
    }
    case 'px': {
      inches = value * PX_TO_IN;
      break;
    }
    case 'cm': {
      inches = value * CM_TO_IN;
      break;
    }
    case 'mm': {
      inches = (value / 10) * CM_TO_IN;
      break;
    }
    default: {
      throw new Error('invalid to unit');
    }
  }

  switch (to) {
    case 'in': {
      return inches;
    }
    case 'px': {
      return inches / PX_TO_IN;
    }
    case 'cm': {
      return inches / CM_TO_IN;
    }
    case 'mm': {
      return (inches / CM_TO_IN) * 10;
    }
    default: {
      throw new Error('invalid from unit');
    }
  }
};
