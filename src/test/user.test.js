import request from "supertest";
import { app } from "../app.js";
import { User } from "../models/userModel.js";

// Manually mock the User model methods
jest.mock("../models/userModel.js");

User.findOne = jest.fn();
User.findById = jest.fn();

describe("User Login API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should login a user successfully", async () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      password: "password123",
      token: "mocktoken",
      generateToken: jest.fn().mockResolvedValue("mocktoken"),
      checkPassword: jest.fn().mockResolvedValue(true),
      save: jest.fn()
    };

    User.findOne.mockResolvedValue(mockUser);
    User.findById.mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/v1/user/login") // Ensure this path matches your API route
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "User logged in successfully");
    expect(mockUser.checkPassword).toHaveBeenCalledWith("password123");
  });

  it("should fail when email is missing", async () => {
    const response = await request(app)
      .post("/api/v1/user/login")
      .send({
        password: "password123"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "All the fields are required");
  });

  it("should fail when password is incorrect", async () => {
    const mockUser = {
      email: "test@example.com",
      password: "password123",
      checkPassword: jest.fn().mockResolvedValue(false)
    };

    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/v1/user/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid password");
  });
});
