import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

// Định nghĩa thủ công Schema thô để chạy script độc lập siêu nhanh không phụ thuộc NestJS CLI
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: "" },
  avatar: { type: String, default: "" },
  status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
  roles: { type: [String], default: ["spectator"] }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

const MONGODB_URI = "mongodb+srv://hoandepzai235_db_user:Admin123@cluster0.rxgxctj.mongodb.net/horsetrack?retryWrites=true&w=majority&appName=Cluster0";

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  console.log("Cleaning existing test accounts...");
  const emailsToDelete = [
    "admin@horsetrack.local",
    "owner@horsetrack.local",
    "jockey@horsetrack.local",
    "referee@horsetrack.local",
    "spectator@horsetrack.local",
    "multi@horsetrack.local"
  ];
  await User.deleteMany({ email: { $in: emailsToDelete } });
  console.log("Cleaned up old accounts.");

  console.log("Hashing passwords...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersToCreate = [
    {
      fullName: "Admin Race Control",
      email: "admin@horsetrack.local",
      passwordHash,
      phone: "0123456789",
      status: "active",
      roles: ["admin"]
    },
    {
      fullName: "John Stable Owner",
      email: "owner@horsetrack.local",
      passwordHash,
      phone: "0123456788",
      status: "active",
      roles: ["owner"]
    },
    {
      fullName: "Marcus Speed Jockey",
      email: "jockey@horsetrack.local",
      passwordHash,
      phone: "0123456787",
      status: "active",
      roles: ["jockey"]
    },
    {
      fullName: "Sarah Fair Referee",
      email: "referee@horsetrack.local",
      passwordHash,
      phone: "0123456786",
      status: "active",
      roles: ["referee"]
    },
    {
      fullName: "Tony Fan Spectator",
      email: "spectator@horsetrack.local",
      passwordHash,
      phone: "0123456785",
      status: "active",
      roles: ["spectator"]
    },
    {
      fullName: "David Multi Rider",
      email: "multi@horsetrack.local",
      passwordHash,
      phone: "0123456784",
      status: "active",
      roles: ["owner", "spectator"]
    }
  ];

  console.log("Creating new seed accounts...");
  const createdUsers = await User.insertMany(usersToCreate);
  console.log("Users created successfully:");
  for (const u of createdUsers) {
    console.log(`- ${u.fullName} (${u.email}) [Roles: ${u.roles.join(", ")}]`);
  }

  await mongoose.disconnect();
  console.log("Database connection closed. Seed complete!");
}

seed().catch(err => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
