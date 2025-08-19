// backend/server.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let db;

// MongoDB connection
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('expense_tracker');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Initialize database connection
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend API is running' });
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const expenses = await db.collection('expenses').find().sort({ createdAt: -1 }).toArray();
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const expense = {
      ...req.body,
      createdAt: new Date()
    };

    const result = await db.collection('expenses').insertOne(expense);
    
    res.status(201).json({
      _id: result.insertedId.toString(),
      ...expense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    
    // Handle both string and ObjectId formats
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const result = await db.collection('expenses').deleteOne(query);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
