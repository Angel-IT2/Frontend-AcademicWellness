import React, { useState, useRef, useEffect } from "react";
import "./TwoWeekPlanner.css";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TwoWeekPlanner = () => {
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    priority: "medium",
    description: "",
  });

  const formRef = useRef();
  const startDate = new Date();
  const startMonth = startDate.getMonth();

  const daysArray = [...Array(14)].map((_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  const monthName = startDate.toLocaleString(undefined, { month: "long" }).toUpperCase();

  const handleDateClick = (dateStr) => {
    if (activeDate !== dateStr) {
      setFormData({ text: "", priority: "medium", description: "" });
      setEditingTaskId(null);
    }
    setActiveDate(dateStr);
  };

  const saveTask = () => {
    if (!formData.text) return;

    if (editingTaskId) {
      setCalendarTasks(calendarTasks.map(task =>
        task.id === editingTaskId ? { ...task, ...formData } : task
      ));
    } else {
      setCalendarTasks([
        ...calendarTasks,
        { id: Date.now(), date: activeDate, ...formData },
      ]);
    }

    setFormData({ text: "", priority: "medium", description: "" });
    setActiveDate(null);
    setEditingTaskId(null);
  };

  const deleteTask = (id) => {
    setCalendarTasks(calendarTasks.filter((t) => t.id !== id));
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setFormData({ text: task.text, priority: task.priority, description: task.description });
    setActiveDate(task.date);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setActiveDate(null);
        setEditingTaskId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderWeek = (week) => (
    <div className="week-row">
      {week.map((day) => {
        const dateStr = day.toISOString().split("T")[0];
        const dayEvents = calendarTasks.filter((c) => c.date === dateStr);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isNextMonth = day.getMonth() !== startMonth;

        return (
          <div
            key={dateStr}
            className={`calendar-day ${isWeekend ? "weekend" : "weekday"} ${
              activeDate === dateStr ? "active" : ""
            } ${isNextMonth ? "next-month" : ""}`}
            onClick={() => handleDateClick(dateStr)}
          >
            <div className="cell-date">
              {day.getDate()}
              {isNextMonth && (
                <span className="next-month-indicator">Next Month</span>
              )}
            </div>

            <ul className="task-list">
              {dayEvents.map((ev) => (
                <TaskItem
                  key={ev.id}
                  task={ev}
                  deleteTask={deleteTask}
                  startEditingTask={startEditingTask}
                  editingTaskId={editingTaskId}
                  formData={formData}
                  setFormData={setFormData}
                  saveTask={saveTask}
                />
              ))}
            </ul>

            {activeDate === dateStr && !editingTaskId && (
              <div
                className="task-form-popup"
                ref={formRef}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  placeholder="Task name"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                />
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <button onClick={saveTask}>Save</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const firstWeek = daysArray.slice(0, 7);
  const secondWeek = daysArray.slice(7, 14);

  return (
    <div className="planner-page">
      <h1>Two-Week Calendar Planner</h1>
      <div className="calendar-caption">
        Plan your next two weeks and focus on what matters most!
      </div>

      <div className="calendar-container">
        <div className="calendar-frame">
          <div className="calendar-header">{monthName}</div>
          <div className="weekday-labels">
            {weekdays.map((day) => (
              <div key={day} className="weekday-label">
                {day}
              </div>
            ))}
          </div>

          {renderWeek(firstWeek)}
          {renderWeek(secondWeek)}

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color high"></span> High Priority
            </div>
            <div className="legend-item">
              <span className="legend-color medium"></span> Medium Priority
            </div>
            <div className="legend-item">
              <span className="legend-color low"></span> Low Priority
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({
  task,
  deleteTask,
  startEditingTask,
  editingTaskId,
  formData,
  setFormData,
  saveTask,
}) => {
  const isEditing = editingTaskId === task.id;

  return (
    <li className="task-item" onClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <div className="task-edit">
          <input
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <button onClick={saveTask}>Save</button>
        </div>
      ) : (
        <>
          <div className="task-header">
            <div className="task-name">
              <span className={`priority-badge ${task.priority}`}></span>
              {task.text}
            </div>
            <div>
              <button
                className="task-toggle-btn"
                onClick={() => startEditingTask(task)}
              >
                ✎
              </button>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                ×
              </button>
            </div>
          </div>
          {task.description && (
            <div className="task-description">{task.description}</div>
          )}
        </>
      )}
    </li>
  );
};

export default TwoWeekPlanner;
