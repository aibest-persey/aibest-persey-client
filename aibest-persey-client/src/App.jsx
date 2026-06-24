import { Routes, Route, Navigate } from "react-router-dom"
import SignIn from "./pages/SignIn.jsx"
import SignUp from "./pages/SignUp.jsx"
import Home from "./pages/Home.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  )
}
