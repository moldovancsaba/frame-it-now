import React from 'react';

interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage = ({ error }: ErrorMessageProps): JSX.Element | null => {
  if (!error) return null;
  
  return (
    <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded-md">
      <span className="font-medium">Error: </span>{error}
    </div>
  );
};

export default ErrorMessage;
