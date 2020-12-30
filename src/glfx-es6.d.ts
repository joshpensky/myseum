// https://evanw.github.io/glfx.js/docs/

declare module 'glfx-es6' {
  class Texture {
    loadContentsOf(element: CanvasImageSource): void;
    destroy(): void;
  }

  // ax ay bx by cx cy dx dy
  export type Matrix = [number, number, number, number, number, number, number, number];

  export type Canvas = HTMLCanvasElement & {
    draw(texture: Texture, width?: number, height?: number): GlfxCanvas;
    perspective(before: Matrix, after: Matrix): GlfxCanvas;
    texture(element: CanvasImageSource): Texture;
    update(): GlfxCanvas;
  };

  export const canvas: () => Canvas;
}
