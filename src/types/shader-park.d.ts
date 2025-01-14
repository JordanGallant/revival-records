declare module 'shader-park-core' {
    export function createShaderCanvas(
      canvas: HTMLCanvasElement,
      shaderFunc: (sp: any) => void
    ): void;
  }