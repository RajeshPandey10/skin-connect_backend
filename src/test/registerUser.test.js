const { registerUser } = require('./registerUser');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// Mock the User model
jest.mock('../models/User');

describe('registerUser', () => {
  let req, res, jsonMock, statusMock;

  beforeEach(() => {
    req = {
      body: {
        name: 'Liju limbu',
        email: 'pr923071@gmail.com',
        password: 'password123',
        userType: 'customer',
      },
    };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should throw an error if required fields are missing', async () => {
    req.body = { name: 'Liju limbu', email: 'pr923071@gmail.com' }; // Missing password and userType

    await expect(registerUser(req, res)).rejects.toThrow(
      new ApiError(400, 'All the fields are required')
    );
  });

  it('should throw an error if user already exists', async () => {
    User.findOne.mockResolvedValue({ email: 'pr923071@gmail.com' });

    await expect(registerUser(req, res)).rejects.toThrow(
      new ApiError(400, 'User already exists.')
    );
  });

  it('should throw an error if user creation fails', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(null);

    await expect(registerUser(req, res)).rejects.toThrow(
      new ApiError(400, 'Error occured while registering user')
    );
  });

  it('should successfully register a user', async () => {
    const mockUser = {
      _id: '12345',
      name: 'Liju limbu',
      email: 'pr923071@gmail.com',
      userType: 'customer',
    };

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser);

    await registerUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'pr923071@gmail.com' });
    expect(User.create).toHaveBeenCalledWith({
      name: 'Liju limbu',
      email: 'pr923071@gmail.com',
      password: 'password123',
      userType: 'customer',
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      new ApiResponse(200, mockUser, 'Suscessfully register user')
    );
  });
});