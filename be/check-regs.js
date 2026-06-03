const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://hoandepzai235_db_user:Admin123@cluster0.rxgxctj.mongodb.net/horsetrack?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  roles: [String]
});
const User = mongoose.model('User', UserSchema);

const RegistrationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  status: String,
  jockeyUserId: mongoose.Schema.Types.ObjectId,
  horseId: mongoose.Schema.Types.ObjectId,
  raceId: mongoose.Schema.Types.ObjectId
});
const Registration = mongoose.model('Registration', RegistrationSchema);

const HorseSchema = new mongoose.Schema({
  name: String,
  ownerId: mongoose.Schema.Types.ObjectId
});
const Horse = mongoose.model('Horse', HorseSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to database.");

  const owner = await User.findOne({ email: "owner@horsetrack.local" });
  if (!owner) {
    console.log("Owner not found!");
    await mongoose.disconnect();
    return;
  }
  console.log(`Found owner: ${owner.fullName} (${owner._id})`);

  // Find owner's horses
  const horses = await Horse.find({ ownerId: owner._id });
  const horseIds = horses.map(h => h._id);
  console.log(`Horses owned: ${horses.map(h => h.name).join(', ')}`);

  // Find registrations for these horses
  const regs = await Registration.find({ horseId: { $in: horseIds } });
  console.log(`\nFound ${regs.length} registrations:`);
  for (const r of regs) {
    const horse = horses.find(h => h._id.toString() === r.horseId.toString());
    console.log(`Registration ID: ${r._id} | Horse: ${horse ? horse.name : 'Unknown'} | Status: ${r.status} | Jockey assigned: ${r.jockeyUserId || 'None'}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
