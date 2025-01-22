

// src/IndividualContact.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchTodos, addTodo, toggleTodo, updateTodo, deleteTodo, fetchReminders, addReminder, updateReminder, deleteReminder,fetchFinances, addFinance, updateFinance, deleteFinance } from './api';
import './styles.css';
import { FaCheckSquare, FaBell, FaMoneyBillWave, FaPlusCircle, FaChevronLeft } from 'react-icons/fa';
import Calendar from 'react-calendar';
import {format} from 'date-fns';
import example from './example.jpg'; 


  const IndividualContact = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const name = params.get('name');
  const avatar = params.get('avatar');
  const phone = params.get('phone');
  const email = params.get('email');
  const profile = params.get('profile');

 var profile1=profile.replace('.', '+').replace('_', '/').replace('-', '=').replace(/\s/g, "+");

 console.log(profile1);
  const contactId = params.get('contactId');


  const [activeTab, setActiveTab] = useState('todo');
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState('Medium');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [isTodoFormVisible, setTodoFormVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  //reminder
  const [reminders, setReminders] = useState([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isReminderFormVisible, setReminderFormVisible] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(true);
  const [selectedDateReminders, setSelectedDateReminders] = useState([]);

  //finance
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    description: '',
    amount: '',
    category: '',
    type: 'income', 
  });
  const [isTransactionFormVisible, setTransactionFormVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingTransactionId, setEditingTransactionId] = useState(null);



  useEffect(() => {
    console.log(format(new Date("2021-07-14T00:00:00.000Z"), 'yyyy-MM-dd'));
    const loadTodos = async () => {
      try {
        setLoading(true);
        const todoData = await fetchTodos(contactId);
        setTodos(todoData);
      } catch (err) {
        setError('Failed to load todos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [contactId]);


  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      const newTodo = {
        text: newTodoText,
        priority: newTodoPriority,
        dueDate: newTodoDueDate
      };
      const response = await addTodo(contactId, newTodo);
      setTodos([...todos, response]);
      setNewTodoText('');
      setNewTodoPriority('Medium');
      setNewTodoDueDate('');
      setTodoFormVisible(false);
    } catch (err) {
      setError('Failed to add todo: ' + err.message);
    }
  };

  const handleUpdateTodo = async (todoId) => {
    try {
      const updatedTodo = await updateTodo(todoId, {
        text: newTodoText,
        priority: newTodoPriority,
        dueDate: newTodoDueDate
      });
      setTodos(todos.map(todo => (todo._id === todoId ? updatedTodo : todo)));
      setSelectedTodo(null); // Close the update form
    } catch (err) {
      setError('Failed to update todo: ' + err.message);
    }
    
  };

  const handleDeleteTodo = async (todoId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this todo?");
    if (confirmDelete) {
      try {
        await deleteTodo(todoId);
        setTodos(todos.filter(todo => todo._id !== todoId));
      } catch (err) {
        setError('Failed to delete todo: ' + err.message);
      }
    }
  };

    //loads reminder if active
    useEffect(() => {
      if (activeTab === 'reminder') {
        loadReminders();
      }
    }, [activeTab, contactId]);
  
    const loadReminders = async () => {
      try {
        const reminderData = await fetchReminders(contactId);
        setReminders(reminderData);
      } catch (error) {
        console.error('Failed to load reminders:', error);
      }
    };
  
    const handleAddReminder = async (e) => {
      e.preventDefault();
      const newReminder = {
        text: newReminderText,
        date: newReminderDate,
        time: newReminderTime,
        isRecurring,
      };
      try {
        const addedReminder = await addReminder(contactId, newReminder);
        setReminders([...reminders, addedReminder]);
        setNewReminderText('');
        setNewReminderDate('');
        setNewReminderTime('');
        setIsRecurring(false);
      } catch (error) {
        console.error('Failed to add reminder:', error);
      }
    };
  
    const handleDeleteReminder = async (reminderId) => {
      try {
        await deleteReminder(reminderId);
        setReminders(reminders.filter(reminder => reminder._id !== reminderId));
      } catch (error) {
        console.error('Failed to delete reminder:', error);
      }
    };

    const handleDayClick = (date) => {
      const remindersForDate = reminders.filter(reminder => 
        new Date(reminder.date).toDateString() === date.toDateString()
      );
      setSelectedDateReminders(remindersForDate);
    };

    const toggleView = () => setIsCalendarView(!isCalendarView);
  
    const notifyDueReminders = () => {
      reminders.forEach(reminder => {
        const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
        if (reminderDate - new Date() < 60000) { // Check if reminder is within the next minute
          if (Notification.permission === 'granted') {
            new Notification('Reminder', { body: reminder.text });
          }
        }
      });
    };
  

    useEffect(() => {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      const interval = setInterval(notifyDueReminders, 60000); // Check every minute
      return () => clearInterval(interval);
    }, [reminders]);

    //end for crud for reminder

  const filteredAndSortedTodos = todos
    .filter(todo => {
      if (filterPriority && todo.priority !== filterPriority) return false;
      if (filterStatus && (filterStatus === "completed" ? !todo.completed : todo.completed)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "date") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortOption === "priority") {
        const priorities = { High: 1, Medium: 2, Low: 3 };
        return priorities[a.priority] - priorities[b.priority];
      } else if (sortOption === "status") {
        return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1;
      }
      return 0;
    });

 

  const handleToggleTodo = async (todoId, completed) => {
    try {
      const updatedTodo = await toggleTodo(todoId, !completed);
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo._id === todoId ? updatedTodo : todo
        )
      );
    } catch (err) {
      setError('Failed to update todo: ' + err.message);
    }
  };

  const showUpdateForm = (todo) => {
    setSelectedTodo(todo);
    setNewTodoText(todo.text);
    setNewTodoPriority(todo.priority);
    setNewTodoDueDate(todo.dueDate.split('T')[0]);
  };

  const resetFilters = () => {
    setFilterPriority('');
    setFilterStatus('');
    setSortOption('');
  };

    // Function to add or edit a transaction

    useEffect(() => {
      const loadFinances = async () => {
        try {
          const financeData = await fetchFinances(contactId);
          setTransactions(financeData); 
        } catch (error) {
          console.error('Error loading finances:', error);
        }
      };
      loadFinances();
    }, [contactId]);
    
    const handleSaveTransaction = async (e) => {
      debugger;
      var selectedTransaction=selectedTransaction;
      const amount = parseFloat(newTransaction.amount);
      if (!amount || !newTransaction.description || !newTransaction.date) return alert("Fill all fields");
  
      const updatedTransaction = {
        ...newTransaction,
        amount: newTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      };
  
      if (editIndex !== null) {
        const updatedTransactions = [...transactions];
        updatedTransactions[editIndex] = updatedTransaction;
        setTransactions(updatedTransactions);
        setEditIndex(null);
      } else {
        setTransactions([...transactions, updatedTransaction]);
      }
      const financeData = await addFinance(contactId, updatedTransaction);
      setNewTransaction({ date: '', description: '', amount: '', category: '', type: 'income', financeData });

      setTransactionFormVisible(false);
    };  
  

    // Update the handleEditTransaction function

const handleEditTransaction = (transaction) => {
  debugger;
  //transaction.date=transaction.toDateString('DD-MM-YYYY');
  transaction.date=format(new Date(transaction.date), 'yyyy-MM-dd');
  setSelectedTransaction(transaction);
  setNewTransaction(transaction)
  setIsEditMode(true);
  setTransactionFormVisible(false);
};

// Add the handleUpdateTransaction function
const handleUpdateTransaction = async (e) => {
  debugger;
  e.preventDefault();
  
  try {
    if (!selectedTransaction._id) {
      throw new Error('Transaction ID is required for update');
    }

    const amount = parseFloat(selectedTransaction.amount);
    if (isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    const updatedTransaction = {
      date: selectedTransaction.date,
      description: selectedTransaction.description,
      amount: selectedTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      category: selectedTransaction.category,
      type: selectedTransaction.type
    };

    // Call API to update the transaction
    const response = await updateFinance(selectedTransaction._id, updatedTransaction);

    // Update local state
    setTransactions(prevTransactions =>
      prevTransactions.map(t => 
        t._id === selectedTransaction._id ? response : t
      )
    );

    // Reset form state
    setIsEditMode(false);
   // setSelectedTransaction(null);
    setTransactionFormVisible(false);

  } catch (error) {
    console.error('Error updating transaction:', error);
    alert('Failed to update transaction: ' + error.message);
  }
};


    // Handle deleting a transaction
const handleDeleteTransaction = async (transactionId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
  if (!confirmDelete) return;

  try {
    await deleteFinance(transactionId);
    setTransactions(prevTransactions => 
      prevTransactions.filter(t => t._id !== transactionId)
    );
  } catch (error) {
    console.error('Error deleting transaction:', error);
    alert('Failed to delete transaction');
  }
};


    
    const handleCancelEdit = () => {
      setIsEditMode(false); // Cancel editing and reset form
      setSelectedTransaction(null);  // Reset selected transaction
    };
  
    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netTotal = totalIncome - totalExpense;

return (



  


  <div className="individual-contact">
    <header className="header">
      <button className="back-button" onClick={() => window.history.back()}>
        <FaChevronLeft className="icon" /> Contacts
      </button>
    </header>



    <div className="contact-summary">
    
      <div className="contact-photo">
      <img src={profile1 || example} alt={`${avatar}`}  />

     

     
      </div>
      <h2>{name || "Contact"}</h2>
      <h3>Contact Num:{phone || "phone"}</h3>
      <h3>Email:{email || "Contact"}</h3>
    </div>

    <div className="tab-bar">
      <button className={`tab ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>
        <FaCheckSquare className="icon" /> Todo
      </button>
      <button className={`tab ${activeTab === 'reminder' ? 'active' : ''}`} onClick={() => setActiveTab('reminder')}>
        <FaBell className="icon" /> Reminder
      </button>
      <button className={`tab ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
        <FaMoneyBillWave className="icon" /> Finance
      </button>
    </div>

    <div className="tab-content">
      
      {activeTab === 'todo' && (
        <div className="todo-content">
          <div className="sorting-filtering">
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="">Sort by</option>
              <option value="date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>

            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">Filter by Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Filter by Status</option>
              <option value="completed">Completed</option>
              <option value="notCompleted">Not Completed</option>
            </select>

            <button onClick={resetFilters} className="cancel-filters-button">Cancel Filters</button>
          </div>

          <button className="add-todo-button" onClick={() => setTodoFormVisible(true)}>
            <FaPlusCircle className="icon" /> Add New Todo
          </button>

          {isTodoFormVisible && (
            <div className="todo-form-overlay">
              <form onSubmit={handleAddTodo} className="todo-form">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="New todo text"
                  required
                />
                <select value={newTodoPriority} onChange={(e) => setNewTodoPriority(e.target.value)}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <input type="date" value={newTodoDueDate} onChange={(e) => setNewTodoDueDate(e.target.value)} />
                <button type="submit">Save Todo</button>
                <button type="button" onClick={() => setTodoFormVisible(false)}>Cancel</button>
              </form>
            </div>
          )}

          <div className="todo-list">
            {loading ? (
              <p>Loading todos...</p>
            ) : filteredAndSortedTodos.map(todo => (
              <div key={todo._id} className="todo-item">
                <span>{todo.text}</span>
                <span>{todo.priority}</span>
                <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                <button onClick={() => showUpdateForm(todo)}>Update</button>
                <button onClick={() => handleDeleteTodo(todo._id)}>Delete</button>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo._id, todo.completed)}
                />
              </div>
            ))}
          </div>

          {selectedTodo && (
            <div className="centered-container">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTodo(selectedTodo._id);
              }} className="update-form">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  required
                />
                <select value={newTodoPriority} onChange={(e) => setNewTodoPriority(e.target.value)}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <input type="date" value={newTodoDueDate} onChange={(e) => setNewTodoDueDate(e.target.value)} />
                <button type="submit">Update Todo</button>
                <button type="button" onClick={() => setSelectedTodo(null)}>Cancel</button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reminder' && (
        <div className="reminder-content">
          <button className="add-reminder-button" onClick={() => setReminderFormVisible(!isReminderFormVisible)}>
            <FaPlusCircle className="icon" /> Add New Reminder
          </button>


      <button onClick={toggleView} className="view-toggle-button">
        {isCalendarView ? 'Switch to List View' : 'Switch to Calendar View'}
      </button>

      {isCalendarView ? (
        <div className="full-screen-calendar">
          <Calendar onClickDay={handleDayClick} />
          <div className="reminders-on-date">
            <h3>Reminders</h3>
            {selectedDateReminders.length > 0 ? (
              selectedDateReminders.map(reminder => (
                <div key={reminder._id} className="reminder-item">
                  <span>{reminder.text}</span>
                  <span>{reminder.time}</span>
                  <button onClick={() => handleDeleteReminder(reminder._id)}>Delete</button>
                </div>
              ))
            ) : (
              <p>No reminders for this date.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="reminder-list-view">
          <h3>Upcoming Reminders</h3>
          {reminders.map(reminder => (
            <div key={reminder._id} className="reminder-item">
              <span>{reminder.text}</span>
              <span>{reminder.date} {reminder.time}</span>
              <button onClick={() => handleDeleteReminder(reminder._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

        {isReminderFormVisible && (
          <div className="reminder-form-overlay">
        <form onSubmit={handleAddReminder} className="reminder-form">
          <input
            type="text"
            value={newReminderText}
            onChange={(e) => setNewReminderText(e.target.value)}
            placeholder="Reminder text"
            required
          />
          <input
            type="date"
            value={newReminderDate}
            onChange={(e) => setNewReminderDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={newReminderTime}
            onChange={(e) => setNewReminderTime(e.target.value)}
            required
          />
          <label>
            Recurring
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
            />
          </label>
          <button type="submit">Save Reminder</button>
          <button type="button" onClick={() => setReminderFormVisible(false)}>
            Cancel
          </button>
        </form>
        </div>
      )}
        </div>
      )}

  
{activeTab === 'finance' && (


<div>
      {/* Summary of Financial Status */}
      <div className="finance-summary">
        <h2>Financial Summary</h2>
        <p>Total Income: ₹{totalIncome.toFixed(2)}</p>
        <p>Total Expense: ₹{totalExpense.toFixed(2)}</p>
        <p>Net Total: ₹{netTotal.toFixed(2)}</p>
      </div>

      {/* Add New Transaction Button */}
      <button  className="add-reminder-button" onClick={() => setTransactionFormVisible(true)}>
      <FaPlusCircle className="icon" /> Add New Transaction
      </button>


      {/* Transaction Form */}
      {isTransactionFormVisible && (
        <div className="transaction-form-overlay">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveTransaction(e); }} className="transaction-form">
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              required
            />
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              required
            >
              <option value="">Category</option>
              <option value="loans">Loans</option>
              <option value="expenses">Expenses</option>
              <option value="payments">Payments</option>
            </select>
            <label>
              <input
                type="radio"
                value="income"
                checked={newTransaction.type === 'income'}
                onChange={() => setNewTransaction({ ...newTransaction, type: 'income' })}
              />
              Income
            </label>
            <label>
              <input
                type="radio"
                value="expense"
                checked={newTransaction.type === 'expense'}
                onChange={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
              />
              Expense
            </label>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setTransactionFormVisible(false)}>Cancel</button>
          </form>
        </div>
      )}

<div>
      {isEditMode ? (
        <div className="transaction-form-overlay">
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateTransaction(e); }} className="transaction-form">
            <input
              type="date"
              value={selectedTransaction.date}
              onChange={(e) => setSelectedTransaction({ ...selectedTransaction, date: e.target.value })}
              required
            />
            <input
              type="text"
              value={selectedTransaction.description}
              onChange={(e) => setSelectedTransaction({ ...selectedTransaction, description: e.target.value })}
              required
            />
            <input
              type="number"
              value={selectedTransaction.amount}
              onChange={(e) => setSelectedTransaction({ ...selectedTransaction, amount: e.target.value })}
              required
            />
            <select
              value={selectedTransaction.category}
              onChange={(e) => setSelectedTransaction({ ...selectedTransaction, category: e.target.value })}
              required
            >
              <option value="">Category</option>
              <option value="loans">Loans</option>
              <option value="expenses">Expenses</option>
              <option value="payments">Payments</option>
            </select>
            <button type="submit">Save</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
          </form>
        </div>
      ) : (
        <div className="transaction-list">
  {transactions.length > 0 ? (
    transactions.map((transaction) => (
      <div key={transaction._id} className="transaction-item">
        <div className="transaction-details">
        <p>Date: {transaction.date}</p>
        <p>Description: {transaction.description}</p>
        <p style={{ color: transaction.amount < 0 ? 'red' : 'green' }}>Amount: ₹{transaction.amount}</p>
        <p>Category: {transaction.category}</p>
        </div>
        <div className="transaction-actions">
        <button  className="edit-button" onClick={() => handleEditTransaction(transaction)}>Edit</button>
        <button className="delete-button" onClick={() => handleDeleteTransaction(transaction._id)}>Delete</button>
        </div>
      </div>
    ))
  ) : (
    <p>No transactions found.</p>
  )}
</div>
      )}
    </div>

    </div>
 )}   
    </div>
  </div>
  
)};


export default IndividualContact;
