declare module "shader-park-core" {
    export function createShaderPark(
      canvas: HTMLCanvasElement,
      options: { code: string; uniforms?: Record<string, number> }
    ): { dispose: () => void };
  }