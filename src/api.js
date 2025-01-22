
 //src/api.js
 import axios from 'axios';
 const API_URL = 'http://localhost:5000/api';
 
 export const fetchContacts = async (category) => {
   try {
     const response = await fetch(`${API_URL}/contacts/${category}`);
     if (!response.ok) {
       throw new Error('Failed to fetch contacts');
     }
     return response.json();
   } catch (error) {
     console.error('Error:', error);
     throw error;
   }
 };
 
 export const addContact = async (contactData) => {
   try {
     const response = await fetch(`${API_URL}/contacts`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(contactData),
     });
     
     if (!response.ok) {
       throw new Error('Failed to add contact');
     }
     
     return response.json();
   } catch (error) {
     console.error('Error:', error);
     throw error;
   }
 };
 
 
 
 
 
 export const fetchTodos = async (contactId) => {
   const response = await axios.get(`${API_URL}/contacts/${contactId}/todos`);
   return response.data;
 };
 
 export const addTodo = async (contactId, newTodo) => {
   const response = await axios.post(`${API_URL}/contacts/${contactId}/todos`, newTodo);
   return response.data;
 };
 
 export const toggleTodo = async (todoId, completed) => {
   const response = await axios.put(`${API_URL}/todos/${todoId}`, { completed });
   return response.data;
 };
 
 export const updateTodo = async (todoId, updatedData) => {
   const response = await axios.put(`${API_URL}/todos/${todoId}`, updatedData);
   return response.data;
 };
 
 export const deleteTodo = async (todoId) => {
   await axios.delete(`${API_URL}/todos/${todoId}`);
 };
 
 
 //for reminder
 
 export const fetchReminders = async (contactId) => {
   const response = await axios.get(`${API_URL}/contacts/${contactId}/reminders`);
   return response.data;
 };
 
 export const addReminder = async (contactId, newReminder) => {
   const response = await axios.post(`${API_URL}/contacts/${contactId}/reminders`, newReminder);
   return response.data;
 };
 
 export const deleteReminder = async (reminderId) => {
   await axios.delete(`${API_URL}/reminders/${reminderId}`);
 };
 
 
 
 // Finance API functions
 //src/api.js
 export const fetchFinances = async (contactId) => {
   const response = await axios.get(`${API_URL}/contacts/${contactId}/finances`);
   return response.data;
 };
 
 export const addFinance = async (contactId, financeData) => {
   const response = await axios.post(`${API_URL}/contacts/${contactId}/finances`, financeData);
   return response.data;
 };
 
 export const updateFinance = async (financeId, updateData) => {
   const response = await axios.put(`${API_URL}/finances/${financeId}`, updateData);
   return response.data;
 };
 
 export const deleteFinance = async (financeId) => {
   await axios.delete(`${API_URL}/finances/${financeId}`);
 };