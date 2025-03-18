import React from 'react';

const ScaleButtons = ({ onScale }) => {
  const scaleOptions = [25, 50, 75, 100];
  
  return (
    <div className="scale-buttons">
      {scaleOptions.map(percentage => (
        <button
          key={percentage}
          className="scale-button"
          onClick={() => onScale(percentage)}
        >
          {percentage}%
        </button>
      ))}
    </div>
  );
};

export default ScaleButtons;
