// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const startDB = require('./helpers/DB');
const utils = require('./helpers/utils')
const User = require('./models/user');
fastify.register(startDB);


function checkKeys(keysList, dataCheck)
{
  // check key existence 
  let flag = 1
  for (const key of Object.keys(dataCheck)) 
  {
    if (!keysList.includes(key)) 
    {
      flag = 0;
      break;
    }
  }

  return flag;
}


// Declare a route: add new user
const addUser = async function (request, reply) {
  try 
  {
    const userBody = request.body;
    console.log('\n\n\n');
    console.log(userBody);
    console.log('\n\n\n');
    userBody.fullName = utils.getFullName(userBody.firstName, userBody.lastName);
    delete userBody.firstName;
    delete userBody.lastName;
    const user = new User(userBody);
    const addedUser = await user.save();
    return addedUser;
            
  } 
  catch (error) 
  {
    throw new Error(error.message);        
  }
}

fastify.post('/adduser', addUser)



// Declare a route: get all users
async function getAllUsers (request, reply) 
{
  try 
  {
    const users = await User.find();
    return users;
  }
  catch(error)
  {
    throw new Error(error.message);
  }
}

fastify.get('/', getAllUsers);


// Declare a route: get a single user
async function getSingleUser (request, reply) 
{
  try 
  {
    const userKeys = ['fullName', 'age', 'job'];
    console.log('\n\n\n');
    console.log(JSON.parse(JSON.stringify(request.query)));
    console.log('\n\n\n');
    const userQuery = JSON.parse(JSON.stringify(request.query)) || {};
  
    // check key existence
    let flag = 1
    if(checkKeys(userKeys, userQuery)==0)
    {
      throw new Error("not valid keys, the valid keys are fullName, age, and job.");
    }

    // check if the user enter the key more than one time.
    if(new Set(Object.keys(userQuery)).size !== Object.keys(userQuery).length)
    {
      throw new Error("keys duplication is not allowed.");
    }

    const user = await User.findOne(userQuery);
    return user;
  }
  catch(error)
  {
    throw new Error(error.message);
  }
}

fastify.get('/getuser', getSingleUser);



// Declare a route: delete user
async function deleteUser (request, reply) 
{
  try 
  {
    const userKeys = ['fullName', 'age', 'job'];
    console.log('\n\n\n');
    console.log(JSON.parse(JSON.stringify(request.query)));
    console.log('\n\n\n');
    const userQuery = JSON.parse(JSON.stringify(request.query)) || {};
  
    // check key existence
    let flag = 1
    if(checkKeys(userKeys, userQuery)==0)
    {
      throw new Error("not valid keys, the valid keys are fullName, age, and job.");
    }

    // check if the user enter the key more than one time.
    if(new Set(Object.keys(userQuery)).size !== Object.keys(userQuery).length)
    {
      throw new Error("keys duplication is not allowed.");
    }
    
    const result = await User.findOne(userQuery);

    if(result)
    {
      const user = await User.deleteOne(userQuery);
      return 'user deleted successfully.';
    }
    else
    {
      return 'there is no user match this condition.';
    }
  }
  catch(error)
  {
    throw new Error(error.message);
  }
}

fastify.delete('/deleteuser', deleteUser);


// Declare a route: update user
async function updateUser (request, reply) 
{
  try 
  {
    const userKeys = ['fullName', 'age', 'job'];

    console.log('\n\n\n');
    console.log(JSON.parse(JSON.stringify(request.query)));
    console.log('\n\n\n');
    const userQuery = JSON.parse(JSON.stringify(request.query)) || {};

    const userBody = request.body;
    console.log('\n\n\n');
    console.log(userBody);
    console.log('\n\n\n');


    // check key existence
    let flag = 1
    if(checkKeys(userKeys, userQuery)==0 || checkKeys(userKeys, userBody)==0)
    {
      throw new Error("not valid keys, the valid keys are fullName, age, and job.");
    }

    // check if the user enter the key more than one time.
    if(new Set(Object.keys(userQuery)).size !== Object.keys(userQuery).length || new Set(Object.keys(userBody)).size !== Object.keys(userBody).length)
    {
      throw new Error("keys duplication is not allowed.");
    }
    
    const result = await User.findOne(userQuery);

    if(result)
    {
      const user = await User.updateOne(userQuery, userBody);
      return 'user updated successfully.';
    }
    else
    {
      return 'there is no user match this condition.';
    }
  }
  catch(error)
  {
    throw new Error(error.message);
  }
}

fastify.put('/updateuser', updateUser);


// Run the server!
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

module.exports = { addUser, getAllUsers, getSingleUser, deleteUser, updateUser };