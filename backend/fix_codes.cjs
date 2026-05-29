const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/fastpay').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  for (const user of users) {
    const namePart = user.name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const baseCode = namePart.length >= 4 ? namePart.slice(0, 4) : namePart.padEnd(4, 'X');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = baseCode + randomDigits;
    await db.collection('users').updateOne({ _id: user._id }, { $set: { referralCode: newCode } });
    console.log('Updated user ' + user.name + ' with code ' + newCode);
  }
  console.log('Done');
  process.exit(0);
});
