const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://hoandepzai235_db_user:Admin123@cluster0.rxgxctj.mongodb.net/horsetrack?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  roles: { type: [String], default: ["spectator"] },
  status: { type: String, default: "active" },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const email = "counter@horsetrack.local";
  const existing = await User.findOne({ email });
  const passwordHash = await bcrypt.hash("password123", 10);
  if (existing) {
    console.log("User already exists!");
    existing.roles = ["counter_staff"];
    existing.passwordHash = passwordHash;
    existing.status = "active";
    await existing.save();
    console.log("User updated to counter_staff and password reset to password123!");
  } else {
    await User.create({
      fullName: "Nhân viên quầy",
      email,
      passwordHash,
      phone: "0912345678",
      address: "Quầy giao dịch HorseTrack",
      roles: ["counter_staff"],
      status: "active"
    });
    console.log("Counter staff user created successfully!");
  }

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch(console.error);
