"use client";
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleDirection: 1 | -1;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastShootingStarTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Add a throttle for resize events
    const throttleResize = () => {
      let resizeTimeout: NodeJS.Timeout;
      return () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 200);
      };
    };

    // Replace direct resize listener with throttled version
    const throttledResize = throttleResize();
    window.addEventListener("resize", throttledResize);
    resizeCanvas();

    // Create static stars
    const starCount = Math.min(
      300,
      Math.floor((window.innerWidth * window.innerHeight) / 6000)
    );
    starsRef.current = Array.from({ length: starCount }, () => {
      // Add some color variation to stars
      const colorVariation = Math.random();
      let color = "rgb(255, 255, 255)"; // Default white

      if (colorVariation > 0.95) {
        color = "rgb(255, 220, 180)"; // Warm/yellow star
      } else if (colorVariation > 0.9) {
        color = "rgb(180, 220, 255)"; // Blue star
      }

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.01 + 0.002,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        color,
      };
    });

    // Prepare shooting stars array
    shootingStarsRef.current = Array.from({ length: 10 }, () => ({
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      opacity: 0,
      active: false,
    }));

    // Create a shooting star
    const createShootingStar = () => {
      // Find an inactive shooting star
      const inactiveStar = shootingStarsRef.current.find(
        (star) => !star.active
      );
      if (!inactiveStar) return;

      // Set properties for the shooting star
      inactiveStar.x = Math.random() * canvas.width;
      inactiveStar.y = Math.random() * (canvas.height / 3); // Start in top third
      inactiveStar.length = Math.random() * 80 + 40;
      inactiveStar.speed = Math.random() * 5 + 5;
      inactiveStar.angle = Math.PI / 4 + (Math.random() * Math.PI) / 4; // Diagonal downward
      inactiveStar.opacity = 1;
      inactiveStar.active = true;
    };

    // Draw shooting stars
    const drawShootingStar = (star: ShootingStar) => {
      if (!star.active) return;

      const tailX = star.x - Math.cos(star.angle) * star.length;
      const tailY = star.y - Math.sin(star.angle) * star.length;

      // Create gradient for the shooting star
      const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add a small glow at the head
      ctx.beginPath();
      ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();

      // Move the shooting star
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;

      // Fade out slightly
      star.opacity -= 0.01;

      // Deactivate if off screen or faded out
      if (
        star.x > canvas.width ||
        star.y > canvas.height ||
        star.opacity <= 0
      ) {
        star.active = false;
      }
    };

    // Animation function
    const animate = (timestamp: number) => {
      // Clear canvas completely for static background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw static stars
      starsRef.current.forEach((star) => {
        // Make stars twinkle
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity >= 1) {
          star.opacity = 1;
          star.twinkleDirection = -1;
        } else if (star.opacity <= 0.3) {
          star.opacity = 0.3;
          star.twinkleDirection = 1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color
          .replace("rgb", "rgba")
          .replace(")", `, ${star.opacity})`);
        ctx.fill();
      });

      // Occasionally create new shooting star (every 1-3 seconds)
      if (
        timestamp - lastShootingStarTime.current >
        Math.random() * 5000 + 2000
      ) {
        createShootingStar();
        lastShootingStarTime.current = timestamp;
      }

      // Draw and update shooting stars
      shootingStarsRef.current.forEach(drawShootingStar);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", throttledResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bg-black top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default StarryBackground;
