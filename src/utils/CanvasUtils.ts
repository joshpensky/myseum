import { Dimensions } from '@src/types';

export class CanvasUtils {
  /**
   * The current device's pixel ratio. This can differ for displays with higher
   * pixel density (e.g., retina displays have a DPR of 2).
   */
  static get devicePixelRatio() {
    return window.devicePixelRatio || 1;
  }

  /**
   * Clears the current canvas.
   *
   * @param context the canvas's 2D context
   */
  static clear(context: CanvasRenderingContext2D) {
    // Reset any transforms
    context.setTransform(1, 0, 0, 1, 0, 0);
    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    // Adjust for the upscaled canvas
    // https://bugs.chromium.org/p/chromium/issues/detail?id=277205#c20
    context.scale(this.devicePixelRatio, this.devicePixelRatio);
    // Disable image smoothing for upscaled photos
    context.imageSmoothingEnabled = false;
  }

  /**
   * Resizes the canvas to the given dimensions.
   *
   * @param canvas the canvas to resize
   * @param dimensions the dimensions to resize the canvas to
   */
  static resize(canvas: HTMLCanvasElement, dimensions: Dimensions) {
    // Set the canvas dimensions, scaled to the correct pixel ratio
    canvas.width = dimensions.width * this.devicePixelRatio;
    canvas.height = dimensions.height * this.devicePixelRatio;
    // Override the actual canvas's DOM dimensions to the given ones
    // https://bugs.chromium.org/p/chromium/issues/detail?id=277205#c20
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
  }

  /**
   * Scales the object dimensions to be centered and contained within the canvas.
   *
   * @param canvasDimensions the dimensions of the canvas
   * @param objectDimensions the dimensions of the object
   * @param padding optional padding for the object
   */
  static objectContain(canvasDimensions: Dimensions, objectDimensions: Dimensions, padding = 0) {
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

  static objectScaleDown(canvasDimensions: Dimensions, objectDimensions: Dimensions) {
    if (
      objectDimensions.width > canvasDimensions.width ||
      objectDimensions.height > canvasDimensions.height
    ) {
      return this.objectContain(canvasDimensions, objectDimensions);
    }

    return {
      x: (canvasDimensions.width - objectDimensions.width) / 2,
      y: (canvasDimensions.height - objectDimensions.height) / 2,
      width: objectDimensions.width,
      height: objectDimensions.height,
    };
  }

  /**
   * Scales the object dimensions to be centered and fully cover the canvas.
   *
   * @param canvasDimensions the dimensions of the canvas
   * @param objectDimensions the dimensions of the object
   */
  static objectCover(canvasDimensions: Dimensions, objectDimensions: Dimensions) {
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
