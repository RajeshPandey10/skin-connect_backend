const request = require("supertest");
const app = require("../app"); // import your app or server file
const User = require("../models/userModel"); // path to your User model
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";

let mongoServer;
const ApiError = require("../utils/ApiError"); // path to your ApiError class

jest.mock("../models/userModel");
jest.mock("../utils/generateToken");

describe("POST /login", () => {
  it("should log in user with correct credentials", async () => {
    const userData = {
      email: "lijulimbu1221@gmail.com",
      password: "lliijjuu",
    };

    const mockUser = {
      _id: "12345",
      email: "lijulimbu1221@gmail.com",
      password: "hashedpassword", // This should be a hashed password in reality
      checkPassword: jest.fn().mockResolvedValue(true), // Mock the checkPassword method to return true
    };

    // Mock the User.findOne method to return the mock user
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    // Mock the generateToken method to return a token
    generateToken.mockResolvedValue("mockedToken");

    const response = await request(app)
      .post("/login") // Assuming your login route is '/login'
      .send(userData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User logged in successfully");
    expect(response.body.data.email).toBe("lijulimbu1221@gmail.com");
    expect(response.header["set-cookie"]).toBeDefined(); // Check if the token is set in cookies
  });

  it("should return an error if email or password is missing", async () => {
    const userData = {
      email: "",
      password: "lliijjuu",
    };

    const response = await request(app)
      .post("/login")
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("All the fields are required");
  });

  it("should return an error if the password is incorrect", async () => {
    const userData = {
      email: "lijulimbu1221@gmail.com",
      password: "wrongpassword",
    };

    const mockUser = {
      _id: "12345",
      email: "lijulimbu1221@gmail.com",
      password: "hashedpassword",
      checkPassword: jest.fn().mockResolvedValue(false), // Mock the checkPassword method to return false
    };

    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/login")
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid password");
  });
});
