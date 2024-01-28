import React from 'react';

const PageButton = ({ pageNumber, setCurrentPage, isActive }) => {
  // Define the base classes for the button
  const baseClasses = 'px-2 py-1 rounded-lg';

  // Determine the button's classes based on whether it is active
  const buttonClasses = isActive ? `${baseClasses} bg-indigo-600 text-white` : `${baseClasses} bg-gray-200 text-indigo-600`;

  return (
    <button
      // You can remove the key prop from here as it is typically used in lists and should be on the component when used in a map or similar iteration
      className={buttonClasses}
      onClick={() => setCurrentPage(pageNumber)}
    >
      {pageNumber}
    </button>
  );
};

export default PageButton;
