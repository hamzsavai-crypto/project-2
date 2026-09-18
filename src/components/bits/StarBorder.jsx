/*
 * Vendored from React Bits - https://reactbits.dev
 * Upstream: DavidHDev/react-bits @ 5fc9addb5b2362043332ad6d403bb436f2596318
 * Path:     source/react-bits/src/content/Animations/StarBorder/StarBorder.jsx
 * Licence:  MIT + Commons Clause v1.0 (David Haz). Use inside this product is
 *           permitted; redistributing the component as-is is not. See docs/ATTRIBUTION.md.
 * Note:     copied unmodified
 */
import './StarBorder.css';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  backgroundColor = '#000000',
  textColor = '#ffffff',
  borderColor = '#222222',
  children,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...rest.style
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      ></div>
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      ></div>
      <div className="inner-content" style={{ background: backgroundColor, color: textColor, borderColor }}>
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
