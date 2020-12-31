import { Dimensions } from '@src/types';

export class CanvasUtils {
  /**
   * Scales the object dimensions to be centered and contained within the canvas.
   *
   * @param canvasDimensions the dimensions of the canvas
   * @param objectDimensions the dimensions of the object
   * @param padding optional padding for the object
   */
  static contain(canvasDimensions: Dimensions, objectDimensions: Dimensions, padding = 0) {
    const canvasRatio = canvasDimensions.width / canvasDimensions.height;
    const objectRatio = objectDimensions.width / objectDimensions.height;

    let height: number;
    let width: number;

    if (canvasRatio < objectRatio) {
      // Scale by canvas width
      width = canvasDimensions.width;
      height = objectDimensions.height * (canvasDimensions.width / objectDimensions.width);
    } else {
      // Scale by canvas height
      height = canvasDimensions.height;
      width = objectDimensions.width * (canvasDimensions.height / objectDimensions.height);
    }

    const x = (canvasDimensions.width - width) / 2;
    const y = (canvasDimensions.height - height) / 2;

    return {
      x: x + padding,
      y: y + padding,
      width: width - padding * 2,
      height: height - padding * 2,
    };
  }

  /**
   * Scales the object dimensions to be centered and fully cover the canvas.
   *
   * @param canvasDimensions the dimensions of the canvas
   * @param objectDimensions the dimensions of the object
   */
  static cover(canvasDimensions: Dimensions, objectDimensions: Dimensions) {
    const canvasRatio = canvasDimensions.width / canvasDimensions.height;
    const objectRatio = objectDimensions.width / objectDimensions.height;

    let height: number;
    let width: number;

    if (canvasRatio < objectRatio) {
      // Scale by canvas width
      height = canvasDimensions.height;
      width = objectDimensions.width * (canvasDimensions.height / objectDimensions.height);
    } else {
      // Scale by canvas height
      width = canvasDimensions.width;
      height = objectDimensions.height * (canvasDimensions.width / objectDimensions.width);
    }

    const x = (canvasDimensions.width - width) / 2;
    const y = (canvasDimensions.height - height) / 2;

    return {
      x: x,
      y: y,
      width: width,
      height: height,
    };
  }
}
