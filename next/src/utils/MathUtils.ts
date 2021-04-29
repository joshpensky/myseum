export class MathUtils {
  /**
   * Scales a percentage value within a range. A value of 0 will match the
   * min range, while 1 will match the max range;
   *
   * Inspired by https://www.d3indepth.com/scales/.
   *
   * @param value a percentage value from 0->1
   * @param range the range to scale the percentage to, ordered min->max
   */
  static scaleLinear(value: number, range: [number, number]) {
    const [minRange, maxRange] = range;
    return minRange + (maxRange - minRange) * value;
  }
}
