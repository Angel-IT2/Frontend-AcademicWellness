import React, { useState, useRef, useEffect, useCallback } from "react";
import "./MonthlyPlanner.css";
export const API_URL = 'https://backend-academicwellness.onrender.com';

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
  const [activeTaskId, setActiveTaskId] = useState(null);
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

  const fetchAllTasks = useCallback(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found, user is not logged in.");
    return;
  }

  try {
    console.log("📡 Fetching ALL tasks from the backend...");
    // We use the base tasks endpoint to get everything
    const response = await fetch(`${API_URL}/api/planner/tasks/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
    }

    const data = await response.json();

    // The API might return paginated data like { results: [...] } or just an array
    const taskList = data.results || data; 
    
    if (!Array.isArray(taskList)) {
        console.error("API response was not an array:", data);
        return;
    }

   
    // Normalize the data to ensure it has the fields our component expects
    const formattedTasks = taskList.map(t => ({
      ...t,
      text: t.title || t.text || "", // Unify the text/title property
      date: t.date.split("T")[0],    // Ensure date is in YYYY-MM-DD format
    }));

    console.log(`✅ Loaded all ${formattedTasks.length} tasks successfully.`);
    setTasksSafe(formattedTasks); // Update the state with the complete list

  } catch (err) {
    console.error("❌ Error fetching all tasks:", err);
  }
}, [setTasksSafe]); // Dependency is only the setter function


// ADD THIS NEW useEffect HOOK TO CALL THE FUNCTION ONCE
useEffect(() => {
  fetchAllTasks();
  // The empty array [] ensures this effect runs only once when the component mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



  const saveTask = async () => {
  if (!formData.text || !selectedDate) return;

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
        date: selectedDate,
        title: formData.text,
        description: formData.description,
        priority: formData.priority,
        time: formData.time,
        allow_reminders: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to save task.");
    }

    // --- Parse returned data
    const savedTask = await response.json();

    // --- Normalize the date AFTER we have savedTask
    const normalizeDate = (val) => {
      if (!val) return selectedDate;
      if (typeof val === "string") return val.split("T")[0];
      const d = new Date(val);
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${m}-${day}`;
    };

    const formattedTask = {
      ...savedTask,
      text: savedTask.title || formData.text,
      date: normalizeDate(savedTask.date || selectedDate),
    };

    // --- Show immediately
    setTasksSafe(prev =>
      editingTaskId
        ? prev.map(t => (t.id === editingTaskId ? formattedTask : t))
        : [...prev, formattedTask]
    );

    // --- Reset form
    setFormData({ text: "", priority: "medium", description: "", time: "" });
    setSelectedDate(null);
    setEditingTaskId(null);

  } catch (err) {
    console.error("❌ Error saving task:", err);
    alert(`❌ Error: ${err.message}`);
  }
};
  const deleteTask = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to delete tasks.");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this task?")) return;

  try {
    const response = await fetch(`${API_URL}/api/planner/tasks/${id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok && response.status !== 240) throw new Error("Failed to delete task");

    setTasksSafe(prev => prev.filter(t => t.id !== id));
    setSelectedDate(null);
    setEditingTaskId(null);

  } catch (err) {
    console.error("❌ Error deleting task:", err);
    alert(`❌ Error: ${err.message}`);
  }
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

  // Get tasks only for the current month
const currentMonthTasks = tasks.filter((t) => {
  const taskDate = new Date(t.date);
  return (
    taskDate.getMonth() === currentDate.getMonth() &&
    taskDate.getFullYear() === currentDate.getFullYear()
  );
});


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
              
            </button>
            <div>{monthName}</div>
            <button
              onClick={nextMonth}
              style={{
                backgroundColor: themeColor || "#e0e7ff",
                color: themeColor ? "#fff" : "#4338ca",
              }}
            >
            
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
                        activeTaskId={activeTaskId} 
                        setActiveTaskId={setActiveTaskId}
                        
                      />
                    ))}
                  </ul>
                 
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

       {(selectedDate || editingTaskId) &&(
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

        {/* Detailed Tasks Section */}
<div className="tasks-panel">
  <h2>Tasks for {monthName}</h2>
  {currentMonthTasks.length === 0 ? (
    <p className="no-tasks">No tasks this month</p>
  ) : (
    <ul className="detailed-task-list">
      {currentMonthTasks
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date) || (a.time || "").localeCompare(b.time || ""))
        .map((task) => (
          <li key={task.id} className={`detailed-task ${task.priority}`}>
            <div className="task-top">
              <span className="task-date">
                {new Date(task.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {task.time && <span className="task-time">{task.time}</span>}
            </div>
            <div className="task-body">
              <span className="task-title">{task.text}</span>
              {task.description && <p className="task-desc">{task.description}</p>}
            </div>
          </li>
        ))}
    </ul>
  )}
</div>
    </div>
  );
};

const TaskItem = ({ task, deleteTask, startEditingTask, editingTaskId, formData, setFormData, saveTask, activeTaskId, setActiveTaskId }) => {
  const isEditing = editingTaskId === task.id;
  const isActive = activeTaskId === task.id;
  return (
    <li className="task-item" 
    onClick={(e) => {
        e.stopPropagation();
        // toggle open/close if same task clicked
        setActiveTaskId(isActive ? null : task.id);
    }}>
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
            {isActive && (
            <div>
              <button onClick={() => startEditingTask(task)}>✎</button>
              <button onClick={() => deleteTask(task.id)}>×</button>
            </div>
            )}
          </div>
          {task.time && <div className="task-time">{task.time}</div>}
          {task.description && <div className="task-description">{task.description}</div>}
        </>
      )}
    </li>
  ); 
};

export default MonthlyPlanner;
