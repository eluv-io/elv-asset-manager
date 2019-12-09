import React from "react";

const OrderButtons = ({index, length, Swap}) => {
  let upButton = <div className="placeholder" />;
  if(index > 0) {
    upButton = (
      <button
        title={"Move up"}
        onClick={() => Swap(index, index - 1)}
        className="order-button"
      >
        ▲
      </button>
    );
  }

  let downButton = <div className="placeholder" />;
  if(index < length - 1) {
    downButton = (
      <button
        title={"Move down"}
        onClick={() => Swap(index, index + 1)}
        className="order-button"
      >
        ▼
      </button>
    );
  }

  return (
    <div className="order-buttons-container">
      {upButton}
      {downButton}
    </div>
  );
};

export default OrderButtons;
