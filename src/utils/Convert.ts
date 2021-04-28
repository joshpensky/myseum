import { Measurement } from '@src/types';

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
