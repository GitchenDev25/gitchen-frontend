// components/FilterPopup.js (or pages/FilterPopup.js)
import React, { useRef } from 'react';

export default function FilterPopUp({ children, onClose }) {
  const popupRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto"
      onClick={handleOutsideClick}
    >
      <div
        ref={popupRef}
        className="bg-white rounded-md shadow-lg p-6 relative w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl font-bold"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}