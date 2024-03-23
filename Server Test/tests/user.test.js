const it = require("ava").default;
const chai = require("chai");
var expect = chai.expect;
const startDB = require('../helpers/DB');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addUser, getAllUsers, getSingleUser, deleteUser, updateUser } = require('../index');
const User = require('../models/user');
const sinon = require("sinon");
const utils = require('../helpers/utils')


it.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
  await startDB();
});

it.after(async (t) => {
  await t.context.mongod.stop({ doCleanUp: true });
})


it("create user succesfully", async (t) => {
  // setup
  const request = {
    body: {
      firstName: "Menna",
      lastName: "Hamdy",
      age: 11,
      job: "fs",
    },
  };
  const expectedResult = {
    fullName: "Menna Hamdy",
    age: 11,
    job: "fs",
  };
  //   sinon.stub(utils, 'getFullName').returns('Menna Hamdy');
  sinon.stub(utils, 'getFullName').callsFake((fname, lname) => {
    expect(fname).to.be.equal(request.body.firstName);
    expect(lname).to.be.equal(request.body.lastName);
    return 'Menna Hamdy'
  })
  const actualResult = await addUser(request);
  const result = {
    ...expectedResult,
    __v: actualResult.__v,
    _id: actualResult._id
  }
  expect(actualResult).to.be.a('object');
  expect(actualResult._doc).to.deep.equal(result);
  t.teardown(async () => {
    await User.deleteMany({
      fullName: request.body.fullName,
    })
  })
  t.pass();
});



it("get all users successfully", async (t) => {
  const expectedResult = {
    fullName: "Menna Hamdy",
    age: 11,
    job: "fs",
  };
  sinon.stub(User, 'find').resolves(expectedResult);
  const actualResult = await getAllUsers();
  t.deepEqual(actualResult, expectedResult);
});


it("get single user successfully", async (t) => {
  const request = {
    query: {
      fullName: "Menna Hamdy"
    }
  };
  const expectedResult = {
    fullName: "Menna Hamdy",
    age: 11,
    job: "fs",
  };
  sinon.stub(User, 'findOne').resolves(expectedResult);
  const actualResult = await getSingleUser(request);
  t.deepEqual(actualResult, expectedResult);
});


it("update user successfully", async (t) => {
  const request = {
    query: {
      fullName: "Menna Hamdy"
    },
    body: {
      age: 59,
      job: "Testing Engineer"
    }
  };
  const expectedResult = 'user updated successfully.';
  sinon.stub(User, 'updateOne').resolves({});
  const actualResult = await updateUser(request);
  t.deepEqual(actualResult, expectedResult);
});


it("delete user successfully", async (t) => {
  const request = {
    query: {
      fullName: "Menna Hamdy"
    }
  };
  const expectedResult = 'user deleted successfully.';
  sinon.stub(User, 'deleteOne').resolves({});
  const actualResult = await deleteUser(request);
  t.deepEqual(actualResult, expectedResult);
});


// getUsers
// getSingleUser
// deleteUser

// bonus : validation, updateUser