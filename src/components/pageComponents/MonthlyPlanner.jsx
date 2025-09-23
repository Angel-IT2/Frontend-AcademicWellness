import React, { useState, useRef, useEffect } from "react";
import "./MonthlyPlanner.css";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MonthlyPlanner = () => {
  // state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    priority: "medium",
    description: "",
    time: ""
  });

  const formRef = useRef();

  // month details
  const monthName = currentDate.toLocaleString(undefined, {
    month: "long",
    year: "numeric"
  });

  // calc days for current month grid
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfWeek = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const daysArray = [
    ...Array(firstDayOfWeek).fill(null), // blank start
    ...Array(daysInMonth)
      .fill(0)
      .map((_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1))
  ];

  // handlers
  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = day.toISOString().split("T")[0];
    if (selectedDate !== dateStr) {
      setFormData({ text: "", priority: "medium", description: "", time: "" });
      setEditingTaskId(null);
    }
    setSelectedDate(dateStr);
  };

  const saveTask = () => {
    if (!formData.text || !selectedDate) return;
    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTaskId ? { ...t, ...formData } : t))
      );
    } else {
      setTasks((prev) => [
        ...prev,
        { id: Date.now(), date: selectedDate, ...formData }
      ]);
    }
    // reset
    setFormData({ text: "", priority: "medium", description: "", time: "" });
    setSelectedDate(null);
    setEditingTaskId(null);
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setFormData({
      text: task.text,
      priority: task.priority,
      description: task.description,
      time: task.time || ""
    });
    setSelectedDate(task.date);
  };

  // close popup if click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setSelectedDate(null);
        setEditingTaskId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="planner-page">
      {/* HEADER */}
      <header className="planner-header">
        <h1>Monthly Planner</h1>
        <div className="header-actions">
          <button onClick={() => window.print()}>🖨 Print</button>
          <button>⚙ Settings</button>
        </div>
      </header>

      <main className="calendar-container">
        {/* CALENDAR */}
        <div className="calendar-frame">
          <div className="calendar-nav">
            <button onClick={prevMonth}>←</button>
            <div>{monthName}</div>
            <button onClick={nextMonth}>→</button>
          </div>
          <div className="weekday-labels">
            {weekdays.map((day) => (
              <div key={day} className="weekday-label">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {daysArray.map((day, idx) => {
              const dateStr = day ? day.toISOString().split("T")[0] : `blank-${idx}`;
              const dayTasks = day ? tasks.filter((t) => t.date === dateStr) : [];
              const active = selectedDate === dateStr;
              
              const weekend =day && (day.getDay() === 0 || day.getDay() === 6) ? "weekend" : "";
              
              return (
              <div
              key={dateStr}
              className={`calendar-day ${active ? "active" : ""} ${weekend}`} onClick={() => handleDateClick(day)}>
                <div className="cell-date">{day ? day.getDate() : ""}</div>
                
                <ul className="task-list">
                  {dayTasks.map((ev) => (
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

                  {/* inline popup for add/edit */}
                  {active && !editingTaskId && (
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
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                      />
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
        </div>

        {/* LEGEND */}
        <div className="calendar-legend">
          <div className="legend-item"><span className="legend-color high"></span> High Priority</div>
          <div className="legend-item"><span className="legend-color medium"></span> Medium Priority</div>
          <div className="legend-item"><span className="legend-color low"></span> Low Priority</div>
        </div>
      </main>
    </div>
  );
};

// TaskItem like TwoWeekPlanner
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
              {task.text} {task.time && <em>({task.time})</em>}
            </div>
            <div>
              <button onClick={() => startEditingTask(task)}>✎</button>
              <button onClick={() => deleteTask(task.id)}>×</button>
            </div>
          </div>
          {task.description && <div className="task-description">{task.description}</div>}
        </>
      )}
    </li>
  );
};

export default MonthlyPlanner;