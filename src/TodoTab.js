// src/TodoTab.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoTab = ({ contactId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ text: '', dueDate: '', priority: 'Medium' });
  const [filter, setFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Due Date');

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/todos?contactId=${contactId}`);
        setTodos(response.data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };
    fetchTodos();
  }, [contactId]);

  const handleAddTodo = async () => {
    try {
      if (!newTodo.text || !newTodo.dueDate || !newTodo.priority) {
        alert('Please fill in all fields');
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/todos', {
        contactId,
        text: newTodo.text,
        dueDate: new Date(newTodo.dueDate),
        priority: newTodo.priority,
        completed: false,
      });

      // Append the new todo to the list without refetching all todos
      setTodos((prevTodos) => [...prevTodos, response.data]);
      setNewTodo({ text: '', dueDate: '', priority: 'Medium' });
    } catch (error) {
      console.error('Error adding todo:', error.response ? error.response.data : error.message);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${id}`, { completed: !completed });
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo._id === id ? { ...todo, completed: response.data.completed } : todo))
      );
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'Completed') return todo.completed;
    if (filter === 'Incomplete') return !todo.completed;
    return true;
  });

  const sortedTodos = filteredTodos.sort((a, b) => {
    if (sortOrder === 'Priority') {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div>
      <h2>Todo List</h2>

      {/* Add New Todo Form */}
      <div>
        <input
          type="text"
          placeholder="Todo text"
          value={newTodo.text}
          onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
        />
        <input
          type="date"
          value={newTodo.dueDate}
          onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
        />
        <select
          value={newTodo.priority}
          onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button onClick={handleAddTodo}>Add New Todo</button>
      </div>

      {/* Sorting and Filtering */}
      <div>
        <label>
          Filter Todos:
          <select onChange={(e) => setFilter(e.target.value)} value={filter}>
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Incomplete">Incomplete</option>
          </select>
        </label>
        <label>
          Sort By:
          <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
            <option value="Due Date">Due Date</option>
            <option value="Priority">Priority</option>
          </select>
        </label>
      </div>

      {/* Todo List */}
      <ul>
        {sortedTodos.map((todo) => (
          <li key={todo._id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo._id, todo.completed)}
            />
            <span>{todo.text}</span>
            <span> - {new Date(todo.dueDate).toLocaleDateString()}</span>
            <span> - Priority: {todo.priority}</span>
            <button onClick={() => handleDeleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoTab;
