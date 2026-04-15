import { useMemo } from "react";

export function FlowConnector({ active = false, color = "#a855f7", label = "" }) {
  const arrowId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  
  // Use a slight opacity for inactive state
  const currentColor = active ? color : "#cbd5e1";
  const textColor = active ? "#ffffff" : "#64748b";
  const bgColor = active ? color : "#f1f5f9";
  const borderColor = active ? color : "#e2e8f0";

  return (
    <div className="flow-connector-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: '100%',
      height: '80px',
      margin: '0.5rem 0'
    }}>
      <svg 
        width="340" 
        height="60" 
        viewBox="0 0 340 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Shadow effect */}
        <filter id={`shadow-${arrowId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* The Arrow Box Shape */}
        <path
          d="M10 8C10 5.79086 11.7909 4 14 4H326C328.209 4 330 5.79086 330 8V36C330 38.2091 328.209 40 326 40H180L170 52L160 40H14C11.7909 40 10 38.2091 10 36V8Z"
          fill={bgColor}
          stroke={borderColor}
          strokeWidth="1.5"
          filter={active ? `url(#shadow-${arrowId})` : ""}
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Label Text */}
        <text
          x="170"
          y="26"
          textAnchor="middle"
          fill={textColor}
          style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.025em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {label}
        </text>

        {/* Animated Glow on path if active */}
        {active && (
          <path
            d="M10 8C10 5.79086 11.7909 4 14 4H326C328.209 4 330 5.79086 330 8V36C330 38.2091 328.209 40 326 40H180L170 52L160 40H14C11.7909 40 10 38.2091 10 36V8Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="20"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        )}
      </svg>
    </div>
  );
}

export default FlowConnector;
