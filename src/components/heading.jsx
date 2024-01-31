import React from 'react';

const Heading = ({ children }) => {
  return (
    <h2 className="text-xl font-semibold mb-8 text-purple-400">
      {children}
    </h2>
  );
};

export default Heading;