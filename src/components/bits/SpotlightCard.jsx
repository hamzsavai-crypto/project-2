/*
 * Vendored from React Bits - https://reactbits.dev
 * Upstream: DavidHDev/react-bits @ 5fc9addb5b2362043332ad6d403bb436f2596318
 * Path:     source/react-bits/src/content/Components/SpotlightCard/SpotlightCard.jsx
 * Licence:  MIT + Commons Clause v1.0 (David Haz). Use inside this product is
 *           permitted; redistributing the component as-is is not. See docs/ATTRIBUTION.md.
 * Note:     copied unmodified
 */
import { useRef } from 'react';
import './SpotlightCard.css';

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
};

export default SpotlightCard;
