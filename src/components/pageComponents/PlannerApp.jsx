import React, { useState } from "react";
import TwoWeekPlanner from "./TwoWeekPlanner";
import MonthlyPlanner from "./MonthlyPlanner";

const PlannerApp = () => {
  const [tasks, setTasks] = useState([]);

  return (
    <div>
      <TwoWeekPlanner tasks={tasks} setTasks={setTasks} />
      <MonthlyPlanner tasks={tasks} setTasks={setTasks} />
    </div>
  );
};

export default PlannerApp;