import { MeasureUnit } from '@prisma/client';
import { Measurement } from '@src/types';

const PX_TO_IN = 1 / 72;
const CM_TO_IN = 1 / 2.54;

export const convertUnit = (value: number, from: MeasureUnit | 'px', to: MeasureUnit | 'px') => {
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

type ConvertMeasurement = Measurement | 'px';

export class Convert {
  private _value: number;
  private from: ConvertMeasurement;

  private constructor(value: number, measurement: ConvertMeasurement) {
    this._value = value;
    this.from = measurement;
  }

  public get value() {
    return this._value;
  }

  static from(convert: Convert): Convert;
  static from(value: number, measurement: ConvertMeasurement): Convert;
  static from(convertOrValue: Convert | number, measurement?: ConvertMeasurement): Convert {
    if (convertOrValue instanceof Convert) {
      return new Convert(convertOrValue._value, convertOrValue.from);
    } else if (measurement) {
      return new Convert(convertOrValue, measurement);
    }
    throw new Error('Measurement is required!');
  }

  public to(to: ConvertMeasurement): Convert {
    if (this.from === to) {
      return this;
    }

    const ppi = 72;

    switch (to) {
      case 'px': {
        this._value = Convert.from(this).to('inch').value * ppi;
        break;
      }

      case 'inch': {
        if (this.from === 'cm' || this.from === 'mm') {
          this._value = Convert.from(this).to('cm').value / 2.54;
        } else if (this.from === 'px') {
          this._value *= ppi;
        }
        break;
      }

      case 'cm': {
        if (this.from === 'inch') {
          this._value /= 2.54;
        } else if (this.from === 'px') {
          this._value = Convert.from(this).to('inch').to('cm').value;
        } else if (this.from === 'mm') {
          this._value /= 10;
        }
        break;
      }

      case 'mm': {
        // TODO:
      }
    }

    this.from = to;
    return this;
  }
}
