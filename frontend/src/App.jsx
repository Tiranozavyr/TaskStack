import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const fetchTasks = () => {
    setLoading(true);
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
      .then((res) => res.json())
      .then(() => {
        setTitle("");
        setDescription("");
        fetchTasks();
      });
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/tasks/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        is_done: tasks.find((t) => t.id === editId)?.is_done || false,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setEditId(null);
        setEditTitle("");
        setEditDescription("");
        fetchTasks();
      });
  };

  const handleToggleDone = (task) => {
    fetch(`http://localhost:5000/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: !task.is_done }),
    }).then(fetchTasks);
  };

  const handleDelete = (taskId) => {
    fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
    }).then(fetchTasks);
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
  };

  return (
    <div className="app" style={styles.app}>
      <div style={styles.themeToggle}>
        <button
          style={{
            ...styles.themeButton,
            background: "transparent",
            border: `2px solid ${theme === "dark" ? "#fff" : "#282c34"}`,
            color: theme === "dark" ? "#fff" : "#282c34",
          }}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>
      <h1 style={styles.header}>TaskStack</h1>
      <form style={styles.form} onSubmit={handleAddTask}>
        <input
          style={styles.input}
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="main-button" type="submit">
          Add Task
        </button>
      </form>
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul style={styles.list}>
          {tasks.map((task) => (
            <li key={task.id} style={styles.listItem}>
              {editId === task.id ? (
                <form
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                  onSubmit={handleUpdateTask}
                >
                  <input
                    style={{
                      ...styles.input,
                      borderColor: !editTitle.trim() ? "#dc3545" : "#ccc",
                    }}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                    required
                  />
                  <input
                    style={styles.input}
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description (optional)"
                  />
                  <button className="main-button" type="submit">
                    Save
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.is_done}
                      onChange={() => handleToggleDone(task)}
                      style={{
                        marginRight: "0.5rem",
                        width: "1.2rem",
                        height: "1.2rem",
                        cursor: "pointer",
                        borderRadius: "50%",
                      }}
                    />
                    <span
                      style={
                        task.is_done
                          ? { ...styles.taskTitle, ...styles.taskTitleDone }
                          : styles.taskTitle
                      }
                    >
                      {task.title}
                    </span>
                    <span style={styles.taskDesc}>
                      {task.description ? ` — ${task.description}` : ""}
                    </span>
                  </div>
                  <div>
                    <button
                      className="text-button"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-button error"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  app: {
    background: "var(--bg)",
    color: "var(--text)",
    textAlign: "center",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
    minHeight: "100vh",
    padding: "2rem",
    position: "relative",
  },
  header: {
    color: "var(--header)",
    fontSize: "2.5rem",
    marginBottom: "2rem",
    letterSpacing: "2px",
  },
  form: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    minWidth: "180px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    maxWidth: "600px",
    margin: "0 auto",
  },
  listItem: {
    backgroundColor: "var(--item-bg)",
    margin: "0.5rem 0",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  taskDesc: {
    fontStyle: "italic",
    color: "#666",
    marginLeft: "0.5rem",
    fontSize: "0.98rem",
  },
  taskTitle: {
    color: "var(--text)",
    fontWeight: "bold",
  },
  taskTitleDone: {
    color: "var(--text-muted)",
    textDecoration: "line-through",
  },
  themeToggle: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
  },
  themeButton: {
    background: "#f0f0f0",
    width: "2.5rem",
    height: "2.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "1.5rem",
    padding: 0,
  },
};

export default App;
