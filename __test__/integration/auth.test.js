import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import mongoose from "mongoose";
/** Called controller */
import * as authController from "../../controllers/authController";
describe("Authentication", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  describe("Authentication test api", () => {
    test("should test api successfull", async () => {
      const res = await supertest(app).get("/api/v1/test");
      expect(res.status).toBe(200);
      expect(res.body.test).toBe("hello");
    });

    test("should create a new user", async () => {
      const payload = {
        name: "Chandra",
        email: "test@gmail.com",
        password: "test@123",
      };
      const addRes = await supertest(app)
        .post("/api/v1/register")
        .send(payload);
      expect(addRes.status).toBe(201);
      expect(addRes.body).toHaveProperty("token");
      expect(addRes.body).toHaveProperty("user");
      expect(addRes.body.user).toHaveProperty("_id");
      expect(addRes.body.user).toHaveProperty("createdAt");
    });
  });
});
