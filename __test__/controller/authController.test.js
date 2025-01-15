import { registerUser, loginUser } from "../../controllers/authController";
import bcrypt from "bcryptjs";
import User from "../../models/users";

jest.mock("../../utils/helpers", () => ({
  getJwtToken: jest.fn(() => "jwt_token"),
}));
const mockRequest = () => {
  return {
    body: {
      name: "test",
      email: "test@gmail.com",
      password: "test124",
    },
  };
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

const mockUser = {
  _id: "1243454544665",
  name: "test",
  email: "test@gmail.com",
  password: "test124",
};

const userLogin = {
  email: "test@gmail.com",
  password: "test124",
};
afterEach(() => {
  jest.restoreAllMocks();
});
afterAll(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.resetAllMocks();
});
describe("Register User", () => {
  test("should register user", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("test124");
    jest.spyOn(User, "create").mockResolvedValueOnce(mockUser);
    const mockReq = mockRequest();
    const mockRes = mockResponse();
    await registerUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("test124", 10);
    expect(User.create).toHaveBeenCalledWith({
      name: "test",
      email: "test@gmail.com",
      password: "test124",
    });
  });
  test("should throw validation error", async () => {
    const mockReq = (mockRequest().body = { body: {} });
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Please enter all values",
    });
  });
  test("should throw duplicate email entered error", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("test124");
    jest.spyOn(User, "create").mockRejectedValueOnce({ code: 11000 });
    const mockReq = mockRequest();
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Duplicate email",
    });
  });
});

describe("Login User", () => {
  test("should throw error on email and password is missing", async () => {
    const mockReq = (mockRequest().body = { body: {} });
    const mockRes = mockResponse();
    await loginUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Please enter email & Password",
    });
  });

  test("should throw error if email is invalid", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(null),
    }));
    const mockReq = (mockRequest().body = { body: userLogin });
    const mockRes = mockResponse();
    await loginUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid Email or Password",
    });
  });

  test("should throw error if password is invalid", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockUser),
    }));
    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);
    const mockReq = (mockRequest().body = { body: userLogin });
    const mockRes = mockResponse();
    await loginUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid Email or Password",
    });
  });

  test("should test user successfull logged in", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockUser),
    }));
    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

    const mockReq = (mockRequest().body = { body: userLogin });
    const mockRes = mockResponse();
    await loginUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      token: "jwt_token",
    });
  });


});
