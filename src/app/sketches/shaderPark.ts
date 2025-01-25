import p5 from 'p5';

const shaderPark = (p: typeof p5) => {
  let baseRadius = 200; // Base radius
  let r = baseRadius; // Initial radius
  let angleX = 0; // For self-rotation along X-axis
  let angleY = 0; // For self-rotation along Y-axis

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.angleMode(p.DEGREES);
    p.colorMode(p.HSB);

    p.stroke(199, 80, 88);
    p.strokeWeight(3);
    p.noFill();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(230, 50, 15);

    // Update radius based on time
    let time = p.millis() / 1000; 
    r = baseRadius + 500 * p.sin(time * 2); 

    // Self-rotation
    p.rotateX(angleX);
    p.rotateY(angleY);

    // Increment angles to create rotation
    angleX += 0.5; // Adjust speed as needed
    angleY += 0.3; // Adjust speed as needed

    // Custom orbitControl with zoom disabled
    p.orbitControl(4, 4, 0); // Set zoom sensitivity to 0

    // Draw the sphere
    for (let i = 0; i < 180; i += 5) {
      p.beginShape(p.POINTS);
      for (let j = 0; j < 360; j += 5) {
        let x = r * p.cos(i);
        let y = r * p.sin(i) * p.sin(j);
        let z = r * p.sin(i) * p.cos(j);
        p.vertex(x, y, z);
      }
      p.endShape();
    }
  };
};

export default shaderPark;
