import p5 from 'p5';

const exampleSketch = (p: typeof p5) => {
  let lastMouseX = 0;
  let lastMouseY = 0;
  let currentSize = 100;
  let sizeSpeed = 0.1; 
  let maxSize = 500; 
  let minSize = 20;  

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight); 
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;
    p.frameRate(30); 
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight); 
  };

  p.draw = () => {
    // Background with a low opacity to allow blending with previous frames
    p.background(200, 200, 200, 7.5); // The last argument controls the transparency of the background

    // Calculate the mouse speed (distance between current and previous position)
    let mouseSpeed = p.dist(p.mouseX, p.mouseY, lastMouseX, lastMouseY);

    // Map the mouse speed to the size change
    let targetSize = p.map(mouseSpeed, 0, p.width / 2, minSize, maxSize); // Adjust range as needed

    // Smoothly transition the size towards the target size
    currentSize = p.lerp(currentSize, targetSize, sizeSpeed);

    // Update lastMouseX and lastMouseY for the next frame
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;

    // Change the color based on the mouseX position
    let red = p.map(p.mouseX, 0, p.width, 50, 255);
    let green = p.map(p.mouseY, 0, p.height, 100, 150);
    let blue = p.map(p.mouseX, 0, p.width, 0, 50);

    // Set 10% opacity (alpha = 25) for the circle so it blends with the background
    p.fill(red, green, blue, 150); // Increase opacity for more visibility in the blend
    p.noStroke();

    // Draw the circle with the smooth size transition
    p.ellipse(p.mouseX, p.mouseY, currentSize, currentSize);
    p.ellipse(p.mouseX +10, p.mouseY +10, currentSize +10, currentSize +10);
    p.ellipse(p.mouseX -10, p.mouseY -10, currentSize -10, currentSize -10);
    p.ellipse(p.mouseX -5, p.mouseY -5, currentSize -5, currentSize -5);
    p.ellipse(p.mouseX +5, p.mouseY +5, currentSize +5, currentSize +5);
    p.ellipse(p.mouseX -2.5, p.mouseY -2.5, currentSize -2.5, currentSize -2.5);
    p.ellipse(p.mouseX +2.5, p.mouseY +2.5, currentSize +2.5, currentSize +2.5);
  };
};

export default exampleSketch;
