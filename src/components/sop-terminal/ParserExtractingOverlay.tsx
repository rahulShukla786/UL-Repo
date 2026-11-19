import React from "react";

export const ParserExtractingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/55 backdrop-blur-sm">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/35 border-t-white" />
      <p className="mt-5 text-4xl font-medium text-white">
        Extracting Business Rules...
      </p>
    </div>
  );
};

export default ParserExtractingOverlay;