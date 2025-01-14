import p5 from 'p5';

// Use `typeof p5` to reference the type of p5.js instance
const exampleSketch = (p: typeof p5) => {
  let x = 0;

  p.setup = () => {
    p.createCanvas(1600, 800);
  };

  p.draw = () => {
    p.background(200);
    p.fill(255, 0, 0);
    p.ellipse(x, p.height / 2, 50, 50);
    x = (x + 2) % p.width;
  };
};

export default exampleSketch;
