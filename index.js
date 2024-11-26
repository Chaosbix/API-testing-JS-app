const express = require('express');
const HotelRoom = require('./models/HotelRoom');

// Create an Express app
const app = express();
app.use(express.json());


// CRUD Endpoints

// Create a Hotel Room
app.post('/rooms', async (req, res) => {
    try {
        const room = new HotelRoom(req.body);
        const savedRoom = await room.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Hotel Rooms
app.get('/rooms', async (req, res) => {
    try {
        const rooms = await HotelRoom.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a Single Hotel Room by ID
app.get('/rooms/:id', async (req, res) => {
    try {
        const room = await HotelRoom.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Hotel Room
app.put('/rooms/:id', async (req, res) => {
    try {
        const room = await HotelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.status(200).json(room);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a Hotel Room
app.delete('/rooms/:id', async (req, res) => {
    try {
        const room = await HotelRoom.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;

