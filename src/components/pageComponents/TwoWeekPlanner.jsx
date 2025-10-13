import React, { useState, useRef, useEffect, useCallback } from "react";
import "./TwoWeekPlanner.css";
export const API_URL = 'https://backend-academicwellness.onrender.com';

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

const TwoWeekPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [formData, setFormData] = useState({ text: "", priority: "medium", description: "" });
  const [descriptionStyle, setDescriptionStyle] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const modalRef = useRef();
  const today = new Date();

  const formatDate = useCallback((date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }, []);

  const todayStr = formatDate(today);
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const daysArray = [...Array(14)].map((_, i) => {
    const d = new Date(firstDayOfWeek);
    d.setDate(firstDayOfWeek.getDate() + i);
    return d;
  });

  const monthName = today.toLocaleString(undefined, { month: "long" }).toUpperCase();

  // ---------------- BACKEND FETCH ----------------
  
  // In the useEffect hook for fetching tasks
// Put this right after your state declarations
const fetchTasks = useCallback(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found, user is not logged in.");
    return;
  }

  // We can calculate startDate and endDate right here
  const firstDay = new Date();
  firstDay.setDate(new Date().getDate() - new Date().getDay());
  
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 13);

  const startStr = formatDate(firstDay);
  const endStr = formatDate(lastDay);

  try {
    console.log("📡 Fetching tasks from backend...");
    const response = await fetch(
      `${API_URL}/api/planner/tasks/?start=${startStr}&end=${endStr}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      // It's helpful to see the error status
      throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
    }
    const data = await response.json();

    const formatted = data.map((task) => ({
      ...task,
      text: task.title,
    }));

    setTasks(formatted);
    console.log(`✅ Loaded ${formatted.length} tasks successfully.`);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
  }
}, [formatDate]); // formatDate is a dependency from useCallback

// Now, your useEffect hook becomes very simple and clean
useEffect(() => {
  fetchTasks();
}, [fetchTasks]); // This now correctly runs when the component mounts

  // ---------------- TASK HANDLERS ----------------
  const handleDateClick = (dateStr) => {
    setActiveDate(dateStr);
    setEditingTaskId(null);
    setFormData({ text: "", priority: "medium", description: "" });
  };

  const saveTask = async () => {
  if (!formData.text || !activeDate) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to save tasks.");
    return;
  }

  try {
    const method = editingTaskId ? "PUT" : "POST";
    const url = editingTaskId
      ? `${API_URL}/api/planner/tasks/${editingTaskId}/`
      : `${API_URL}/api/planner/tasks/`;
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        date: activeDate,
        title: formData.text,
        description: formData.description,
        priority: formData.priority,
        allow_reminders: true,
      }),
    });

    if (!response.ok) {
      const errMsg = await response.json();
      throw new Error(errMsg.detail || "Failed to save task.");
    }

    // 1. Get the saved task back from the server response
    const savedTask = await response.json();

    // 2. Format it just like our other tasks (add the 'text' property)
    const formattedTask = { ...savedTask, text: savedTask.title };

    // 3. Update the state directly
    setTasks(prevTasks => {
      if (editingTaskId) {
        // If we were editing, find and replace the task in the array
        return prevTasks.map(task => 
          task.id === editingTaskId ? formattedTask : task
        );
      } else {
        // If we were adding a new task, add it to the end of the array
        return [...prevTasks, formattedTask];
      }
    });

    console.log(`✅ Task ${editingTaskId ? "updated" : "created"} successfully!`);
    
    // 4. Reset the form and close the modal
    setFormData({ text: "", priority: "medium", description: "" });
    setActiveDate(null);
    setEditingTaskId(null);

  } catch (error) {
    console.error("❌ Error saving task:", error);
    alert(`❌ Error: ${error.message}`);
  }
};


  const deleteTask = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to delete tasks.");
    return;
  }
  
  // Confirm before deleting
  if (!window.confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/planner/tasks/${id}/`, {
      method: "DELETE",
      headers: { // ADD THIS
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Check if status is 204 No Content, which is a success for DELETE
      if (response.status !== 204) {
        throw new Error("Failed to delete task");
      }
    }
    
    // Update state locally for faster UI response
    setTasks((prev) => prev.filter((t) => t.id !== id));
    console.log("✅ Task deleted successfully!");
    
    // Close the modal if it was open for this task
    setActiveDate(null);
    setEditingTaskId(null);

  } catch (err) {
    console.error("❌ Error deleting task:", err);
    alert(`❌ Error: ${err.message}`);
  }
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

  const handleTaskClick = (task) => {
    setActiveTaskId(task.id);
    setActiveDate(task.date);
    setEditingTaskId(task.id);
    setFormData({
      text: task.text,
      priority: task.priority,
      description: task.description || "",
    });
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
            className={`calendar-day ${isWeekend ? "weekend" : "weekday"} ${
              dateStr === todayStr ? "today" : ""
            }`}
            onClick={() => handleDateClick(dateStr)}
            id="calendar-cell"
          >
            <div className="cell-date">{day.getDate()}</div>
            <ul className="task-list">
              {dayEvents.map((ev) => (
                <li
                  key={ev.id}
                  className={`task-item ${activeTaskId === ev.id ? "active-task" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskClick(ev);
                  }}
                >
                  <span className={`priority-badge ${ev.priority}`}></span>
                  <span className="task-name">{ev.text}</span>
                  {activeTaskId === ev.id && (
                    <div className="task-actions">
                      <button id="task-edit-btn" className="task-btn" onClick={() => startEditingTask(ev)}> ✎ </button>
                      <button id="task-delete-btn" className="task-btn" onClick={() => deleteTask(ev.id)}>×</button>
                    </div>
                  )}
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

  const tasksByDay = daysArray.map((day) => {
    const dateStr = formatDate(day);
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    return { date: dateStr, tasks: dayTasks };
  });

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
          <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#007bff" }}>
            Step {helpStep + 1}
          </div>
          <div>{descriptionStyle.text}</div>
          <div style={{ marginTop: "8px", textAlign: "right" }}>
            <button className="task-save-btn" onClick={nextHelpStep}>Next</button>
          </div>
        </div>
      )}

      <div className="calendar-legend">
        <div className="legend-item" id="legend-high"><div className="legend-color high" /> High Priority</div>
        <div className="legend-item" id="legend-medium"><div className="legend-color medium" /> Medium Priority</div>
        <div className="legend-item" id="legend-low"><div className="legend-color low" /> Low Priority</div>
      </div>

      <div className="tasks-panel">
        <h2>Tasks for Next Two Weeks</h2>
        {tasksByDay.every(day => day.tasks.length === 0) ? (
          <p className="no-tasks">No tasks in this period</p>
        ) : (
          <ul className="detailed-task-list">
            {tasksByDay.map(({ date, tasks }) =>
              tasks.length > 0 ? (
                <li key={date} className="day-group">
                  <div className="day-label">
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <ul>
                    {tasks
                      .slice()
                      .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                      .map((task) => (
                        <li key={task.id} className={`detailed-task ${task.priority}`}>
                          <div className="task-top">
                            {task.time && <span className="task-time">{task.time}</span>}
                          </div>
                          <div className="task-body">
                            <span className="task-title">{task.text}</span>
                            {task.description && <p className="task-desc">{task.description}</p>}
                          </div>
                        </li>
                      ))}
                  </ul>
                </li>
              ) : null
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TwoWeekPlanner;




