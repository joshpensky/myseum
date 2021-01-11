import { Dimensions } from '@src/types';

export class CommonUtils {
  static getImageDimensions(image: HTMLImageElement): Dimensions {
    if (!image.complete) {
      return { width: 0, height: 0 };
    }
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }
}
