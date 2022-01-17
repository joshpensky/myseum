import { Dimensions, Position } from '@src/types';

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
    const paddedCanvasDimensions = {
      width: canvasDimensions.width - padding * 2,
      height: canvasDimensions.height - padding * 2,
    };

    const canvasRatio = paddedCanvasDimensions.width / paddedCanvasDimensions.height;
    const objectRatio = objectDimensions.width / objectDimensions.height;

    let height: number;
    let width: number;

    if (canvasRatio < objectRatio) {
      // Scale by canvas width
      width = paddedCanvasDimensions.width;
      height = paddedCanvasDimensions.width / objectRatio;
    } else {
      // Scale by canvas height
      height = paddedCanvasDimensions.height;
      width = paddedCanvasDimensions.height * objectRatio;
    }

    return {
      x: (canvasDimensions.width - width) / 2,
      y: (canvasDimensions.height - height) / 2,
      width,
      height,
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

  /**
   * Gets the average color of the chosen section of a given context's canvas.
   *
   * @param context the context of a canvas to search
   * @param position the starting position of the search box
   * @param dimensions the dimensions of the box to search
   */
  static getAverageColor(
    context: CanvasRenderingContext2D,
    position: Position,
    dimensions: Dimensions,
  ) {
    const rgb = { r: 0, g: 0, b: 0 };

    let colorData: ImageData;
    try {
      colorData = context.getImageData(position.x, position.y, dimensions.width, dimensions.height);
    } catch {
      return rgb;
    }

    const blockSize = 5; // only visit every 5 pixels
    let count = 0;

    const length = colorData.data.length;
    let i = -4;
    while ((i += blockSize * 4) < length) {
      ++count;
      rgb.r += colorData.data[i];
      rgb.g += colorData.data[i + 1];
      rgb.b += colorData.data[i + 2];
    }

    rgb.r = Math.floor(rgb.r / count);
    rgb.g = Math.floor(rgb.g / count);
    rgb.b = Math.floor(rgb.b / count);

    return rgb;
  }

  /**
   * Generates the line commands for an SVG `path.d` attribute, or a Path2D object.
   *
   * @example
   * ```
   * getLineCommands([{ x: 0, y: 0 }, { x: 2, y: 4 }, { x: 4, y: 5 }])
   * // "M 0 0 L 2 4 L 4 5 Z"
   * ```
   *
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands
   *
   * @param points the points to include in the line commands
   * @param closePath whether to close the path, drawing a line back up to the first point
   */
  static getLineCommands(points: Position[], closePath = true): string {
    if (!points.length) {
      return '';
    }

    const coordinates = points.map(point => [point.x, point.y].join(' '));
    const lineCommands = ['M', coordinates.join(' L ')];
    if (closePath) {
      lineCommands.push('Z');
    }
    return lineCommands.join(' ');
  }
}
