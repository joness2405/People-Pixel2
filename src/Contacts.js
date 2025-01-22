
// src/Contacts.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './styles.css';
import axios from 'axios';
import { FaChevronLeft,FaPlusCircle } from 'react-icons/fa';
import logo from './logo.png'; 

const Contacts = () => {
 
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get('category');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [base64Image, setBase64Image] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    avatar: '',
    email: '',
    phone:'',
    profile:'',
    category: category,
  });
  const [contacts, setContacts] = useState([]);

  // Fetch contacts by category
  useEffect(() => {
  
    const fetchContacts = async () => {
      
      try {
        const response = await axios.get(`http://localhost:5000/api/contacts?category=${category}`);
        setContacts(response.data);
     //   localStorage.setItem('items', JSON.stringify(response));
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    fetchContacts();
  }, [category]);

  const handleInputChange = (e) => {
    debugger;
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };


// Function to convert file to Base64 format
const handleFileToBase64Conversion = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// React Component File Input Example

  const handleFileChange = async (e) => {
    debugger;
    const file = e.target.files[0];
    if (file) {
      const base64 = await handleFileToBase64Conversion(file);
     const base641=base64.replace('+', '.');
     const base642=base641.replace('/', '_');
     const base643=base642.replace('=', '-');
     
      setBase64Image(base643);
      console.log(base643);

    }
  };

  

  const handleAddContact = async () => {
    if (!newContact.name) {
      alert('Please enter a name for the contact.');
      return;
    }

    try {
      debugger;
       newContact.profile= base64Image;
      const response = await axios.post('http://localhost:5000/api/contacts', newContact);
      setContacts([...contacts, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding contact:', error.response ? error.response.data : error.message);
      alert(`Failed to add contact. ${error.response ? error.response.data.message : 'Please try again.'}`);
    }
  };

  return (
    <>
      <header className="header">
        {/* //<div className="logo">PeoplePixel - {category}</div> */}
        <div className="logo">
        <img src={logo} alt="PeoplePixel Logo" />
        </div>
        <div className="logo-text">{category} </div>
        <input type="text" placeholder="Search..." className="search-bar" />

      </header>
      <h2>
      <button className="back-button" onClick={() => window.history.back()}>
        <FaChevronLeft className="icon" /> Contacts
      </button>
        <button className="add-contact" onClick={() => setIsModalOpen(true)}><FaPlusCircle className="icon" />Add Contact</button>
      </h2>
     
      <div className="container">
        {contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <Link
              key={index}
              className="card"
              to={`/contact?name=${contact.name}&avatar=${contact.avatar}&phone=${contact.phone}&profile=${contact.profile}&email=${contact.email}&category=${contact.category}&contactId=${contact._id}`}
            >
           
              {/* <div><img src={contact.profile.replace('.', '+').replace('_', '/').replace('-', '=').replace(/\s/g, "+")}
              alt={`${contact.avatar}`} 
                /></div> */}
                <div className="avatar-container">
          <img
            className="avatar-image"
            src={contact.profile.replace('.', '+').replace('_', '/').replace('-', '=').replace(/\s/g, "+")}
            alt={`${contact.avatar}`}
          />
        </div>
              <p className="name">{contact.name}</p>
            </Link>
          ))
        ) : (
          <p>No contacts found for this category.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Contact</h2>
            <form>
              <label>Name:</label>
              <input type="text" name="name" value={newContact.name} onChange={handleInputChange} required />
              <label>Avatar:</label>
              <input type="text" name="avatar" value={newContact.avatar} onChange={handleInputChange} maxLength="1" />
              <label>Email:</label>
              <input type="text" name="email" value={newContact.email} onChange={handleInputChange} />
              <label>Phone Number:</label>
              <input type="text" name="phone" value={newContact.phone} onChange={handleInputChange}  />
              <label>Profile Picture:</label>
              <input type="file" name="profile" onChange={handleFileChange} />

            </form>
            <button onClick={handleAddContact}>Save</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Contacts;
