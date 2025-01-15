require("dotenv").config({ path: "./.env.test" });
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import supertest from "supertest";
import fs from "fs";
import app from "../../app";
import User from "../../models/users";
import * as authController from "../../controllers/authController";
beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  /** Register First */
  const payload = {
    name: "Chandra",
    email: "test123@gmail.com",
    password: "test@123",
  };
  const addResponse = await supertest(app)
    .post("/api/v1/register")
    .send(payload);
  console.log("Add Response", addResponse.body);
  /** Secondly Login */
  if (
    addResponse.body &&
    addResponse.body.token != undefined &&
    addResponse.body.token != ""
  ) {
    const payloadLogin = {
      email: "test123@gmail.com",
      password: "test@123",
    };
    const loginResponse = await supertest(app)
      .post("/api/v1/login")
      .send(payloadLogin);
    console.log("Login Response", loginResponse.body);
    if (
      loginResponse.body &&
      loginResponse.body.token != undefined &&
      loginResponse.body.token != ""
    ) {
      const token = loginResponse.body.token;
      fs.writeFileSync(".env.test", `TEST_JWT_TOKEN=${token}`);
    }
  }
});

afterAll(async () => {
  const delRed = await User.findOneAndDelete({ email: "test123@gmail.com" });
  console.log("Delete Response", delRed);
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe("Protected routes", () => {
  test("test", async () => {});
});
