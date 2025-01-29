import React, { useEffect } from "react";
import { gsap } from "gsap";
import Observer from "gsap/Observer";

const Star: React.FC = () => {
  useEffect(() => {
   
    gsap.registerPlugin(Observer);

    const lines = document.querySelectorAll<SVGPolylineElement>("polyline");
    const width = 100;
    const freq = 20;
    const damp = 60;
    let drift = 0;
    let points: number[] = [];

    function setPoints(amp = 0): string {
      let x: number;
      let y: number;
      let step = 0;

      points = [];

      for (x = 0; x <= width; x++) {
        x < width / 2 ? step++ : step--;
        y = (step / damp) * amp * Math.sin(((x + drift) / damp) * freq);

        points.push(x, y);
      }

      return points.join(" ");
    }

    function updatePolylinePoints(): void {
      lines.forEach((line) => {
        line.setAttribute("points", points.join(" "));
      });
    }

    Observer.create({
      type: "wheel,touch,scroll,pointer",
      onChangeY({ velocityY }: { velocityY: number }): void {
        drift += velocityY * 0.0002;
        setPoints(velocityY * 0.0005);
        updatePolylinePoints();
      }
    });
  }, []);

  return (
    <svg className="w-2/3 h-1/3 mx-auto my-auto block" viewBox="0 0 100 100">
      {Array.from({ length: 12 }).map((_, i) => (
        <polyline
          key={i}
          points="50,10 50,90"
          className="stroke-white stroke-[0.75px] rounded-lg"
          transform={`rotate(${i * 30}, 50, 50)`}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

export default Star;
