import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const BASE_URL =
    "https://habit-tracker-bur8.onrender.com/api/habits";

  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // 🔐 AUTH STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token]);

  // =====================
  // LOGIN
  // =====================
  const login = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setIsLoggedIn(true);

      fetchHabits();
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  // =====================
  // LOGOUT
  // =====================
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setIsLoggedIn(false);
    setHabits([]);
  };

  // =====================
  // GET habits
  // =====================
  const fetchHabits = () => {
    axios
      .get(BASE_URL, {
        headers: { Authorization: token },
      })
      .then((res) => setHabits(res.data))
      .catch((err) => console.log(err));
  };

  // =====================
  // ADD habit
  // =====================
  const addHabit = () => {
    if (!title.trim()) return;

    axios
      .post(
        BASE_URL,
        { title },
        { headers: { Authorization: token } }
      )
      .then(() => {
        setTitle("");
        fetchHabits();
      })
      .catch((err) => console.log(err));
  };

  // =====================
  // DELETE
  // =====================
  const deleteHabit = (id) => {
    axios
      .delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: token },
      })
      .then(() => fetchHabits())
      .catch((err) => console.log(err));
  };

  // =====================
  // TOGGLE
  // =====================
  const toggleHabit = (id) => {
    axios
      .put(
        `${BASE_URL}/${id}`,
        {},
        { headers: { Authorization: token } }
      )
      .then(() => fetchHabits())
      .catch((err) => console.log(err));
  };

  // =====================
  // EDIT
  // =====================
  const startEdit = (habit) => {
    setEditId(habit._id);
    setEditText(habit.title);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;

    axios
      .put(
        `${BASE_URL}/${id}`,
        { title: editText },
        { headers: { Authorization: token } }
      )
      .then(() => {
        setEditId(null);
        setEditText("");
        fetchHabits();
      })
      .catch((err) => console.log(err));
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "500px",
        margin: "auto",
        fontFamily: "Arial",
        textAlign: "center",
      }}
    >
      <h1>🔥 Habit Tracker</h1>

      {/* ================= LOGIN ================= */}
      {!isLoggedIn ? (
        <div style={{ marginBottom: "20px" }}>
          <h3>Login</h3>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ margin: "5px", padding: "8px" }}
          />

          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ margin: "5px", padding: "8px" }}
          />

          <br />

          <button
            onClick={login}
            style={{
              padding: "8px 12px",
              marginTop: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Login
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <p>✅ Logged in</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      {/* ================= HABITS ================= */}
      {isLoggedIn && (
        <>
          {/* ADD */}
          <div style={{ marginBottom: "20px" }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter new habit"
              style={{
                padding: "10px",
                width: "70%",
                borderRadius: "5px",
                border: "1px solid gray",
              }}
            />

            <button
              onClick={addHabit}
              style={{
                marginLeft: "10px",
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
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
                  padding: "10px",
                  border: "1px solid #ddd",
                  marginBottom: "10px",
                  flexDirection: "column",
                  textAlign: "left",
                }}
              >
                {/* MAIN INFO */}
                <span style={{ flex: 1 }}>
                  {habit.title}{" "}
                  {habit.completed ? "✅" : "❌"}
                  <br />
                  (XP: {habit.xp} | Level: {habit.level} | 🔥 Streak: {habit.streak})
                </span>

                {/* 🏆 BADGES */}
                {habit.badges && habit.badges.length > 0 && (
                  <div style={{ marginTop: "5px", fontSize: "12px" }}>
                    🏆 Badges: {habit.badges.join(", ")}
                  </div>
                )}

                {/* BUTTONS */}
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => toggleHabit(habit._id)}>
                    Toggle
                  </button>

                  <button onClick={() => startEdit(habit)}>
                    Edit
                  </button>

                  <button onClick={() => deleteHabit(habit._id)}>
                    Delete
                  </button>
                </div>

                {/* EDIT INPUT */}
                {editId === habit._id && (
                  <div style={{ marginTop: "10px" }}>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button onClick={() => saveEdit(habit._id)}>
                      Save
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;