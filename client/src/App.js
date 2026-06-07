import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const BASE_URL = "https://habit-tracker-bur8.onrender.com/api/habits";

  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchHabits();
  }, []);

  // GET habits
  const fetchHabits = () => {
    axios
      .get(BASE_URL)
      .then((res) => setHabits(res.data))
      .catch((err) => console.log(err));
  };

  // ADD habit
  const addHabit = () => {
    if (!title.trim()) return;

    axios
      .post(BASE_URL, { title })
      .then(() => {
        setTitle("");
        fetchHabits();
      })
      .catch((err) => console.log(err));
  };

  // DELETE habit
  const deleteHabit = (id) => {
    axios
      .delete(`${BASE_URL}/${id}`)
      .then(() => fetchHabits())
      .catch((err) => console.log(err));
  };

  // TOGGLE complete / undo
  const toggleHabit = (id) => {
    axios
      .put(`${BASE_URL}/${id}`)
      .then(() => fetchHabits())
      .catch((err) => console.log(err));
  };

  // START edit
  const startEdit = (habit) => {
    setEditId(habit._id);
    setEditText(habit.title);
  };

  // SAVE edit
  const saveEdit = (id) => {
    if (!editText.trim()) return;

    axios
      .put(`${BASE_URL}/${id}`, {
        title: editText,
      })
      .then(() => {
        setEditId(null);
        setEditText("");
        fetchHabits();
      })
      .catch((err) => console.log(err));
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px", margin: "auto", fontFamily: "Arial", textAlign: "center" }}>
      <h1>🔥 Habit Tracker</h1>

      {/* ADD */}
      <div style={{ marginBottom: "20px" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter new habit"
          style={{ padding: "10px", width: "70%", borderRadius: "5px", border: "1px solid gray" }}
        />

        <button
          onClick={addHabit}
          style={{ marginLeft: "10px", padding: "10px", borderRadius: "5px", border: "none", backgroundColor: "#28a745", color: "white", cursor: "pointer" }}
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {habits.map((habit) => (
          <li
            key={habit._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              backgroundColor: habit.completed ? "#e6ffe6" : "#f9f9f9",
            }}
          >
            {/* TITLE + STATUS */}
            <span style={{ flex: 1 }}>
              {habit.title}{" "}
              {habit.completed ? (
                <span style={{ color: "green", fontWeight: "bold" }}>✅</span>
              ) : (
                <span style={{ color: "red", fontWeight: "bold" }}>❌</span>
              )}
            </span>

            {/* COMPLETE / UNDO */}
            <button
              onClick={() => toggleHabit(habit._id)}
              style={{
                backgroundColor: habit.completed ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "5px",
              }}
            >
              {habit.completed ? "Undo" : "Complete"}
            </button>

            {/* EDIT */}
            {editId === habit._id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ marginRight: "5px", padding: "5px", borderRadius: "4px", border: "1px solid gray" }}
                />

                <button
                  onClick={() => saveEdit(habit._id)}
                  style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", marginRight: "5px" }}
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => startEdit(habit)}
                style={{ backgroundColor: "#ffc107", color: "black", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", marginRight: "5px" }}
              >
                Edit
              </button>
            )}

            {/* DELETE */}
            <button
              onClick={() => deleteHabit(habit._id)}
              style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;