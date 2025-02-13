import React from "react";

const DashBoards = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Overview</h2>
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">Metric 1</div>
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">Metric 2</div>
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">Metric 3</div>
    </div>
  </div>
);

export default DashBoards;
