import React, { useState, useRef, useEffect } from "react";
import "./MonthlyPlanner.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const THEME_COLORS = ["#6366f1", "#4a90e2", "#e57373", "#81c784", "#ffb74d"];

const MonthlyPlanner = () => {
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({ text: "", priority: "medium", description: "", time: "" });

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
  const [startWeekMonday, setStartWeekMonday] = useState(false);
  const [highlightWeekends, setHighlightWeekends] = useState(true);

  const formRef = useRef();

  // Calendar info
  const monthName = currentDate.toLocaleString(undefined, { month: "long", year: "numeric" });

  // apply settings: start week on Sunday or Monday
  const weekdays = startWeekMonday
    ? [...WEEKDAYS.slice(1), WEEKDAYS[0]]
    : WEEKDAYS;

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  // adjust first day based on settings
  let firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  if (startWeekMonday) firstDayOfWeek = (firstDayOfWeek + 6) % 7;

  const daysArray = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array(daysInMonth).fill(0).map((_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)),
  ];

  // handlers
  const prevMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
  const nextMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = day.toISOString().split("T")[0];
    if (selectedDate !== dateStr) {
      setFormData({ text: "", priority: "medium", description: "", time: "" });
      setEditingTaskId(null);
    }
    setSelectedDate(dateStr);
  };

  // save task
  const saveTask = () => {
    if (!formData.text || !selectedDate) return;
    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTaskId ? { ...t, ...formData } : t))
      );
    } else {
      setTasks((prev) => [...prev, { id: Date.now(), date: selectedDate, ...formData }]);
    }
    setFormData({ text: "", priority: "medium", description: "", time: "" });
    setSelectedDate(null);
    setEditingTaskId(null);
  };

  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const startEditingTask = (task) => { setEditingTaskId(task.id); setFormData(task); setSelectedDate(task.date); };

  // Hide edit popup if clicked outside
  useEffect(() => {
    const handleClick = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setSelectedDate(null); setEditingTaskId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="planner-page" style={{ "--theme-color": themeColor }}>
      {/* HEADER */}
      <header className="planner-header">
        <h1>Monthly Planner</h1>
        <div className="header-actions">
          <button onClick={() => window.print()}>🖨 Print</button>
          <button onClick={() => setShowSettings(!showSettings)}>⚙ Settings</button>
        </div>
      </header>

      {/* SETTINGS PANEL */}
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
                  style={{ background: c, border: themeColor === c ? "3px solid black" : "1px solid #ccc" }}
                  onClick={() => setThemeColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" checked={startWeekMonday} onChange={(e) => setStartWeekMonday(e.target.checked)} />
              Start week on Monday
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" checked={highlightWeekends} onChange={(e) => setHighlightWeekends(e.target.checked)} />
              Highlight weekends
            </label>
          </div>
        </div>
      )}

      {/* CALENDAR */}
      <main className="calendar-container">
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
              const weekend = highlightWeekends && day && (day.getDay() === 0 || day.getDay() === 6) ? "weekend" : "";
              return (
                <div key={dateStr}
                  className={`calendar-day ${active ? "active" : ""} ${weekend}`}
                  onClick={() => handleDateClick(day)}>
                  <div className="cell-date">{day ? day.getDate() : ""}</div>
                  <ul className="task-list">
                    {dayTasks.map((ev) => (
                      <TaskItem key={ev.id} task={ev} deleteTask={deleteTask}
                        startEditingTask={startEditingTask} editingTaskId={editingTaskId}
                        formData={formData} setFormData={setFormData} saveTask={saveTask} />
                    ))}
                  </ul>
                  {active && !editingTaskId && (
                    <div className="task-form-popup" ref={formRef} onClick={(e) => e.stopPropagation()}>
                      <input value={formData.text} placeholder="Task name"
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })} />
                      <select value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <input type="time" value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                      <textarea value={formData.description} placeholder="Description"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                      <button onClick={saveTask}>Save</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

// Single Task Item
const TaskItem = ({ task, deleteTask, startEditingTask, editingTaskId, formData, setFormData, saveTask }) => {
  const isEditing = editingTaskId === task.id;
  return (
    <li className="task-item" onClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <div className="task-edit">
          <input value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} />
          <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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

export default MonthlyPlanner