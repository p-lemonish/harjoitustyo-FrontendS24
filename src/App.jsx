import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PlannedExerciseList from './components/PlannedExercises/PlannedExerciseList'
import PrivateRoute from './components/PrivateRoute'
import Login from './components/Auth/Login'
import Register from "./components/Auth/Register";
import { AuthContext } from "./context/AuthContext";
import AddPlannedExercise from "./components/PlannedExercises/AddPlannedExercise";

function App() {
  const { authState } = useContext(AuthContext)
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/planned-exercises" element={ <PrivateRoute element={ <PlannedExerciseList/> } />} />
        <Route path="/add-planned" element={ <PrivateRoute element={ <AddPlannedExercise/> } />} />
        <Route path="/" element={
          authState.isAuthenticated ? <Navigate to="/planned-exercises" replace /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App;