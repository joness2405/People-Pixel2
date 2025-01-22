//backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import the Finance model
const Finance = require('./models/Finance');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PeoplePixelDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schemas
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  phone: { type: String, default:''},
  email: { type: String, default: '' },
  profile: { type: String, default:''},
  category: { type: String, required: true },
});

const todoSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  text: { type: String, required: true },
  dueDate: { type: Date },
  priority: { type: String, default: 'Medium' }, // 'High', 'Medium', 'Low'
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Models
const Category = mongoose.model('Category', categorySchema);
const Contact = mongoose.model('Contact', contactSchema);
const Todo = mongoose.model('Todo', todoSchema);

// Category Routes
app.post('/api/categories', async (req, res) => {
  const category = new Category({ name: req.body.name });
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(400).json({ message: 'Error adding category', error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
});

// Contact Routes
app.post('/api/contacts', async (req, res) => {
  const { name, avatar, phone, profile, email, category } = req.body;
  
  if (!name || !category) {
    return res.status(400).json({ message: 'Name and category are required' });
  }

  const contact = new Contact({ name, avatar,phone, profile, email, category });
  
  try {
    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(400).json({ message: 'Error adding contact', error: error.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  const category = req.query.category;
  try {
    const query = category ? { category } : {};
    const contacts = await Contact.find(query);
    res.json(contacts);
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ message: 'Error retrieving contacts', error: error.message });
  }
});

// Get single contact
app.get('/api/contacts/:contactId', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error retrieving contact:', error);
    res.status(500).json({ message: 'Error retrieving contact', error: error.message });
  }
});

// Todo Routes
app.post('/api/contacts/:contactId/todos', async (req, res) => {
  const { contactId } = req.params;
  const { text, dueDate, priority } = req.body;

  try {
    // Verify contact exists
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const newTodo = new Todo({
      contactId,
      text,
      dueDate,
      priority,
      completed: false
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(400).json({ message: 'Error creating todo', error: error.message });
  }
});

app.get('/api/contacts/:contactId/todos', async (req, res) => {
  const { contactId } = req.params;
  
  try {
    // Verify contact exists
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const todos = await Todo.find({ contactId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Error fetching todos', error: error.message });
  }
});

// Update todo
app.put('/api/todos/:todoId', async (req, res) => {
  const { todoId } = req.params;
  const updateData = req.body;
  
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Error updating todo', error: error.message });
  }
});

// Delete todo
app.delete('/api/todos/:todoId', async (req, res) => {
  const { todoId } = req.params;
  
  try {
    const deletedTodo = await Todo.findByIdAndDelete(todoId);
    
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Error deleting todo', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



//for reminder

// Reminder schema
const reminderSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  isRecurring: { type: Boolean, default: false }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

// Reminder routes
app.get('/api/contacts/:contactId/reminders', async (req, res) => {
  try {
    const reminders = await Reminder.find({ contactId: req.params.contactId });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

app.post('/api/contacts/:contactId/reminders', async (req, res) => {
  const { text, date, time, isRecurring } = req.body;
  try {
    const newReminder = new Reminder({ contactId: req.params.contactId, text, date, time, isRecurring });
    await newReminder.save();
    res.json(newReminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reminder' });
  }
});

app.delete('/api/reminders/:id', async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});





// Finance Routes
//server.js
// Add a finance entry
app.post('/api/contacts/:contactId/finances', async (req, res) => {
  const { contactId } = req.params;
  const { date, description, amount, category, type } = req.body;

  try {
    const newFinance = new Finance({
      contactId,
      date,
      description,
      amount,
      category,
      type,
    });

    await newFinance.save();
    res.status(201).json(newFinance);
  } catch (error) {
    console.error('Error creating finance entry:', error);
    res.status(400).json({ message: 'Error creating finance entry', error: error.message });
  }
});

// Get all finance entries for a contact
app.get('/api/contacts/:contactId/finances', async (req, res) => {
  const { contactId } = req.params;

  try {
    const finances = await Finance.find({ contactId }).sort({ date: -1 });
    res.json(finances);
  } catch (error) {
    console.error('Error fetching finances:', error);
    res.status(500).json({ message: 'Error fetching finances', error: error.message });
  }
});

// Update a finance entry
app.put('/api/finances/:financeId', async (req, res) => {
  const { financeId } = req.params;
  const updateData = req.body;

  try {
    const updatedFinance = await Finance.findByIdAndUpdate(financeId, updateData, { new: true, runValidators: true });
    if (!updatedFinance) {
      return res.status(404).json({ message: 'Finance entry not found' });
    }
    res.json(updatedFinance);
  } catch (error) {
    console.error('Error updating finance entry:', error);
    res.status(500).json({ message: 'Error updating finance entry', error: error.message });
  }
});

// Delete a finance entry
app.delete('/api/finances/:financeId', async (req, res) => {
  const { financeId } = req.params;

  try {
    const deletedFinance = await Finance.findByIdAndDelete(financeId);
    if (!deletedFinance) {
      return res.status(404).json({ message: 'Finance entry not found' });
    }
    res.json({ message: 'Finance entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting finance entry:', error);
    res.status(500).json({ message: 'Error deleting finance entry', error: error.message });
  }
});