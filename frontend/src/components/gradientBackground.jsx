import React, { useEffect } from 'react';
import { Gradient } from '../pages/Gradient';

const GradientBackground = () => {
  useEffect(() => {
    const gradient = new Gradient();
    gradient.initGradient('#gradient-canvas');
  }, []);

  return (
    <canvas
      id="gradient-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        "--gradient-color-1": "#ff3c6a",
        "--gradient-color-2": "#00f0ff",
      }}
    />
  );
};

export default GradientBackground;
