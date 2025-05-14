"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, Clock, AlertCircle, X } from "lucide-react";
import "./DailyRoutine.css";

// Storage helper functions
const STORAGE_KEY = "dailyRoutine";

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("Routine data saved to localStorage");
    return true;
  } catch (error) {
    console.error("Error saving routine data to localStorage:", error);
    return false;
  }
};

const loadFromStorage = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log("Routine data loaded from localStorage");
      return parsedData;
    }
    return null;
  } catch (error) {
    console.error("Error loading routine data from localStorage:", error);
    return null;
  }
};

// Clock component
const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="digital-clock">
      <Clock size={24} />
      <span className="clock-time">{formatTime(time)}</span>
    </div>
  );
};

// Task component
const RoutineTask = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const handleSave = () => {
    if (editedTask.title.trim() === "") {
      alert("Task title cannot be empty");
      return;
    }
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(Number.parseInt(hours, 10));
      date.setMinutes(Number.parseInt(minutes, 10));

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div className="routine-task">
      {isEditing ? (
        <div className="task-edit-form">
          <div className="form-group">
            <label>Time:</label>
            <input
              type="time"
              value={editedTask.time}
              onChange={(e) =>
                setEditedTask({ ...editedTask, time: e.target.value })
              }
              className="time-input"
            />
          </div>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
              className="title-input"
              placeholder="Task title"
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              className="description-textarea"
              placeholder="Task description (optional)"
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes):</label>
            <input
              type="number"
              min="1"
              max="1440"
              value={editedTask.duration}
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  duration: Number.parseInt(e.target.value) || 0,
                })
              }
              className="duration-input"
            />
          </div>
          <div className="form-actions">
            <button
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button className="save-button" onClick={handleSave}>
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      ) : (
        <div className="task-content">
          <div className="task-header">
            <div className="task-time">{formatTime(task.time)}</div>
            <div className="task-actions">
              <button
                className="icon-button"
                onClick={() => setIsEditing(true)}
              >
                <Edit size={16} />
              </button>
              <button className="icon-button" onClick={() => onDelete(task.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="task-title">{task.title}</div>
          {task.description && (
            <div className="task-description">{task.description}</div>
          )}
          {task.duration > 0 && (
            <div className="task-duration">
              <span>Duration: {task.duration} min</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main component
const DailyRoutine = () => {
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    time: "08:00",
    title: "",
    description: "",
    duration: 30,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData && savedData.tasks) {
      setTasks(savedData.tasks);
    }
    setIsLoaded(true);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({ tasks });
    }
  }, [tasks, isLoaded]);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddTask = () => {
    if (newTask.title.trim() === "") {
      showNotification("Task title cannot be empty", "error");
      return;
    }

    const newTaskWithId = {
      ...newTask,
      id: Date.now().toString(),
    };

    setTasks((prevTasks) => [...prevTasks, newTaskWithId]);
    setNewTask({
      time: "08:00",
      title: "",
      description: "",
      duration: 30,
    });
    setIsAddingTask(false);
    showNotification("Task added successfully");
  };

  const handleUpdateTask = (id, updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? updatedTask : task))
    );
    showNotification("Task updated successfully");
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      showNotification("Task deleted successfully");
    }
  };

  const clearAllTasks = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all tasks? This cannot be undone."
      )
    ) {
      setTasks([]);
      showNotification("All tasks cleared");
    }
  };

  // Sort tasks by time
  const sortedTasks = [...tasks].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="daily-routine">
      <div className="routine-header">
        <h1>Daily Routine</h1>
        <DigitalClock />
        <div className="routine-actions">
          <button
            className="action-button add-task"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus size={16} /> Add Task
          </button>
          {tasks.length > 0 && (
            <button
              className="action-button clear-tasks"
              onClick={clearAllTasks}
            >
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <Clock size={16} />
          )}
          <span>{notification.message}</span>
          <button
            className="close-notification"
            onClick={() => setNotification(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isAddingTask && (
        <div className="add-task-form">
          <h3>Add New Task</h3>
          <div className="form-group">
            <label>Time:</label>
            <input
              type="time"
              value={newTask.time}
              onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              className="time-input"
            />
          </div>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="title-input"
              placeholder="Task title"
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="description-textarea"
              placeholder="Task description (optional)"
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes):</label>
            <input
              type="number"
              min="1"
              max="1440"
              value={newTask.duration}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  duration: Number.parseInt(e.target.value) || 0,
                })
              }
              className="duration-input"
            />
          </div>
          <div className="form-actions">
            <button
              className="cancel-button"
              onClick={() => setIsAddingTask(false)}
            >
              Cancel
            </button>
            <button className="add-button" onClick={handleAddTask}>
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>
      )}

      <div className="routine-content">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>
              No tasks added yet. Click "Add Task" to create your daily routine.
            </p>
          </div>
        ) : (
          <div className="tasks-timeline">
            {sortedTasks.map((task) => (
              <RoutineTask
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      <div className="storage-indicator">
        Routine data is automatically saved to browser storage
      </div>
    </div>
  );
};

export default DailyRoutine;
