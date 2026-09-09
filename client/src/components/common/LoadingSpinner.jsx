import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <div
        className={`${sizeClasses[size]} rounded-full border-slate-200 border-t-sky-600 animate-spin mb-3`}
      />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
