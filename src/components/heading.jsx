import React from 'react';

const Heading = ({ children }) => {
  return (
    <h2 className="text-xl font-semibold mb-4 md:mb-8 text-purple-400 text-center md:text-left">
      {children}
    </h2>
  );
};

export default Heading;