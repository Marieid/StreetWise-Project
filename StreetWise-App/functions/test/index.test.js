const firebaseFunctionsTest = require("firebase-functions-test")();
const admin = require("firebase-admin");
const { updateCredibilityOnVote } = require("../index");
const userId = user.uid;

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  app: jest.fn(() => ({
    options: {},
  })),
}));

jest.mock("firebase-admin", () => {
  const actualAdmin = jest.requireActual("firebase-admin");
  const mockFirestore = {
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    update: jest.fn(),
  };
  const mockAdmin = {
    ...actualAdmin,
    initializeApp: jest.fn(), // Ensure initializeApp is mocked
    firestore: jest.fn(() => mockFirestore),
    apps: [{ name: "mockApp" }],
  };
  return mockAdmin;
});

firebaseFunctionsTest.mockConfig({});

it("should update credibility on upvote", async () => {
  const beforeData = { upvotes: 0, downvotes: 0, userId: "testUser" };
  const afterData = { upvotes: 1, downvotes: 0, userId: "testUser" };

  const wrapped = firebaseFunctionsTest.wrap(updateCredibilityOnVote);

  const mockSnapshot = {
    before: {
      exists: true,
      data: () => beforeData,
    },
    after: {
      exists: true,
      data: () => afterData,
    },
    id: "testIncident", // Add an ID
  };

  const mockFirestore = admin.firestore();
  mockFirestore.doc.mockReturnThis();
  mockFirestore.get.mockResolvedValue({
    exists: true,
    data: () => ({ credibilityScore: 50 }),
  });

  await wrapped(mockSnapshot);

  expect(mockFirestore.doc).toHaveBeenCalledWith("users/testUser");
  expect(mockFirestore.update).toHaveBeenCalledWith({
    credibilityScore: 55,
  });
});

it("should update credibility on downvote", async () => {
  const beforeData = { upvotes: 0, downvotes: 0, userId: "testUser" };
  const afterData = { upvotes: 0, downvotes: 1, userId: "testUser" };

  const wrapped = firebaseFunctionsTest.wrap(updateCredibilityOnVote);

  const mockSnapshot = {
    before: {
      exists: true,
      data: () => beforeData,
    },
    after: {
      exists: true,
      data: () => afterData,
    },
    id: "testIncident", // Add an ID
  };

  const mockFirestore = admin.firestore();
  mockFirestore.doc.mockReturnThis();
  mockFirestore.get.mockResolvedValue({
    exists: true,
    data: () => ({ credibilityScore: 50 }),
  });

  await wrapped(mockSnapshot);

  expect(mockFirestore.doc).toHaveBeenCalledWith("users/testUser");
  expect(mockFirestore.update).toHaveBeenCalledWith({
    credibilityScore: 40,
  });
});
