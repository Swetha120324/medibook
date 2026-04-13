import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

/* 🏠 HOME */
function Home() {
  const handleEmergency = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const url = `https://www.google.com/maps/search/hospitals/@${lat},${lon},15z`;
          window.open(url, "_blank");
        },
        () => {
          alert("❌ Location denied!\nEnable GPS to find nearest hospitals.");
        }
      );
    } else {
      alert("❌ Geolocation not supported!");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">🏥 MediBook</h1>
        <p className="subtitle">Smart • Fast • Reliable Healthcare Booking</p>

        <Link to="/booking">
          <button className="btn btn-main">Start Booking</button>
        </Link>

        <Link to="/admin-login">
          <button className="btn btn-back">Admin View</button>
        </Link>

        {/* 🚨 Emergency */}
        <button className="btn emergency-btn" onClick={handleEmergency}>
          🚨 Emergency (Nearest Hospital)
        </button>
      </div>
    </div>
  );
}

/* 📅 BOOKING */
function Booking({ appointments, setAppointments }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [symptom, setSymptom] = useState("");
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const doctorsData = {
    "Fever / Body Pain": [
      { name: "Dr. Kumar", rating: 4.5 },
      { name: "Dr. Suresh", rating: 4.2 },
      { name: "Dr. Priya", rating: 4.6 },
      { name: "Dr. Arun", rating: 4.1 },
      { name: "Dr. Divya", rating: 4.4 }
    ],
    "Cold / Cough": [
      { name: "Dr. Manoj", rating: 4.3 },
      { name: "Dr. Kavitha", rating: 4.5 },
      { name: "Dr. Ramesh", rating: 4.2 },
      { name: "Dr. Sneha", rating: 4.6 },
      { name: "Dr. Ajay", rating: 4.1 }
    ],
    "Dental Issues": [
      { name: "Dr. Ravi", rating: 4.8 },
      { name: "Dr. Meena", rating: 4.3 },
      { name: "Dr. Karthik", rating: 4.6 },
      { name: "Dr. Anitha", rating: 4.2 },
      { name: "Dr. Sanjay", rating: 4.5 }
    ]
  };

  const suggestions = Object.keys(doctorsData);

  const timeSlots = ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","04:00 PM","06:00 PM"];

  const getAvailableSlots = () => {
    if (!date) return timeSlots;

    const selectedDate = new Date(date);
    const today = new Date();

    if (selectedDate.toDateString() !== today.toDateString()) return timeSlots;

    const currentHour = today.getHours();

    return timeSlots.filter((slot) => {
      let hour = parseInt(slot);
      if (slot.includes("PM") && hour !== 12) hour += 12;
      if (slot.includes("AM") && hour === 12) hour = 0;
      return hour > currentHour;
    });
  };

  /* 🧾 RECEIPT */
  const downloadReceipt = (booking) => {
    const content = `
----- MediBook Receipt -----

Booking ID: ${booking.id}
Patient Name: ${booking.name}
Doctor: ${booking.doctor}
Date: ${booking.date}
Time: ${booking.time}

Thank you!
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSuggest = () => {
    if (!symptom) return alert("Enter symptom!");
    const matched = Object.keys(doctorsData).find((key) =>
      symptom.toLowerCase().includes(key.toLowerCase().split(" ")[0])
    );
    setDoctorList(matched ? doctorsData[matched] : doctorsData["Fever / Body Pain"]);
    setStep(2);
  };

  const confirmFinal = () => {
    if (!selectedDoctor || !patientName || !date || !time) {
      return alert("Fill all details!");
    }

    const bookingId = "MB" + Math.floor(1000 + Math.random() * 9000);

    const newBooking = {
      id: bookingId,
      name: patientName,
      doctor: selectedDoctor,
      date,
      time
    };

    setAppointments((prev) => [...prev, newBooking]);

    downloadReceipt(newBooking);

    navigate("/thankyou");
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Book Appointment</h2>

        {step === 1 && (
          <>
            <input className="input" placeholder="Enter symptom" value={symptom} onChange={(e) => setSymptom(e.target.value)} />

            {suggestions.map((s, i) => (
              <p key={i} className="suggestion" onClick={() => setSymptom(s)}>
                {s}
              </p>
            ))}

            <button className="btn btn-main" onClick={handleSuggest}>Find Doctor</button>
          </>
        )}

        {step === 2 && doctorList.map((doc, i) => (
          <div key={i} className="doc-card">
            <p>{doc.name} ⭐{doc.rating}</p>
            <button className="btn btn-main" onClick={() => { setSelectedDoctor(doc.name); setStep(3); }}>Select</button>
          </div>
        ))}

        {step === 3 && (
          <>
            <input className="input" placeholder="Patient Name" onChange={(e) => setPatientName(e.target.value)} />
            <input className="input" type="date" onChange={(e) => setDate(e.target.value)} />

            <select className="input" onChange={(e) => setTime(e.target.value)}>
              <option value="">Select Time</option>
              {getAvailableSlots().map((slot, i) => <option key={i}>{slot}</option>)}
            </select>

            <button className="btn btn-main" onClick={confirmFinal}>
              Confirm & Download Receipt
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* THANK YOU */
function ThankYou() {
  return (
    <div className="container">
      <div className="card">
        <h2>✅ Booking Confirmed</h2>
        <Link to="/"><button className="btn btn-main">Home</button></Link>
      </div>
    </div>
  );
}

/* ADMIN LOGIN */
function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const login = () => {
    if (password === "admin123") {
      navigate("/dashboard", { replace: true });
    } else {
      alert("Wrong Password");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Login</h2>
        <input type="password" className="input" onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-main" onClick={login}>Login</button>
      </div>
    </div>
  );
}

/* ADMIN */
function Admin({ appointments, setAppointments }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const logout = () => navigate("/admin-login", { replace: true });

  const filtered = appointments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const cancel = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="container">
      <div className="card admin-card">

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Admin Dashboard</h2>
          <button className="btn btn-back" onClick={logout}>Logout</button>
        </div>

        <input className="input" placeholder="Search patient" onChange={(e) => setSearch(e.target.value)} />

        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Doctor</th><th>Date</th><th>Time</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={i}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.doctor}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <button className="btn btn-back" onClick={() => cancel(a.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

/* 🌐 MAIN */
function App() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("appointments");
    if (saved) setAppointments(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking appointments={appointments} setAppointments={setAppointments} />} />
        <Route path="/thankyou" element={<ThankYou />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Admin appointments={appointments} setAppointments={setAppointments} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;