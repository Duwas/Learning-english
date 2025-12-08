'use client';
import React from "react";
import { ProgressSpinner } from "primereact/progressspinner"; // hoặc react-spinners

const LoadingOverlay = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="loading">
      <ProgressSpinner />
    </div>
  );
};

export default LoadingOverlay;