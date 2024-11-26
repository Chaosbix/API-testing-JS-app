const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Import the Express app
const HotelRoom = require('../models/HotelRoom'); // Import the HotelRoom model
const { it } = require('node:test');

// Connect to a test database before running tests
beforeAll(async () => {
    const dbURI = "mongodb://localhost:27017/hotel_booking_test";
    await mongoose.connect(dbURI);
    await HotelRoom.deleteMany();
});

// Setup: Insert specific rooms into the database before each test
beforeEach(async () => {
    await HotelRoom.create([
        { roomNumber: 101, roomType: 'Single', pricePerNight: 100, isBooked: false },
        { roomNumber: 102, roomType: 'Double', pricePerNight: 150, isBooked: false },
    ]);
});

// Teardown: Clear the database after each test
afterEach(async () => {
    await HotelRoom.deleteMany();
});

// Disconnect from the database after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Hotel Room API Tests', () => {
    it('should create a new room (happy path)', async () => {
        const response = await request(app)
            .post('/rooms')
            .send({ roomNumber: 103, roomType: 'Suite', pricePerNight: 200, isBooked: false });
        expect(response.status).toBe(201);
        expect(response.body.roomNumber).toBe(103);
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app).post('/rooms').send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/validation failed/i);
    });
    
    it('should return 400 for duplicate room numbers', async () => {
        const response = await request(app)
            .post('/rooms')
            .send({ roomNumber: 101, roomType: 'Suite', pricePerNight: 200, isBooked: false });
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/duplicate key/i);
    });

    it('should retrieve all rooms (happy path)', async () => {
        const response = await request(app).get('/rooms');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
    
    it('should return 500 if there is a database error', async () => {
        jest.spyOn(HotelRoom, 'find').mockRejectedValue(new Error('Database error'));
        const response = await request(app).get('/rooms');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
    });
    
    it('should retrieve a single room by ID (happy path)', async () => {
        const room = await HotelRoom.findOne({ roomNumber: 101 });
        const response = await request(app).get(`/rooms/${room._id}`);
        expect(response.status).toBe(200);
        expect(response.body.roomNumber).toBe(101);
    });
    
    it('should return 500 for invalid ID format', async () => {
        const response = await request(app).get('/rooms/invalid-id');
        expect(response.status).toBe(500);
        expect(response.body.error).toMatch(/cast to objectid failed/i);
    });
    
    it('should return 404 for a nonexistent room', async () => {
        const response = await request(app).get('/rooms/6418f1a1d2d15b001c2d9e72');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Room not found');
    });
    
    it('should update a room (happy path)', async () => {
        const room = await HotelRoom.findOne({ roomNumber: 101 });
        const response = await request(app)
            .put(`/rooms/${room._id}`)
            .send({ pricePerNight: 120 });
        expect(response.status).toBe(200);
        expect(response.body.pricePerNight).toBe(120);
    });
    
    it('should return 400 for invalid ID format', async () => {
        const response = await request(app).put('/rooms/invalid-id').send({ pricePerNight: 120 });
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/cast to objectid failed/i);
    });
    
    it('should return 404 for a nonexistent room', async () => {
        const response = await request(app)
            .put('/rooms/6418f1a1d2d15b001c2d9e72')
            .send({ pricePerNight: 120 });
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Room not found');
    });
    
    it('should return 400 for invalid update data', async () => {
        const room = await HotelRoom.findOne({ roomNumber: 101 });
        const response = await request(app)
            .put(`/rooms/${room._id}`)
            .send({ pricePerNight: -50 });
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/validation failed/i);
    });
    
    it('should delete a room (happy path)', async () => {
        const room = await HotelRoom.findOne({ roomNumber: 101 });
        const response = await request(app).delete(`/rooms/${room._id}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Room deleted successfully');
    });
    
    it('should return 500 for invalid ID format', async () => {
        const response = await request(app).delete('/rooms/invalid-id');
        expect(response.status).toBe(500);
        expect(response.body.error).toMatch(/cast to objectid failed/i);
    });
    
    it('should return 404 for a nonexistent room', async () => {
        const response = await request(app).delete('/rooms/6418f1a1d2d15b001c2d9e72');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Room not found');
    });    
});
