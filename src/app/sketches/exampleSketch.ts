import p5 from 'p5';

const exampleSketch = (p: typeof p5) => {
  let lastMouseX = 0;
  let lastMouseY = 0;
  let currentSize = 50; // Initial size of the circle
  let sizeSpeed = 0.1; // Speed of size change (default)
  let maxSize = 200; // Maximum size of the circle
  let minSize = 20;  // Minimum size of the circle

  p.setup = () => {
    p.createCanvas(1600, 800); // Larger canvas for bigger circle
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;
    p.frameRate(30); // Set frame rate for smoother blending
  };

  p.draw = () => {
    // Background with a low opacity to allow blending with previous frames
    p.background(200, 200, 200, 10); // The last argument controls the transparency of the background

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
    let red = p.map(p.mouseX, 0, p.width, 0, 255);
    let green = p.map(p.mouseY, 0, p.height, 255, 0);
    let blue = p.map(p.mouseX, 0, p.width, 0, 255);

    // Set 10% opacity (alpha = 25) for the circle so it blends with the background
    p.fill(red, green, blue, 100); // Increase opacity for more visibility in the blend
    p.noStroke();

    // Draw the circle with the smooth size transition
    p.ellipse(p.mouseX, p.mouseY, currentSize, currentSize);
  };
};

export default exampleSketch;
