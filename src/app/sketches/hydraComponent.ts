import p5 from 'p5';
import HydraSynth from 'hydra-synth';

const Hydra = (p: typeof p5) => {
  let hydra: HydraSynth;

  p.setup = () => {
    // Create canvas using p5
    const canvas = p.createCanvas(window.innerWidth, window.innerHeight, p.P2D);
    
    // Log canvas to check if it's being created correctly
    console.log("Canvas initialized:", canvas);


  p.draw = () => {
    // Your p5 code for drawing
    for (let i = 0; i < 100; i++) {
      p.fill(i * 10, i % 30, 255);
      p.rect(i * 20, 200, 10, 200);
    }
  };

};

}

export default Hydra;
