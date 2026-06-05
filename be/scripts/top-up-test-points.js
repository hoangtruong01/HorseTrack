const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const POINTS_TO_ADD = 5000;

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const entries = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      const key = line.slice(0, index);
      const value = line.slice(index + 1).replace(/^[\'\"]|[\'\"]$/g, '');
      return [key, value];
    });

  return Object.fromEntries(entries);
}

async function main() {
  const env = loadEnv();
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in be/.env');
  }

  await mongoose.connect(env.MONGODB_URI);

  const users = mongoose.connection.collection('users');
  const ledger = mongoose.connection.collection('rewardpointledgers');
  const allUsers = await users
    .find({})
    .project({ _id: 1, email: 1, fullName: 1 })
    .toArray();

  const session = await mongoose.startSession();
  const changed = [];

  try {
    await session.withTransaction(async () => {
      for (const user of allUsers) {
        const latest = await ledger
          .find({ userId: user._id }, { session })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
        const before = latest[0]?.balanceAfter ?? 0;
        const after = before + POINTS_TO_ADD;

        await ledger.insertOne(
          {
            userId: user._id,
            sourceType: 'admin_adjustment',
            pointsDelta: POINTS_TO_ADD,
            balanceAfter: after,
            note: 'Test top-up +5000 points for flow verification',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        );

        await users.updateOne(
          { _id: user._id },
          { $set: { points: after } },
          { session },
        );

        changed.push({ email: user.email, name: user.fullName, before, after });
      }
    });
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }

  console.log(JSON.stringify({ count: changed.length, changed }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
