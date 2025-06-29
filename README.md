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


In **Jest unit testing**, **mocks** (`jest.fn()`, `jest.mock()`) and **spies** (`jest.spyOn()`) are the primary tools used for:

* Isolating dependencies
* Tracking function calls
* Controlling return values

However, you can approach unit testing in a few **other ways or complementary patterns** depending on your testing goals:

---

## ✅ Alternatives or Complements to Mocking and Spying in Jest

### 1. **Fakes**

* **Fakes** are real implementations with limited or simplified logic that simulate complex components.
* They **don’t rely on Jest's mocking API** but rather on writing controlled replacement logic.

#### Example:

```javascript
// Fake Email Service
class FakeEmailService {
  sendEmail(to, message) {
    console.log(`Fake email sent to ${to}`);
    return true;
  }
}
```

* ✅ **Use case:** Simulate behavior without mocking.

---

### 2. **Stubs**

* Stubs provide **pre-programmed responses** to function calls, but unlike spies, you don't track how they were called.
* In Jest, you typically create stubs using `jest.fn()`, but **you can also manually create a stub function.**

#### Example:

```javascript
function paymentServiceStub() {
  return { status: 'success' };
}
```

* ✅ **Use case:** When you just want to replace function logic with a fixed response without tracking.

---

### 3. **Dependency Injection (Manual)**

* Instead of mocking, you **pass pre-controlled objects or functions directly to the code under test.**
* This avoids Jest’s mocking system and keeps tests pure.

#### Example:

```javascript
function processOrder(order, paymentProcessor) {
  return paymentProcessor.pay(order.amount);
}

// Inject fake payment processor
const fakePaymentProcessor = { pay: () => 'payment success' };
processOrder({ amount: 100 }, fakePaymentProcessor);
```

* ✅ **Use case:** Makes testing easier by designing your app for testability.

---

### 4. **Test-Specific Implementations**

* Provide real, isolated implementations of services (like in-memory databases) for testing.

#### Example:

```javascript
// Instead of mocking MongoDB, use an in-memory version:
const { MongoMemoryServer } = require('mongodb-memory-server');
```

* ✅ **Use case:** Useful for integration-style unit tests without mocking database queries.

---

### 5. **Assertions on Real Calls (No Mocks)**

* In simple pure functions, you can write unit tests without any mocks or spies.
* Example:

```javascript
function add(a, b) {
  return a + b;
}

test('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

* ✅ **Use case:** When the function has no side effects or external dependencies.

---

### 6. **Fake Timers (`jest.useFakeTimers`)**

* Useful to test asynchronous functions or timers without needing to mock the whole module.

#### Example:

```javascript
jest.useFakeTimers();

test('delays the execution', () => {
  const callback = jest.fn();
  setTimeout(callback, 3000);
  
  jest.advanceTimersByTime(3000);
  
  expect(callback).toHaveBeenCalled();
});
```

* ✅ **Use case:** Test timing-based logic without actual delays.

---

### 7. **Snapshot Testing**

* Instead of spying or mocking, you can test the output or the structure of returned data using snapshots.

#### Example:

```javascript
test('returns correct response', () => {
  const result = getUserProfile();
  expect(result).toMatchSnapshot();
});
```

* ✅ **Use case:** Useful for APIs, UI rendering, and large response structures.

---

## 📌 Summary Table

| Technique                      | Purpose                          | Tracks Calls | Controls Return |
| ------------------------------ | -------------------------------- | ------------ | --------------- |
| Mocks (`jest.fn`, `jest.mock`) | Replace and track dependencies   | ✅            | ✅               |
| Spies (`jest.spyOn`)           | Track existing function calls    | ✅            | ✅               |
| Fakes                          | Simplified, real implementations | ❌            | ✅               |
| Stubs                          | Hardcoded return values          | ❌            | ✅               |
| Dependency Injection           | Pass real or fake objects        | ❌            | ✅               |
| In-memory Databases            | Test real queries in memory      | ❌            | ✅               |
| Real Assertions                | Test pure functions              | ❌            | ❌               |
| Fake Timers                    | Control time-based code          | ✅ (timers)   | ✅               |
| Snapshot Testing               | Compare output structure         | ❌            | ✅               |

---

### ✅ **When to Use:**

* **Mocks/Spies:** When you need isolation and want to verify function calls.
* **Fakes/Stubs/DI:** When you want lighter, faster tests without over-relying on Jest internals.
* **In-memory Services:** When you need near-integration behavior but with speed.
* **Snapshots/Real Assertions:** When testing structure or pure logic.

---

If you want, I can help you **write a real-world example** using each approach based on your project type. Would you like that? 😊

Great! Let's walk through **real-world examples** for each approach based on a **Node.js, Express.js, MongoDB eCommerce application**.

---

## 🎯 Real-World Examples for Each Approach

---

## 1. **Mocks (`jest.fn`)**

### Scenario: Test if `sendEmail` is called when a user registers.

```javascript
// userService.js
const emailService = require('./emailService');

exports.registerUser = (userData) => {
  // ...save user logic
  emailService.sendEmail(userData.email, 'Welcome!');
};
```

```javascript
// userService.test.js
const emailService = require('./emailService');
const userService = require('./userService');

jest.mock('./emailService');

test('should call sendEmail on user registration', () => {
  userService.registerUser({ email: 'test@example.com' });
  expect(emailService.sendEmail).toHaveBeenCalledWith('test@example.com', 'Welcome!');
});
```

✅ **When to use:** Isolate the email service to only test the `registerUser` logic.

---

## 2. **Spies (`jest.spyOn`)**

### Scenario: Spy on an existing method without mocking the entire module.

```javascript
const emailService = {
  sendEmail: (to, message) => { console.log('Email sent'); }
};

test('spy on email sending', () => {
  const spy = jest.spyOn(emailService, 'sendEmail');
  
  emailService.sendEmail('user@test.com', 'Welcome');

  expect(spy).toHaveBeenCalledWith('user@test.com', 'Welcome');
});
```

✅ **When to use:** When you want the real method to run but still track calls.

---

## 3. **Fakes**

### Scenario: Use a simplified payment processor.

```javascript
// Fake Payment Processor
const fakePaymentProcessor = {
  process: (amount) => 'Fake Payment Processed'
};

test('process order with fake processor', () => {
  const result = fakePaymentProcessor.process(100);
  expect(result).toBe('Fake Payment Processed');
});
```

✅ **When to use:** When mocking is not needed but you want to replace the dependency.

---

## 4. **Stubs**

### Scenario: Provide hardcoded service response.

```javascript
const paymentStub = jest.fn(() => ({ status: 'success' }));

test('process payment using stub', () => {
  const result = paymentStub();
  expect(result.status).toBe('success');
});
```

✅ **When to use:** When you only care about the returned value, not the internal logic.

---

## 5. **Dependency Injection (DI)**

### Scenario: Inject fake service directly.

```javascript
function orderService(order, paymentProcessor) {
  return paymentProcessor.pay(order.amount);
}

test('process order with injected payment processor', () => {
  const fakePaymentProcessor = { pay: () => 'Payment Complete' };
  
  const result = orderService({ amount: 100 }, fakePaymentProcessor);

  expect(result).toBe('Payment Complete');
});
```

✅ **When to use:** For highly testable code without needing Jest’s mocking APIs.

---

## 6. **In-Memory Database**

### Scenario: Use an in-memory MongoDB to test real queries.

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('save user to in-memory db', async () => {
  const User = mongoose.model('User', new mongoose.Schema({ name: String }));
  const user = await User.create({ name: 'Test User' });

  expect(user.name).toBe('Test User');
});
```

✅ **When to use:** For testing real database behavior quickly.

---

## 7. **Assertions Without Mocking**

### Scenario: Pure function testing.

```javascript
function calculateTotal(price, quantity) {
  return price * quantity;
}

test('calculates total', () => {
  expect(calculateTotal(50, 2)).toBe(100);
});
```

✅ **When to use:** For simple, stateless functions.

---

## 8. **Fake Timers**

### Scenario: Simulate delayed API response.

```javascript
jest.useFakeTimers();

test('delayed function call', () => {
  const callback = jest.fn();

  setTimeout(callback, 2000);

  jest.advanceTimersByTime(2000);

  expect(callback).toHaveBeenCalled();
});
```

✅ **When to use:** For setTimeout, debounce, or polling logic.

---

## 9. **Snapshot Testing**

### Scenario: Validate API response structure.

```javascript
test('snapshot of user data', () => {
  const userData = { id: 1, name: 'John Doe', email: 'john@example.com' };

  expect(userData).toMatchSnapshot();
});
```

✅ **When to use:** For validating API responses, components, or large objects without writing detailed assertions.

---

## ✅ Quick Summary:

| Approach             | When to Use                  |
| -------------------- | ---------------------------- |
| Mocks                | Isolating external services  |
| Spies                | Tracking real function calls |
| Fakes                | Lightweight replacements     |
| Stubs                | Fixed responses              |
| Dependency Injection | Testable architecture        |
| In-memory Database   | Realistic database behavior  |
| Real Assertions      | Pure logic tests             |
| Fake Timers          | Timer-based logic            |
| Snapshot Testing     | API/UI structure validation  |

---

If you want, I can help you **build a Jest testing folder structure and strategy document** for your project to keep everything organized and scalable. Would you like me to create that for you? 😊


