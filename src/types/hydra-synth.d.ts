declare module 'hydra-synth' {
    export default class HydraSynth {
      constructor(options?: {
        detectAudio?: boolean;
        canvas?: HTMLCanvasElement;
      });
      s0: {
        init: (options: { src: HTMLCanvasElement }) => void;
      };
      src: (source: any) => any;
      out: () => void;
      repeat: () => any;
    }
  }
  