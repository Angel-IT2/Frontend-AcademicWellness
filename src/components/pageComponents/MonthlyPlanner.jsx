import React, { useState, useRef, useEffect } from "react";
import "./MonthlyPlanner.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const THEME_COLORS = ["#6366f1", "#4a90e2", "#e57373", "#81c784", "#ffb74d"];

const MonthlyPlanner = ({ tasks: propTasks = [], setTasks: propSetTasks }) => {
  const [tasks, setTasks] = useState(propTasks);
  const setTasksSafe = propSetTasks || setTasks;

  useEffect(() => {
    setTasks(propTasks);
  }, [propTasks]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    priority: "medium",
    description: "",
    time: "",
  });

  const [showSettings, setShowSettings] = useState(false);
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
  const [startWeekMonday, setStartWeekMonday] = useState(false);
  const [highlightWeekends, setHighlightWeekends] = useState(true);

  const formRef = useRef();

  const monthName = currentDate.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const weekdays = startWeekMonday ? [...WEEKDAYS.slice(1), WEEKDAYS[0]] : WEEKDAYS;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  let firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  if (startWeekMonday) firstDayOfWeek = (firstDayOfWeek + 6) % 7;

  const daysArray = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array(daysInMonth)
      .fill(0)
      .map((_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)),
  ];

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
    const dateStr = formatDate(day);
    if (selectedDate !== dateStr) {
      setFormData({ text: "", priority: "medium", description: "", time: "" });
      setEditingTaskId(null);
    }
    setSelectedDate(dateStr);
  };

  const saveTask = () => {
    if (!formData.text || !selectedDate) return;

    if (editingTaskId) {
      setTasksSafe((prev) =>
        prev.map((t) => (t.id === editingTaskId ? { ...t, ...formData } : t))
      );
    } else {
      setTasksSafe((prev) => [
        ...prev,
        { id: Date.now(), date: selectedDate, ...formData },
      ]);
    }

    setFormData({ text: "", priority: "medium", description: "", time: "" });
    setSelectedDate(null);
    setEditingTaskId(null);
  };

  const deleteTask = (id) => setTasksSafe((prev) => prev.filter((t) => t.id !== id));
  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setFormData(task);
    setSelectedDate(task.date);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setSelectedDate(null);
        setEditingTaskId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="planner-page" style={{ "--theme-color": themeColor }}>
      <header className="planner-header">
        <h1>Monthly Planner</h1>
        <div className="header-actions">
          <button onClick={() => window.print()}>🖨 Print</button>
          <button onClick={() => setShowSettings(!showSettings)}>⚙ Settings</button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <h2>Settings</h2>
          <div className="setting-item">
            <label>Theme Color:</label>
            <div className="color-options">
              {THEME_COLORS.map((c) => (
                <div
                  key={c}
                  className="color-swatch"
                  style={{
                    background: c,
                    border: themeColor === c ? "3px solid black" : "1px solid #ccc",
                  }}
                  onClick={() => setThemeColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={startWeekMonday}
                onChange={(e) => setStartWeekMonday(e.target.checked)}
              />
              Start week on Monday
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={highlightWeekends}
                onChange={(e) => setHighlightWeekends(e.target.checked)}
              />
              Highlight weekends
            </label>
          </div>
        </div>
      )}

      <main className="calendar-container">
        <div className="calendar-frame">
          {/* Calendar Navigation */}
          <div className="calendar-nav">
            <button
              onClick={prevMonth}
              style={{
                backgroundColor: themeColor || "#e0e7ff",
                color: themeColor ? "#fff" : "#4338ca",
              }}
            >
              ←
            </button>
            <div>{monthName}</div>
            <button
              onClick={nextMonth}
              style={{
                backgroundColor: themeColor || "#e0e7ff",
                color: themeColor ? "#fff" : "#4338ca",
              }}
            >
              →
            </button>
          </div>

          <div className="weekday-labels">
            {weekdays.map((day) => (
              <div key={day} className="weekday-label">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {daysArray.map((day, idx) => {
              const dateStr = day ? formatDate(day) : `blank-${idx}`;
              const dayTasks = day ? tasks.filter((t) => t.date === dateStr) : [];
              const active = selectedDate === dateStr;
              const weekend =
                highlightWeekends && day && (day.getDay() === 0 || day.getDay() === 6)
                  ? "weekend"
                  : "";
              return (
                <div
                  key={dateStr}
                  className={`calendar-day ${active ? "active" : ""} ${weekend} ${
                    day && day.toDateString() === new Date().toDateString() ? "today" : ""
                  }`}
                  onClick={() => handleDateClick(day)}
                >
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

                  {(selectedDate || editingTaskId) && day && (
                    <div className="modal-overlay">
                      <div
                        className="modal"
                        ref={formRef}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h2>{editingTaskId ? "Edit Task" : "Add Task"}</h2>
                        <input
                          placeholder="Task name"
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
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                        <textarea
                          placeholder="Description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="modal-actions">
                          <button className="task-save-btn" onClick={saveTask}>Save</button>
                          <button
                            className="cancel-btn"
                            onClick={() => {
                              setSelectedDate(null);
                              setEditingTaskId(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color legend-high"></span> High Priority
            </div>
            <div className="legend-item">
              <span className="legend-color legend-medium"></span> Medium Priority
            </div>
            <div className="legend-item">
              <span className="legend-color legend-low"></span> Low Priority
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const TaskItem = ({ task, deleteTask, startEditingTask, editingTaskId, formData, setFormData, saveTask }) => {
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
              <button onClick={() => startEditingTask(task)}>✎</button>
              <button onClick={() => deleteTask(task.id)}>×</button>
            </div>
          </div>
          {task.time && <div className="task-time">{task.time}</div>}
          {task.description && <div className="task-description">{task.description}</div>}
        </>
      )}
    </li>
  ); 
};

export default MonthlyPlanner;
