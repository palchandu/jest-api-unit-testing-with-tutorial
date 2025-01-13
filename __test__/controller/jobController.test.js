import jobs from "../../models/jobs";
import { getJobs, newJob } from "../../controllers/jobsController";
const mockJob = {
  _id: "678247f5fad8f936dbad6276",
  title: "ML Developer",
  description:
    "The resolver function for this field likely accesses a database and then constructs and returns",
  email: "test@gmail.com",
  address: "Abc ABC SEF",
  company: "Google",
  industry: [],
  positions: 2,
  salary: 128907,
  postingDate: "2025-01-11T10:29:09.694+00:00",
  user: "67822c9cfad8f936dbad60fb",
};

const mockRequest = () => {
  return {
    body: {},
    query: {},
    params: {},
    user: {},
  };
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Job Controller", () => {
  describe("Get All Jobs", () => {
    test("should get all jobs", async () => {
      jest.spyOn(jobs, "find").mockImplementationOnce(() => ({
        limit: () => ({
          skip: jest.fn().mockResolvedValueOnce([mockJob]),
        }),
      }));

      const mockReq = mockRequest();
      const mockRes = mockResponse();
      await getJobs(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        jobs: [mockJob],
      });
    });
    test("should create new job", async () => {
      jest.spyOn(jobs, "create").mockResolvedValueOnce(mockJob);
      const mockReq = (mockRequest().body = {
        body: {
          title: "ML Developer",
          description:
            "The resolver function for this field likely accesses a database and then constructs and returns",
          email: "test@gmail.com",
          address: "Abc ABC SEF",
          company: "Google",
          positions: 2,
          salary: 128907,
        },
        user: {
          id: "67822c9cfad8f936dbad60fb",
        },
      });
      const mockRes = mockResponse();
      await newJob(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ job: mockJob })
    });
      
      test('should throw validation error', async () => { 
          jest
            .spyOn(jobs, "create")
              .mockRejectedValueOnce({ name: "ValidationError" });
          const mockReq = mockRequest();
          const mockRes = mockResponse();
          await newJob(mockReq, mockRes);
          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            error: "Please enter all values",
          });
       })
  });
});
