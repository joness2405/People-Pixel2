
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Contacts from './Contacts';
import IndividualContact from './IndividualContact';
//import AddContact from './components/AddContact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contact" element={<IndividualContact />} />
        {/* <Route path="/add-contact" element={<AddContact />} /> */}
      </Routes>
    </Router>
  );
}

export default App;