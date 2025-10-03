import React, { useState, useRef, useEffect } from "react";
import "./TwoWeekPlanner.css";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const helpSteps = [
  { id: "calendar-caption", text: "This caption gives you quick info about the planner." },
  { id: "calendar-cell", text: "Click a day to add/edit tasks.", action: "openCell" },
  { id: "task-name-input", text: "Task name: Enter the name of your task." },
  { id: "task-priority-select", text: "Priority: Set High, Medium, or Low." },
  { id: "task-description-textarea", text: "Description: Optional details for your task." },
  { id: "task-edit-btn", text: "✎ button lets you edit a task." },
  { id: "task-delete-btn", text: "× button lets you delete a task." },
  { id: "weekdays", text: "Weekday labels: Days of the week." },
  { id: "legend-high", text: "High priority tasks are marked in red." },
  { id: "legend-medium", text: "Medium priority tasks are marked in yellow." },
  { id: "legend-low", text: "Low priority tasks are marked in green." },
];

const TwoWeekPlanner = ({ tasks: propTasks = [], setTasks: propSetTasks }) => {
  const tasks = propTasks;
  const setTasksSafe = propSetTasks || (() => {});

  const [activeDate, setActiveDate] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [formData, setFormData] = useState({ text: "", priority: "medium", description: "" });
  const [descriptionStyle, setDescriptionStyle] = useState(null);

  const modalRef = useRef();
  const today = new Date();

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const todayStr = formatDate(today);
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const daysArray = [...Array(14)].map((_, i) => {
    const d = new Date(firstDayOfWeek);
    d.setDate(firstDayOfWeek.getDate() + i);
    return d;
  });

  const monthName = today.toLocaleString(undefined, { month: "long" }).toUpperCase();

  // ---------------- TASK HANDLERS ----------------
  const handleDateClick = (dateStr) => {
    setActiveDate(dateStr);
    setEditingTaskId(null);
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    if (dayTasks.length > 0) {
      setEditingTaskId(dayTasks[0].id);
      setFormData({ text: dayTasks[0].text, priority: dayTasks[0].priority, description: dayTasks[0].description });
    } else {
      setFormData({ text: "", priority: "medium", description: "" });
    }
  };

  const saveTask = () => {
    if (!formData.text || !activeDate) return;
    if (editingTaskId) {
      setTasksSafe((prev) =>
        prev.map((task) => (task.id === editingTaskId ? { ...task, ...formData } : task))
      );
    } else {
      setTasksSafe((prev) => [...prev, { id: Date.now(), date: activeDate, ...formData }]);
    }
    setFormData({ text: "", priority: "medium", description: "" });
    setActiveDate(null);
    setEditingTaskId(null);
  };

  const deleteTask = (id) => {
    setTasksSafe((prev) => prev.filter((t) => t.id !== id));
    setActiveDate(null);
    setEditingTaskId(null);
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setFormData({ text: task.text, priority: task.priority, description: task.description });
    setActiveDate(task.date);
  };

  // ---------------- HELP TOUR ----------------
  useEffect(() => {
    if (!showHelp) return;
    const step = helpSteps[helpStep];
    if (!step) return;

    const el = document.getElementById(step.id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const rect = el.getBoundingClientRect();

    // Description box positioned near element
    setDescriptionStyle({
      top: rect.top + window.scrollY + rect.height / 2 - 30 + "px",
      left: Math.max(rect.left + window.scrollX - 320, 10) + "px",
      text: step.text,
    });
  }, [helpStep, showHelp]);

  const nextHelpStep = () => {
    if (helpStep < helpSteps.length - 1) {
      setHelpStep(helpStep + 1);
    } else {
      setShowHelp(false);
      setHelpStep(0);
      setDescriptionStyle(null);
      setActiveDate(null);
    }
  };

  // ---------------- RENDER WEEK ----------------
  const renderWeek = (week) => (
    <div className="week-row">
      {week.map((day) => {
        const dateStr = formatDate(day);
        const dayEvents = tasks.filter((t) => t.date === dateStr);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

        return (
          <div
            key={dateStr}
            className={`calendar-day ${isWeekend ? "weekend" : "weekday"} ${dateStr === todayStr ? "today" : ""}`}
            onClick={() => handleDateClick(dateStr)}
            id="calendar-cell"
          >
            <div className="cell-date">{day.getDate()}</div>
            <ul className="task-list">
              {dayEvents.map((ev) => (
                <li key={ev.id} className="task-item" onClick={(e) => e.stopPropagation()}>
                  <span className={`priority-badge ${ev.priority}`}></span>
                  <span className="task-name">{ev.text}</span>
                  <div className="task-actions">
                    <button id="task-edit-btn" className="task-btn" onClick={() => startEditingTask(ev)}>✎</button>
                    <button id="task-delete-btn" className="task-btn" onClick={() => deleteTask(ev.id)}>×</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );

  const firstWeek = daysArray.slice(0, 7);
  const secondWeek = daysArray.slice(7, 14);

  return (
    <div className="planner-page">
      <header className="planner-header">
        <h1>Two-Week Calendar Planner</h1>
        <button className="help-btn" onClick={() => { setShowHelp(true); setHelpStep(0); }}>Help</button>
      </header>

      <div className="calendar-caption" id="calendar-caption">
        Plan your next two weeks and focus on what matters most!
      </div>

      <div className="calendar-container">
        <div className="calendar-frame">
          <div className="calendar-header">{monthName}</div>
          <div className="weekday-labels" id="weekdays">
            {weekdays.map((day) => (
              <div key={day} className="weekday-label">{day}</div>
            ))}
          </div>

          {renderWeek(firstWeek)}
          {renderWeek(secondWeek)}
        </div>
      </div>

      {/* Task Modal */}
      {activeDate && (
        <div className="modal-overlay">
          <div className="modal" ref={modalRef}>
            <h2>{editingTaskId ? "Edit Task" : "Add Task"} - {activeDate}</h2>
            <input id="task-name-input" placeholder="Task name..." value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} />
            <select id="task-priority-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <textarea id="task-description-textarea" placeholder="Description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            <div className="modal-actions">
              <button className="task-save-btn" onClick={saveTask}>Save</button>
              {editingTaskId && <button className="cancel-btn" onClick={() => deleteTask(editingTaskId)}>Delete</button>}
              <button className="cancel-btn" onClick={() => { setActiveDate(null); setEditingTaskId(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Description box with step number inside */}
      {showHelp && descriptionStyle && (
        <div
          className="help-description-box"
          style={{
            position: "absolute",
            top: descriptionStyle.top,
            left: descriptionStyle.left,
            width: "300px",
            padding: "10px",
            background: "#fff",
            border: "2px solid #007bff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "6px",
              color: "#007bff",
            }}
          >
            Step {helpStep + 1}
          </div>
          <div>{descriptionStyle.text}</div>
          <div style={{ marginTop: "8px", textAlign: "right" }}>
            <button className="task-save-btn" onClick={nextHelpStep}>Next</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item" id="legend-high"><div className="legend-color high" /> High Priority</div>
        <div className="legend-item" id="legend-medium"><div className="legend-color medium" /> Medium Priority</div>
        <div className="legend-item" id="legend-low"><div className="legend-color low" /> Low Priority</div>
      </div>
    </div>
  );
};

export default TwoWeekPlanner;
