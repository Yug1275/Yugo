require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});
const User = mongoose.model('User', UserSchema);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const users = await User.find({}, 'name email role');
    console.log('USERS_LIST_START');
    console.log(JSON.stringify(users, null, 2));
    console.log('USERS_LIST_END');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
