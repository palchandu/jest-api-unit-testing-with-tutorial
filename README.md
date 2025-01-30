[Youtube Tutorial Video](https://www.youtube.com/watch?v=5QRx-i5jVNw&list=PPSV&t=4088s)

[Testing Express REST API With Jest & Supertest](https://www.youtube.com/watch?v=r5L1XRZaCR0&t=930s)

[ Unit Testing with Jest](https://www.youtube.com/watch?v=K-9IPd3oAoo&t=1086s)

[ Unit Testing with Jest part 2](https://youtu.be/r9HdJ8P6GQI?si=om75FMEx8GXJmf4c)

[Node.js Express testing with Jest and SuperTest](https://medium.com/@it.ermias.asmare/node-js-express-with-jest-and-supertest-e58aaf4c4514)

[How to test mongoose models with jest and mockingoose](https://dev.to/darkmavis1980/how-to-test-mongoose-models-with-jest-and-mockingoose-2k10)



Here's a Jest test case for your **user registration function**, mocking **Mongoose models** (`userModel`, `CartModel`, `CustomerModel`) to isolate the logic.

---

## **✅ Steps in the Jest Test**
1. **Mock `userModel.findOne()`** → Simulate checking if a user already exists.  
2. **Mock `userModel.create()`** → Simulate creating a new user.  
3. **Mock `CartModel.create()`** → Simulate creating a cart for the user.  
4. **Mock `CustomerModel.create()`** → Simulate inserting the user into the customer document.  
5. **Test error handling** → Simulate `userModel.create()` throwing an error.  

---

## **📌 Jest Test Code**
```typescript
import userModel from "../models/UserModel"; // Import the actual Mongoose model
import CartModel from "../models/CartModel";
import CustomerModel from "../models/CustomerModel";
import { successResponse, failedResponse } from "../utils/responseUtils";
import { registerUser } from "../controllers/authController"; // Assume this function is in authController

jest.mock("../models/UserModel"); // Mock userModel
jest.mock("../models/CartModel"); // Mock CartModel
jest.mock("../models/CustomerModel"); // Mock CustomerModel

describe("User Registration", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it("should register a new user successfully", async () => {
    const input = {
      mobile: "9876543210",
      email: "test@example.com",
      password: "password123",
      phone_verified: true,
    };

    const mockUser = {
      _id: "user123",
      mobile: input.mobile,
      email: input.email,
      toJSON: jest.fn().mockReturnValue({
        _id: "user123",
        mobile: input.mobile,
        email: input.email,
      }), // Mocking toJSON()
    };

    userModel.findOne.mockResolvedValue(null); // No existing user
    userModel.create.mockResolvedValue(mockUser); // Mock user creation
    CartModel.create.mockResolvedValue(true); // Mock cart creation
    CustomerModel.create.mockResolvedValue(true); // Mock customer creation

    const response = await registerUser(input);

    expect(userModel.findOne).toHaveBeenCalledWith({
      mobile: input.mobile,
      type: "User",
      role: "User",
    });

    expect(userModel.create).toHaveBeenCalledWith({
      ...input,
      type: "User",
      role: "User",
    });

    expect(CartModel.create).toHaveBeenCalledWith({ userId: "user123" });

    expect(CustomerModel.create).toHaveBeenCalledWith({
      userId: "user123",
      phone_verified: true,
    });

    expect(response).toEqual(
      successResponse(
        {
          _id: "user123",
          mobile: input.mobile,
          email: input.email,
        },
        "User Registered Successfully"
      )
    );
  });

  it("should return an error if the user already exists", async () => {
    const input = {
      mobile: "9876543210",
      email: "test@example.com",
      password: "password123",
    };

    userModel.findOne.mockResolvedValue({ mobile: input.mobile });

    const response = await registerUser(input);

    expect(userModel.findOne).toHaveBeenCalled();
    expect(userModel.create).not.toHaveBeenCalled(); // Ensure user is not created
    expect(response).toEqual(failedResponse("User with phone no already exists."));
  });

  it("should return an error if user creation fails", async () => {
    const input = {
      mobile: "9876543210",
      email: "test@example.com",
      password: "password123",
    };

    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockRejectedValue(new Error("DB error"));

    const response = await registerUser(input);

    expect(response).toEqual(failedResponse("Error in registration: Error: DB error"));
  });
});
```

---

## **🎯 Summary**
| **Scenario** | **Mocked Function** | **Expected Behavior** |
|-------------|---------------------|-----------------------|
| **New user registration** | `findOne → null`, `create → user object`, `CartModel.create()`, `CustomerModel.create()` | ✅ Registers user successfully |
| **User already exists** | `findOne → user object` | ❌ Returns `"User with phone no already exists."` |
| **Database error during `create()`** | `create → throws error` | ❌ Returns `"Error in registration: DB error"` |

Would you like help testing **email verification** or **edge cases**? 🚀

Here's the **Jest test case using `jest.spyOn()`** instead of `jest.mock()` for spying on Mongoose model methods.

---

## **📌 Key Differences with `jest.spyOn()`**
1. Instead of `jest.mock()`, we use `jest.spyOn(userModel, "findOne")`, etc.
2. **Spies track the actual function calls**, and we manually override their return values.
3. Ensures more granular control over **when** and **how** each function is called.

---

## **✅ Jest Test Code Using `jest.spyOn()`**
```typescript
import userModel from "../models/UserModel"; // Import the actual Mongoose model
import CartModel from "../models/CartModel";
import CustomerModel from "../models/CustomerModel";
import { successResponse, failedResponse } from "../utils/responseUtils";
import { registerUser } from "../controllers/authController"; // Assume this function is in authController

describe("User Registration (Using spyOn)", () => {
  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations after each test
  });

  it("should register a new user successfully", async () => {
    const input = {
      mobile: "9876543210",
      email: "test@example.com",
      password: "password123",
      phone_verified: true,
    };

    const mockUser = {
      _id: "user123",
      mobile: input.mobile,
      email: input.email,
      toJSON: jest.fn().mockReturnValue({
        _id: "user123",
        mobile: input.mobile,
        email: input.email,
      }), // ✅ Mocking toJSON()
    };

    // Spying on model methods and mocking their responses
    jest.spyOn(userModel, "findOne").mockResolvedValue(null); // No existing user
    jest.spyOn(userModel, "create").mockResolvedValue(mockUser); // Mock user creation
    jest.spyOn(CartModel, "create").mockResolvedValue(true); // Mock cart creation
    jest.spyOn(CustomerModel, "create").mockResolvedValue(true); // Mock customer creation

    const response = await registerUser(input);

    expect(userModel.findOne).toHaveBeenCalledWith({
      mobile: input.mobile,
      type: "User",
      role: "User",
    });

    expect(userModel.create).toHaveBeenCalledWith({
      ...input,
      type: "User",
      role: "User",
    });

    expect(CartModel.create).toHaveBeenCalledWith({ userId: "user123" });

    expect(CustomerModel.create).toHaveBeenCalledWith({
      userId: "user123",
      phone_verified: true,
    });

    expect(response).toEqual(
      successResponse(
        {
          _id: "user123",
          mobile: input.mobile,
          email: input.email,
        },
        "User Registered Successfully"
      )
    );
  });

  it("should return an error if the user already exists", async () => {
    const input = {
      mobile: "9876543210",
      email: "test@example.com",
      password: "password123",
    };

    jest.spyOn(userModel, "findOne").mockResolvedValue({ mobile: input.mobile });

    const response = await registerUser(input);

    expect(userModel.findOne).toHaveBeenCalled();
    expect(userModel.create).not.toHaveBeenCalled(); // Ensure user is not created
    expect(response).toEqual(failedResponse("User with phone no already exists."));
  });

  it("should return an error if user creation fails", async () => {
    const input = {
      mobile: "9876543210",
      email: "test@example.com",
      password: "password123",
    };

    jest.spyOn(userModel, "findOne").mockResolvedValue(null);
    jest.spyOn(userModel, "create").mockRejectedValue(new Error("DB error"));

    const response = await registerUser(input);

    expect(response).toEqual(failedResponse("Error in registration: Error: DB error"));
  });
});
```

---

## **🎯 Key Takeaways**
| **Scenario** | **Mocking with `spyOn()`** | **Expected Behavior** |
|-------------|----------------------------|-----------------------|
| **New user registration** | ✅ `jest.spyOn(userModel, "findOne")` → `null` | ✅ Registers user successfully |
| **User already exists** | ✅ `jest.spyOn(userModel, "findOne")` → Existing user | ❌ Returns `"User with phone no already exists."` |
| **Database error in `create()`** | ✅ `jest.spyOn(userModel, "create")` → `throws Error("DB error")` | ❌ Returns `"Error in registration: DB error"` |

Would you like me to add **more edge cases** or **test async validation failures**? 🚀


### **🤔 `jest.mock()` vs. `jest.spyOn()` in Jest Testing**
Both `jest.mock()` and `jest.spyOn()` are used to control and manipulate dependencies in Jest unit tests, but they differ in how they **replace function implementations** and **track calls**.

---

## **1️⃣ `jest.mock()` – Full Module Mocking**
### ✅ **What It Does**
- **Replaces the entire module** with a fake/mock implementation.
- **All functions inside the module are automatically mocked**, even if not used.
- Prevents calling real database or API logic.
- Best for **isolating unit tests** where external dependencies should not affect the outcome.

### **🚀 Example (Full Mocking)**
```typescript
jest.mock("../models/UserModel"); // ✅ Fully mocks the entire module
jest.mock("../models/CartModel");
jest.mock("../models/CustomerModel");

userModel.findOne.mockResolvedValue(null); // Mock database response
userModel.create.mockResolvedValue(mockUser);
```

### **⚡ Pros**
✔ **Prevents accidental calls** to actual implementations.  
✔ Makes tests faster by avoiding real DB/API calls.  
✔ Useful when testing **functions in isolation**.  

### **❌ Cons**
✖ **Mocks everything inside the module**, even functions you don’t need.  
✖ Harder to restore the original behavior of specific functions.  

---

## **2️⃣ `jest.spyOn()` – Selective Mocking**
### ✅ **What It Does**
- **Spies on a specific function inside a module** and optionally **overrides** it.
- Unlike `jest.mock()`, it **doesn’t replace the whole module**, only specific methods.
- Can allow **partial mocking**—mock some functions, while using real implementations for others.

### **🚀 Example (`jest.spyOn()` for Selective Mocking)**
```typescript
jest.spyOn(userModel, "findOne").mockResolvedValue(null); // ✅ Only mock findOne
jest.spyOn(userModel, "create").mockResolvedValue(mockUser); // ✅ Only mock create
```

### **⚡ Pros**
✔ More **granular control**—only mock specific functions.  
✔ Allows **partial mocking** (some functions real, some mocked).  
✔ Useful when you want to **track calls but still use real implementations**.  

### **❌ Cons**
✖ If the function isn’t called, the spy doesn’t do anything.  
✖ Requires **manual restoration** (`jest.restoreAllMocks()`).  

---

## **🚀 Key Differences in Testing**
| Feature          | `jest.mock()` | `jest.spyOn()` |
|-----------------|--------------|---------------|
| **Mocking Scope** | Mocks the **entire module** | Mocks **specific functions** |
| **Function Tracking** | No tracking, just replaces | Tracks calls and allows real function execution |
| **Partial Mocking** | ❌ No, everything is mocked | ✅ Yes, only selected methods |
| **Restoring Original** | `jest.unmock()` resets the whole module | `jest.restoreAllMocks()` resets spies |
| **Best For** | Completely isolating dependencies | Fine-grained control over test behavior |

---

## **🎯 When to Use Which?**
| **Use `jest.mock()` when...** | **Use `jest.spyOn()` when...** |
|----------------------------|---------------------------|
| You need to **mock an entire module** | You need to **mock only specific functions** |
| You are testing **a unit function in isolation** | You want to **spy on calls** while allowing the function to run |
| You want **faster, fully controlled tests** | You need **granular control over function behavior** |
| Example: Mocking all DB functions | Example: Mocking `findOne` but letting `save` run normally |

---

## **Final Thought**
Both methods are **valid**; the choice depends on whether you need **complete control (`jest.mock()`)** or **partial control (`jest.spyOn()`)** over dependencies. 


### **🛠 Combining `jest.mock()` and `jest.spyOn()` in a Single Test**
You can use **`jest.mock()`** to replace an entire module while using **`jest.spyOn()`** to selectively override or track specific functions.

---

## **🎯 Scenario**
- We **mock the entire `CartModel` and `CustomerModel`** because we don’t need them to execute.
- We **use `jest.spyOn()` on `userModel.findOne` and `userModel.create`** because we want **partial control**:
  - Mock `findOne` to return `null` (user doesn’t exist).
  - Mock `create` but track its calls.

---

### **🚀 Test Case Combining `jest.mock()` & `jest.spyOn()`**
```typescript
import mongoose from "mongoose";
import userModel, { UserDocument } from "../models/UserModel"; 
import CartModel from "../models/CartModel";
import CustomerModel from "../models/CustomerModel";
import { registerUser } from "../controllers/authController"; 
import { successResponse, failedResponse } from "../utils/responseUtils";

// ✅ Mock entire CartModel & CustomerModel
jest.mock("../models/CartModel");
jest.mock("../models/CustomerModel");

describe("User Registration (Combining `jest.mock()` & `jest.spyOn()`)", () => {
  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations after each test
  });

  it("should register a new user successfully", async () => {
    const input = {
      mobile: "9876543210",
      email: "test@example.com",
      password: "password123",
      phone_verified: true,
    };

    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      mobile: input.mobile,
      email: input.email,
      toJSON: jest.fn().mockReturnValue({
        _id: "user123",
        mobile: input.mobile,
        email: input.email,
      }),
    } as unknown as UserDocument;

    // ✅ Spy on userModel methods but let others execute normally
    jest.spyOn(userModel, "findOne").mockResolvedValue(null); // No existing user
    jest.spyOn(userModel, "create").mockResolvedValue(mockUser); // Mock user creation

    const response = await registerUser(input);

    expect(userModel.findOne).toHaveBeenCalledWith({
      mobile: input.mobile,
      type: "User",
      role: "User",
    });

    expect(userModel.create).toHaveBeenCalledWith({
      ...input,
      type: "User",
      role: "User",
    });

    expect(CartModel.create).toHaveBeenCalledWith({ userId: mockUser._id });
    expect(CustomerModel.create).toHaveBeenCalledWith({
      userId: mockUser._id,
      phone_verified: true,
    });

    expect(response).toEqual(
      successResponse(
        {
          _id: "user123",
          mobile: input.mobile,
          email: input.email,
        },
        "User Registered Successfully"
      )
    );
  });
});
```

---

## **🎯 Why This Works**
| **Method** | **What It Does** | **Why Use It?** |
|------------|-----------------|----------------|
| `jest.mock("../models/CartModel")` | Mocks the **entire CartModel module** | We don’t need real cart creation logic in tests |
| `jest.mock("../models/CustomerModel")` | Mocks the **entire CustomerModel module** | We don’t need real customer creation logic |
| `jest.spyOn(userModel, "findOne")` | Mocks **only `findOne` function**, others remain real | We only want to **control** its return value |
| `jest.spyOn(userModel, "create")` | Mocks **only `create` function** while tracking calls | We **track and mock** user creation |

---

## **🚀 Key Takeaways**
| **If you want to...** | **Use** |
|----------------------|---------|
| Mock the **entire module** | ✅ `jest.mock("moduleName")` |
| Mock **only specific functions** | ✅ `jest.spyOn(object, "method")` |
| Mock **some functions but keep others real** | ✅ Combine both `jest.mock()` and `jest.spyOn()` |

---

## **💡 When to Use This Approach?**
✅ **Unit Testing with External Dependencies**  
✅ When you need **fine-grained control** over mocking  
✅ When mocking the whole module **is overkill**  
✅ When you need **to track function calls**  




