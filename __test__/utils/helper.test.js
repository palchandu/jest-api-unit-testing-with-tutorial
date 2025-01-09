import * as helper from "../../utils/helpers";
import jwt from 'jsonwebtoken'
describe("Testing helper functions", () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })
  test("Using the mock", async () => {
    const getJwtToken = jest.fn((secret) => secret+"tokennn");
      expect(getJwtToken('123')).toBe("123tokennn");
      expect(getJwtToken).toHaveBeenCalledTimes(1)
      expect(getJwtToken).toHaveBeenCalledWith('123')
  });
  test("Using the spy", async () => {
    const spyGetJwtToken = jest.spyOn(helper, "getJwtToken");
    spyGetJwtToken.mockImplementation((id) => id + "qwerty");
    const token = helper.getJwtToken("1234");
      expect(token).toBe("1234qwerty");
      expect(spyGetJwtToken).toHaveBeenCalledTimes(1);
      expect(spyGetJwtToken).toHaveBeenCalledWith("1234");
  });
});

describe('Test jwt token',  () => { 
    test('getting jwt token', async () => {
        const spySign = jest.spyOn(jwt, 'sign').mockImplementation((payload, secret) => { return { ...payload, ...{ secret: secret } } })
        const token = await helper.getJwtToken({ name: 'chandra', age: 33 });
        expect(token).toMatchObject({
            id: { name: "chandra", age: 33 },
            secret: "23232344",
        });
        expect(spySign).toHaveBeenCalledTimes(1)
        expect(spySign).toHaveBeenCalledWith(
           {id: { name: "chandra", age: 33 }},
          "23232344",
          { expiresIn: "1d" }
        );
    })
 })