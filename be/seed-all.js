/**
 * seed-all.js — Seed ĐẦYĐỦ dữ liệu test HorseTrack
 *
 * Chạy: node seed-all.js
 *
 * - IDEMPOTENT: Chạy lại nhiều lần không bị lỗi, không xóa dữ liệu cũ.
 * - Bổ sung đầy đủ: Users, Jockeys, RefereeProfiles, Horses, Tournaments,
 *   Races, RefereeAssignments, Registrations, JockeyInvitations, RaceChecks,
 *   RaceResults, Prizes, Predictions, RewardPointLedger, AIPredictionPackages.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI =
  'mongodb+srv://hoandepzai235_db_user:Admin123@cluster0.rxgxctj.mongodb.net/horsetrack?retryWrites=true&w=majority&appName=Cluster0';

// ═══════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════

const UserSchema = new mongoose.Schema(
  { fullName: String, email: { type: String, unique: true }, passwordHash: String, phone: String, address: String, dob: Date, avatar: String, status: { type: String, default: 'active' }, roles: { type: [String], default: ['spectator'] }, points: { type: Number, default: 0 }, provider: { type: String, default: 'local' } },
  { timestamps: true },
);

const JockeySchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }, heightCm: Number, weightKg: Number, experienceYears: { type: Number, default: 0 }, status: { type: String, default: 'available' }, approvalStatus: { type: String, default: 'APPROVED' }, skillLevel: String, licenseNumber: String, bio: String, specialty: String, winCount: { type: Number, default: 0 }, totalRaces: { type: Number, default: 0 } },
  { timestamps: true },
);

const RefereeProfileSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }, licenseNo: String, experienceYears: { type: Number, default: 0 }, status: { type: String, default: 'available' }, approvalStatus: { type: String, default: 'APPROVED' }, certificates: String, bio: String },
  { timestamps: true },
);

const HorseSchema = new mongoose.Schema(
  { name: String, breed: String, age: Number, gender: String, color: String, weightKg: Number, heightCm: Number, dateOfBirth: Date, healthStatus: { type: String, default: 'HEALTHY' }, status: { type: String, default: 'ACTIVE' }, approvalStatus: { type: String, default: 'APPROVED' }, ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, baseSpeed: { type: Number, default: 70 }, staminaScore: { type: Number, default: 70 }, description: String, winCount: { type: Number, default: 0 }, totalRaces: { type: Number, default: 0 } },
  { timestamps: true },
);

const TournamentSchema = new mongoose.Schema(
  { name: String, description: String, location: String, startDate: Date, endDate: Date, registrationStartDate: Date, registrationEndDate: Date, status: { type: String, default: 'ONGOING' }, maxHorses: { type: Number, default: 20 }, prizePool: { type: Number, default: 0 }, imageUrl: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
  { timestamps: true },
);

const RaceSchema = new mongoose.Schema(
  { tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, name: String, description: String, raceNumber: Number, startTime: Date, endTime: Date, location: String, distanceMeters: Number, lapCount: { type: Number, default: 1 }, maxParticipants: { type: Number, default: 10 }, prize: { type: Number, default: 0 }, status: { type: String, default: 'RESULT_PUBLISHED' }, weather: String, raceType: String, weatherSnapshot: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
  { timestamps: true },
);

const RefereeAssignmentSchema = new mongoose.Schema(
  { raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' }, refereeUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, role: { type: String, default: 'main' }, status: { type: String, default: 'accepted' }, salary: { type: Number, default: 500000 } },
  { timestamps: true },
);

const RegistrationSchema = new mongoose.Schema(
  { tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' }, horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' }, ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, jockeyUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, default: 'APPROVED' }, jockeySharePercent: { type: Number, default: 30 }, approvedAt: Date, approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
  { timestamps: true },
);

const JockeyInvitationSchema = new mongoose.Schema(
  { registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }, tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' }, horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' }, ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, jockeyUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, default: 'ACCEPTED' }, message: String, jockeySharePercent: { type: Number, default: 30 }, respondedAt: Date, expiredAt: Date },
  { timestamps: true },
);

const RaceCheckSchema = new mongoose.Schema(
  { raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' }, raceRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }, horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' }, checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, default: 'passed' }, healthNote: String, equipmentNote: String, jockeyCheckedIn: { type: Boolean, default: true }, jockeyNote: String, checkedAt: Date },
  { timestamps: true },
);

const RaceResultSchema = new mongoose.Schema(
  { tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' }, raceRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }, horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' }, ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, jockeyUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rank: Number, finishTimeMs: Number, rawFinishTimeMs: Number, points: { type: Number, default: 0 }, prizeAmount: { type: Number, default: 0 }, outcome: String, incident: { type: String, default: 'NONE' }, finalScore: Number, status: { type: String, default: 'PUBLISHED' }, recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, confirmedAt: Date, publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, publishedAt: Date },
  { timestamps: true },
);

const PrizeSchema = new mongoose.Schema(
  { tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' }, horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' }, ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rank: Number, amount: { type: Number, default: 0 }, status: { type: String, default: 'PAID' }, paidAt: Date },
  { timestamps: true },
);

const PredictionSchema = new mongoose.Schema(
  { raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' }, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, predictedHorseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' }, status: { type: String, default: 'PENDING' }, rewardPoints: { type: Number, default: 0 }, betPoints: { type: Number, default: 0 }, evaluatedAt: Date },
  { timestamps: true },
);

const RewardPointLedgerSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sourceType: String, sourceId: { type: mongoose.Schema.Types.ObjectId }, pointsDelta: Number, balanceAfter: Number, note: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
  { timestamps: true },
);

const AIPredictionPackageSchema = new mongoose.Schema(
  { name: String, description: String, price: { type: Number, default: 0 }, durationDays: { type: Number, default: 30 }, accuracyRate: { type: Number, default: 80 }, status: { type: String, default: 'ACTIVE' } },
  { timestamps: true },
);

// ═══════════════════════════════════════════════════════════
// MODELS
// ═══════════════════════════════════════════════════════════

const User = mongoose.model('User', UserSchema);
const Jockey = mongoose.model('Jockey', JockeySchema);
const RefereeProfile = mongoose.model('RefereeProfile', RefereeProfileSchema);
const Horse = mongoose.model('Horse', HorseSchema);
const Tournament = mongoose.model('Tournament', TournamentSchema);
const Race = mongoose.model('Race', RaceSchema);
const RefereeAssignment = mongoose.model('RefereeAssignment', RefereeAssignmentSchema);
const Registration = mongoose.model('Registration', RegistrationSchema);
const JockeyInvitation = mongoose.model('JockeyInvitation', JockeyInvitationSchema);
const RaceCheck = mongoose.model('RaceCheck', RaceCheckSchema);
const RaceResult = mongoose.model('RaceResult', RaceResultSchema);
const Prize = mongoose.model('Prize', PrizeSchema);
const Prediction = mongoose.model('Prediction', PredictionSchema);
const RewardPointLedger = mongoose.model('RewardPointLedger', RewardPointLedgerSchema);
const AIPredictionPackage = mongoose.model('AIPredictionPackage', AIPredictionPackageSchema);

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function hoursAgo(n) { return new Date(Date.now() - n * 3600000); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

let created = 0, skipped = 0;

async function upsertOne(Model, query, data, label) {
  const existing = await Model.findOne(query);
  if (existing) {
    skipped++;
    return existing;
  }
  const doc = await Model.create(data);
  created++;
  console.log('  CREATE ' + label);
  return doc;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  const hash = await bcrypt.hash('password123', 10);

  // ──────────────────────────────────────────────────────────
  // 1. USERS (20 accounts đầy đủ roles, gồm các tài khoản demo trình bày)
  // ──────────────────────────────────────────────────────────
  console.log('[1/15] Users...');
  const usersData = [
    { fullName: 'Admin HorseTrack',   email: 'admin@horsetrack.local',       roles: ['admin'],          points: 0,    phone: '0900000001' },
    { fullName: 'Nguyen Van An',      email: 'owner1@horsetrack.local',      roles: ['owner'],          points: 500,  phone: '0900000002' },
    { fullName: 'Tran Thi Binh',      email: 'owner2@horsetrack.local',      roles: ['owner'],          points: 320,  phone: '0900000003' },
    { fullName: 'Le Van Cuong',       email: 'owner3@horsetrack.local',      roles: ['owner'],          points: 180,  phone: '0900000004' },
    { fullName: 'Pham Thi Dung',      email: 'jockey1@horsetrack.local',     roles: ['jockey'],         points: 200,  phone: '0900000005' },
    { fullName: 'Hoang Van Em',       email: 'jockey2@horsetrack.local',     roles: ['jockey'],         points: 150,  phone: '0900000006' },
    { fullName: 'Nguyen Thi Fan',     email: 'jockey3@horsetrack.local',     roles: ['jockey'],         points: 90,   phone: '0900000007' },
    { fullName: 'Vu Van Giang',       email: 'referee1@horsetrack.local',    roles: ['referee'],        points: 0,    phone: '0900000008' },
    { fullName: 'Dang Thi Hoa',       email: 'referee2@horsetrack.local',    roles: ['referee'],        points: 0,    phone: '0900000009' },
    { fullName: 'Bui Van Inh',        email: 'counter@horsetrack.local',     roles: ['counter_staff'],  points: 0,    phone: '0900000010' },
    { fullName: 'Nguyen Thi Kim',     email: 'spectator1@horsetrack.local',  roles: ['spectator'],      points: 1200, phone: '0900000011' },
    { fullName: 'Tran Van Long',      email: 'spectator2@horsetrack.local',  roles: ['spectator'],      points: 850,  phone: '0900000012' },
    { fullName: 'Le Thi Mai',         email: 'spectator3@horsetrack.local',  roles: ['spectator'],      points: 430,  phone: '0900000013' },
    { fullName: 'Pham Van Nam',       email: 'spectator4@horsetrack.local',  roles: ['spectator'],      points: 260,  phone: '0900000014' },
    { fullName: 'Hoang Thi Oanh',     email: 'spectator5@horsetrack.local',  roles: ['spectator'],      points: 75,   phone: '0900000015' },
    { fullName: 'Demo Owner',         email: 'owner@horsetrack.local',       roles: ['owner'],          points: 1000, phone: '0900000016' },
    { fullName: 'Demo Jockey',        email: 'jockey@horsetrack.local',      roles: ['jockey'],         points: 500,  phone: '0900000017' },
    { fullName: 'Demo Referee',       email: 'referee@horsetrack.local',     roles: ['referee'],        points: 0,    phone: '0900000018' },
    { fullName: 'Demo Spectator',     email: 'spectator@horsetrack.local',   roles: ['spectator'],      points: 1500, phone: '0900000019' },
    { fullName: 'Demo Counter Staff', email: 'counter@horsetrack.local',     roles: ['counter_staff'],  points: 0,    phone: '0900000020' },
  ];
  const U = {};
  for (const u of usersData) {
    U[u.email] = await upsertOne(User, { email: u.email }, { ...u, passwordHash: hash, status: 'active', provider: 'local' }, 'User: ' + u.email);
  }

  // ──────────────────────────────────────────────────────────
  // 2. JOCKEY PROFILES (3 profiles)
  // ──────────────────────────────────────────────────────────
  console.log('[2/15] Jockey Profiles...');
  const jockeyProfiles = [
    { userId: U['jockey1@horsetrack.local']._id, heightCm: 165, weightKg: 55, experienceYears: 8, skillLevel: 'professional', licenseNumber: 'JL-2024-001', bio: 'Tay dua chuyen nghiep 8 nam kinh nghiem.', specialty: 'Duong dua ngan', winCount: 24, totalRaces: 60 },
    { userId: U['jockey2@horsetrack.local']._id, heightCm: 168, weightKg: 58, experienceYears: 5, skillLevel: 'advanced',      licenseNumber: 'JL-2024-002', bio: 'Tay dua gioi ve duong dua dai.',           specialty: 'Duong dua dai',  winCount: 12, totalRaces: 40 },
    { userId: U['jockey3@horsetrack.local']._id, heightCm: 162, weightKg: 52, experienceYears: 2, skillLevel: 'intermediate',  licenseNumber: 'JL-2024-003', bio: 'Tay dua tre trien vong.',                  specialty: 'Hon hop',        winCount: 3,  totalRaces: 15 },
    { userId: U['jockey@horsetrack.local']._id,  heightCm: 166, weightKg: 56, experienceYears: 6, skillLevel: 'professional', licenseNumber: 'JL-DEMO-001', bio: 'Tai khoan demo trinh bay.',              specialty: 'Duong dua dai',  winCount: 18, totalRaces: 45 },
  ];
  const J = [];
  for (const j of jockeyProfiles) {
    J.push(await upsertOne(Jockey, { userId: j.userId }, { ...j, status: 'available', approvalStatus: 'APPROVED' }, 'Jockey: ' + j.licenseNumber));
  }

  // ──────────────────────────────────────────────────────────
  // 3. REFEREE PROFILES (2 profiles)
  // ──────────────────────────────────────────────────────────
  console.log('[3/15] Referee Profiles...');
  const refProfiles = [
    { userId: U['referee1@horsetrack.local']._id, licenseNo: 'RF-2024-001', experienceYears: 10, bio: 'Trong tai chinh nhieu nam kinh nghiem.' },
    { userId: U['referee2@horsetrack.local']._id, licenseNo: 'RF-2024-002', experienceYears: 5,  bio: 'Trong tai phu, chuyen mon cao.' },
    { userId: U['referee@horsetrack.local']._id,  licenseNo: 'RF-DEMO-001', experienceYears: 7,  bio: 'Tai khoan trong tai demo trinh bay.' },
  ];
  const RP = [];
  for (const r of refProfiles) {
    RP.push(await upsertOne(RefereeProfile, { userId: r.userId }, { ...r, status: 'available', approvalStatus: 'APPROVED' }, 'RefereeProfile: ' + r.licenseNo));
  }

  // ──────────────────────────────────────────────────────────
  // 4. HORSES (10 con ngựa)
  // ──────────────────────────────────────────────────────────
  console.log('[4/15] Horses...');
  const horsesData = [
    // owner1: horses 0,1,2,9
    { name: 'Thunder Bolt', breed: 'Thoroughbred',  age: 5, gender: 'MALE',    color: 'Bay',       weightKg: 480, heightCm: 162, baseSpeed: 88, staminaScore: 82, ownerId: U['owner1@horsetrack.local']._id, winCount: 8,  totalRaces: 20 },
    { name: 'Silver Wind',  breed: 'Arabian',       age: 4, gender: 'FEMALE',  color: 'Grey',      weightKg: 440, heightCm: 155, baseSpeed: 85, staminaScore: 90, ownerId: U['owner1@horsetrack.local']._id, winCount: 5,  totalRaces: 15 },
    { name: 'Dark Storm',   breed: 'Thoroughbred',  age: 6, gender: 'MALE',    color: 'Black',     weightKg: 490, heightCm: 165, baseSpeed: 91, staminaScore: 75, ownerId: U['owner1@horsetrack.local']._id, winCount: 12, totalRaces: 25 },
    // owner2: horses 3,4,5
    { name: 'Golden Star',  breed: 'Quarter Horse', age: 3, gender: 'FEMALE',  color: 'Chestnut',  weightKg: 450, heightCm: 158, baseSpeed: 80, staminaScore: 85, ownerId: U['owner2@horsetrack.local']._id, winCount: 3,  totalRaces: 10 },
    { name: 'Blue River',   breed: 'Arabian',       age: 5, gender: 'GELDING', color: 'Blue Roan', weightKg: 460, heightCm: 160, baseSpeed: 83, staminaScore: 88, ownerId: U['owner2@horsetrack.local']._id, winCount: 6,  totalRaces: 18 },
    { name: 'Iron Duke',    breed: 'Thoroughbred',  age: 7, gender: 'MALE',    color: 'Dark Bay',  weightKg: 510, heightCm: 168, baseSpeed: 86, staminaScore: 79, ownerId: U['owner2@horsetrack.local']._id, winCount: 10, totalRaces: 22 },
    // owner3: horses 6,7,8
    { name: 'Rose Petal',   breed: 'Warmblood',     age: 4, gender: 'FEMALE',  color: 'Palomino',  weightKg: 430, heightCm: 154, baseSpeed: 77, staminaScore: 92, ownerId: U['owner3@horsetrack.local']._id, winCount: 2,  totalRaces: 8  },
    { name: 'Night Fury',   breed: 'Thoroughbred',  age: 5, gender: 'MALE',    color: 'Black',     weightKg: 475, heightCm: 163, baseSpeed: 89, staminaScore: 80, ownerId: U['owner3@horsetrack.local']._id, winCount: 7,  totalRaces: 16 },
    { name: 'Crimson Tide', breed: 'Quarter Horse', age: 6, gender: 'FEMALE',  color: 'Sorrel',    weightKg: 445, heightCm: 157, baseSpeed: 82, staminaScore: 86, ownerId: U['owner3@horsetrack.local']._id, winCount: 4,  totalRaces: 12 },
    // owner1: horse 9
    { name: 'Storm Chaser', breed: 'Arabian',       age: 3, gender: 'MALE',    color: 'Bay',       weightKg: 420, heightCm: 152, baseSpeed: 79, staminaScore: 88, ownerId: U['owner1@horsetrack.local']._id, winCount: 1,  totalRaces: 5  },
    // demo owner: horses for presentation and owner dashboard
    { name: 'Demo Sunrise',  breed: 'Thoroughbred',  age: 5, gender: 'FEMALE',  color: 'Chestnut',  weightKg: 465, heightCm: 160, baseSpeed: 87, staminaScore: 84, ownerId: U['owner@horsetrack.local']._id, winCount: 6,  totalRaces: 14 },
    { name: 'Demo Eclipse',  breed: 'Arabian',       age: 4, gender: 'MALE',    color: 'Black',     weightKg: 450, heightCm: 158, baseSpeed: 85, staminaScore: 89, ownerId: U['owner@horsetrack.local']._id, winCount: 4,  totalRaces: 11 },
  ];
  const H = [];
  for (const h of horsesData) {
    H.push(await upsertOne(Horse, { name: h.name, ownerId: h.ownerId }, { ...h, healthStatus: 'HEALTHY', status: 'ACTIVE', approvalStatus: 'APPROVED', dateOfBirth: daysAgo(h.age * 365) }, 'Horse: ' + h.name));
  }

  // ──────────────────────────────────────────────────────────
  // 5. TOURNAMENTS (3 giải đấu)
  // ──────────────────────────────────────────────────────────
  console.log('[5/15] Tournaments...');
  const tournamentsData = [
    { name: 'Giai Dua Mua He 2025',      description: 'Giai dua ngua thuong nien mua he.',  location: 'Truong dua Phu Tho, TP.HCM',         startDate: daysAgo(30),    endDate: daysAgo(5),      registrationStartDate: daysAgo(60), registrationEndDate: daysAgo(35), status: 'COMPLETED',         maxHorses: 20, prizePool: 50000000,  createdBy: U['admin@horsetrack.local']._id },
    { name: 'Cup Vo Dich Quoc Gia 2025', description: 'Giai dau lon nhat trong nam.',        location: 'Truong dua Dai Nam, Binh Duong',      startDate: daysAgo(7),     endDate: daysFromNow(14), registrationStartDate: daysAgo(30), registrationEndDate: daysAgo(10), status: 'ONGOING',           maxHorses: 30, prizePool: 200000000, createdBy: U['admin@horsetrack.local']._id },
    { name: 'Giai Tre Trien Vong 2025',  description: 'San choi danh cho ngua tre.',         location: 'Truong dua Thien Ma, Ha Noi',          startDate: daysFromNow(20), endDate: daysFromNow(50), registrationStartDate: daysFromNow(1), registrationEndDate: daysFromNow(15), status: 'OPEN_REGISTRATION', maxHorses: 15, prizePool: 30000000,  createdBy: U['admin@horsetrack.local']._id },
  ];
  const T = [];
  for (const t of tournamentsData) {
    T.push(await upsertOne(Tournament, { name: t.name }, t, 'Tournament: ' + t.name));
  }

  // ──────────────────────────────────────────────────────────
  // 6. RACES (8 cuộc đua)
  // races[0-3] = T[0] (completed), races[4-7] = T[1] (ongoing)
  // ──────────────────────────────────────────────────────────
  console.log('[6/15] Races...');
  const racesData = [
    // T[0] — COMPLETED
    { tournamentId: T[0]._id, name: 'Vong Loai 1 - 1000m',        raceNumber: 1, startTime: daysAgo(29), endTime: hoursAgo(29*24+2), location: 'Phu Tho - Duong A',     distanceMeters: 1000, prize: 5000000,   status: 'RESULT_PUBLISHED', weather: 'SUNNY',  raceType: 'QUALIFICATION', createdBy: U['admin@horsetrack.local']._id },
    { tournamentId: T[0]._id, name: 'Vong Loai 2 - 1200m',        raceNumber: 2, startTime: daysAgo(22), endTime: hoursAgo(22*24+2), location: 'Phu Tho - Duong B',     distanceMeters: 1200, prize: 5000000,   status: 'RESULT_PUBLISHED', weather: 'CLOUDY', raceType: 'QUALIFICATION', createdBy: U['admin@horsetrack.local']._id },
    { tournamentId: T[0]._id, name: 'Ban Ket - 1500m',             raceNumber: 3, startTime: daysAgo(15), endTime: hoursAgo(15*24+2), location: 'Phu Tho - Duong A',     distanceMeters: 1500, prize: 10000000,  status: 'RESULT_PUBLISHED', weather: 'SUNNY',  raceType: 'SEMI_FINAL',    createdBy: U['admin@horsetrack.local']._id },
    { tournamentId: T[0]._id, name: 'Chung Ket - 2000m',           raceNumber: 4, startTime: daysAgo(6),  endTime: hoursAgo(6*24+2),  location: 'Phu Tho - Duong Chinh', distanceMeters: 2000, prize: 30000000,  status: 'RESULT_PUBLISHED', weather: 'SUNNY',  raceType: 'FINAL',         createdBy: U['admin@horsetrack.local']._id },
    // T[1] — ONGOING (2 đã kết thúc, 2 sắp tới)
    { tournamentId: T[1]._id, name: 'Vong Loai A - 1200m',         raceNumber: 1, startTime: daysAgo(5),  endTime: hoursAgo(5*24+2),  location: 'Dai Nam - Duong 1',      distanceMeters: 1200, prize: 10000000,  status: 'RESULT_PUBLISHED', weather: 'SUNNY',  raceType: 'QUALIFICATION', createdBy: U['admin@horsetrack.local']._id },
    { tournamentId: T[1]._id, name: 'Vong Loai B - 1200m',         raceNumber: 2, startTime: daysAgo(3),  endTime: hoursAgo(3*24+2),  location: 'Dai Nam - Duong 2',      distanceMeters: 1200, prize: 10000000,  status: 'RESULT_PUBLISHED', weather: 'CLOUDY', raceType: 'QUALIFICATION', createdBy: U['admin@horsetrack.local']._id },
    { tournamentId: T[1]._id, name: 'Ban Ket - 1800m',             raceNumber: 3, startTime: daysFromNow(3), endTime: null, location: 'Dai Nam - Duong Chinh',  distanceMeters: 1800, prize: 20000000,  status: 'SCHEDULED',        weather: 'SUNNY',  raceType: 'SEMI_FINAL',    createdBy: U['admin@horsetrack.local']._id },
    { tournamentId: T[1]._id, name: 'Chung Ket Quoc Gia - 2400m',  raceNumber: 4, startTime: daysFromNow(10), endTime: null, location: 'Dai Nam - Grand Prix',  distanceMeters: 2400, prize: 100000000, status: 'SCHEDULED',        weather: 'SUNNY',  raceType: 'FINAL',         createdBy: U['admin@horsetrack.local']._id },
  ];
  const R = [];
  for (const r of racesData) {
    R.push(await upsertOne(Race, { name: r.name, tournamentId: r.tournamentId }, { ...r, lapCount: 1, maxParticipants: 10, weatherSnapshot: r.weather === 'SUNNY' ? 'Nang dep, gio nhe' : 'Nhieu may, mat me' }, 'Race: ' + r.name));
  }

  // ──────────────────────────────────────────────────────────
  // 7. REFEREE ASSIGNMENTS
  // Mỗi race (completed) được phân công 1 referee main + 1 assistant
  // ──────────────────────────────────────────────────────────
  console.log('[7/15] Referee Assignments...');
  // Các race đã kết thúc: R[0],R[1],R[2],R[3],R[4],R[5]
  const completedRaces = [R[0], R[1], R[2], R[3], R[4], R[5]];
  for (const race of completedRaces) {
    await upsertOne(RefereeAssignment, { raceId: race._id, refereeUserId: U['referee1@horsetrack.local']._id },
      { raceId: race._id, refereeUserId: U['referee1@horsetrack.local']._id, assignedBy: U['admin@horsetrack.local']._id, role: 'main',      status: 'accepted', salary: 500000 },
      'RefereeAssignment main: ' + race.name);
    await upsertOne(RefereeAssignment, { raceId: race._id, refereeUserId: U['referee2@horsetrack.local']._id },
      { raceId: race._id, refereeUserId: U['referee2@horsetrack.local']._id, assignedBy: U['admin@horsetrack.local']._id, role: 'assistant', status: 'accepted', salary: 300000 },
      'RefereeAssignment asst: ' + race.name);
  }

  // ──────────────────────────────────────────────────────────
  // 8. REGISTRATIONS
  // Ràng buộc: unique(tournamentId, horseId) — mỗi ngựa 1 race/tournament
  // T[0]: horses 0-9 mỗi con vào đúng 1 race
  // T[1]: horses 0-9 mỗi con vào đúng 1 race
  // ──────────────────────────────────────────────────────────
  console.log('[8/15] Registrations...');
  // jockey rotation: j1,j2,j3,j1,j2,j3,...
  const jE = ['jockey1@horsetrack.local', 'jockey2@horsetrack.local', 'jockey3@horsetrack.local'];
  function jOf(i) { return U[jE[i % 3]]._id; }

  // T[0] registrations — mỗi ngựa chỉ 1 race
  const regCfgT0 = [
    // Race R[0] — 4 horses
    { raceIdx: 0, horseIdx: 0 }, { raceIdx: 0, horseIdx: 1 }, { raceIdx: 0, horseIdx: 3 }, { raceIdx: 0, horseIdx: 4 },
    // Race R[1] — 4 horses
    { raceIdx: 1, horseIdx: 2 }, { raceIdx: 1, horseIdx: 5 }, { raceIdx: 1, horseIdx: 7 }, { raceIdx: 1, horseIdx: 8 },
    // Race R[2] — 1 horse
    { raceIdx: 2, horseIdx: 6 },
    // Race R[3] — 1 horse
    { raceIdx: 3, horseIdx: 9 },
  ];
  // T[1] registrations — mỗi ngựa chỉ 1 race
  const regCfgT1 = [
    // Race R[4] — 5 horses
    { raceIdx: 4, horseIdx: 0 }, { raceIdx: 4, horseIdx: 1 }, { raceIdx: 4, horseIdx: 3 }, { raceIdx: 4, horseIdx: 4 }, { raceIdx: 4, horseIdx: 6 },
    // Race R[5] — 5 horses
    { raceIdx: 5, horseIdx: 2 }, { raceIdx: 5, horseIdx: 5 }, { raceIdx: 5, horseIdx: 7 }, { raceIdx: 5, horseIdx: 8 }, { raceIdx: 5, horseIdx: 9 },
    // Race R[6] — upcoming, chưa có reg (hoặc pending)
    // Race R[7] — upcoming
  ];
  const allRegCfg = [...regCfgT0, ...regCfgT1];
  const REG = [];
  let regIdx = 0;
  for (const cfg of allRegCfg) {
    const race = R[cfg.raceIdx];
    const horse = H[cfg.horseIdx];
    const owner = horse.ownerId;
    const jockeyId = jOf(regIdx);
    const isCompleted = ['RESULT_PUBLISHED', 'FINISHED'].includes(race.status);
    const reg = await upsertOne(Registration,
      { tournamentId: race.tournamentId, horseId: horse._id },  // unique index
      {
        tournamentId: race.tournamentId,
        raceId: race._id,
        horseId: horse._id,
        ownerId: owner,
        jockeyUserId: jockeyId,
        status: 'APPROVED',
        jockeySharePercent: 30,
        approvedAt: isCompleted ? daysAgo(Math.abs(cfg.raceIdx - 12)) : null,
        approvedBy: U['admin@horsetrack.local']._id,
      },
      'Reg: ' + horse.name + ' -> ' + race.name
    );
    REG.push({ reg, race, horse, owner, jockeyId, isCompleted });
    regIdx++;
  }

  // ──────────────────────────────────────────────────────────
  // 9. JOCKEY INVITATIONS (cho các registration đã APPROVED)
  // ──────────────────────────────────────────────────────────
  console.log('[9/15] Jockey Invitations...');
  for (const { reg, race, horse, owner, jockeyId } of REG) {
    await upsertOne(JockeyInvitation,
      { registrationId: reg._id },
      {
        registrationId: reg._id,
        tournamentId: race.tournamentId,
        raceId: race._id,
        horseId: horse._id,
        ownerId: owner,
        jockeyUserId: jockeyId,
        status: 'ACCEPTED',
        message: 'Moi ban tham gia cuoc dua ' + race.name,
        jockeySharePercent: 30,
        respondedAt: daysAgo(5),
        expiredAt: daysFromNow(30),
      },
      'JockeyInvitation -> ' + race.name
    );
  }

  // ──────────────────────────────────────────────────────────
  // 10. RACE CHECKS (cho các race đã kết thúc)
  // ──────────────────────────────────────────────────────────
  console.log('[10/15] Race Checks...');
  for (const { reg, race, horse, isCompleted } of REG) {
    if (!isCompleted) continue;
    await upsertOne(RaceCheck,
      { raceId: race._id, raceRegistrationId: reg._id },
      {
        raceId: race._id,
        raceRegistrationId: reg._id,
        horseId: horse._id,
        checkedBy: U['referee1@horsetrack.local']._id,
        status: 'passed',
        healthNote: 'Ngua khoe manh, du dieu kien thi dau.',
        equipmentNote: 'Trang bi day du, hop le.',
        jockeyCheckedIn: true,
        jockeyNote: 'Jockey da check-in dung gio.',
        checkedAt: new Date(race.startTime.getTime() - 3600000),
      },
      'RaceCheck: ' + horse.name + ' @ ' + race.name
    );
  }

  // ──────────────────────────────────────────────────────────
  // 11. RACE RESULTS (cho các race đã RESULT_PUBLISHED)
  // ──────────────────────────────────────────────────────────
  console.log('[11/15] Race Results...');
  const prizeRatios  = [0.5, 0.3, 0.15, 0.05, 0, 0, 0, 0, 0, 0];
  const pointsByRank = [100, 70, 50, 30, 20, 10, 5, 5, 5, 5];

  // Group registrations by raceId
  const regByRace = {};
  for (const item of REG) {
    if (!item.isCompleted) continue;
    const rId = item.race._id.toString();
    if (!regByRace[rId]) regByRace[rId] = [];
    regByRace[rId].push(item);
  }

  for (const [raceId, items] of Object.entries(regByRace)) {
    const race = items[0].race;
    const basePrize = race.prize || 5000000;
    const baseMs = 90000 + randInt(5000, 20000);
    for (let i = 0; i < items.length; i++) {
      const { reg, horse, owner, jockeyId } = items[i];
      const rank = i + 1;
      const finishTimeMs = baseMs + rank * randInt(800, 2500);
      await upsertOne(RaceResult,
        { raceId: race._id, horseId: horse._id },
        {
          tournamentId: race.tournamentId,
          raceId: race._id,
          raceRegistrationId: reg._id,
          horseId: horse._id,
          ownerId: owner,
          jockeyUserId: jockeyId,
          rank,
          finishTimeMs,
          rawFinishTimeMs: finishTimeMs + randInt(-300, 300),
          points: pointsByRank[i] || 5,
          prizeAmount: Math.floor((prizeRatios[i] || 0) * basePrize),
          outcome: 'finished',
          incident: 'NONE',
          finalScore: Math.round(10000000 / finishTimeMs * 100) / 100,
          status: 'PUBLISHED',
          recordedBy: U['referee1@horsetrack.local']._id,
          confirmedBy: U['referee1@horsetrack.local']._id,
          confirmedAt: race.endTime || daysAgo(2),
          publishedBy: U['admin@horsetrack.local']._id,
          publishedAt: race.endTime || daysAgo(2),
        },
        'RaceResult: ' + race.name + ' rank=' + rank
      );
    }
  }

  // ──────────────────────────────────────────────────────────
  // 12. PRIZES (tương ứng race results rank 1,2,3)
  // ──────────────────────────────────────────────────────────
  console.log('[12/15] Prizes...');
  for (const [raceId, items] of Object.entries(regByRace)) {
    const race = items[0].race;
    const basePrize = race.prize || 5000000;
    for (let i = 0; i < Math.min(items.length, 3); i++) {
      const { horse, owner } = items[i];
      const rank = i + 1;
      const amount = Math.floor((prizeRatios[i] || 0) * basePrize);
      if (amount <= 0) continue;
      await upsertOne(Prize,
        { raceId: race._id, horseId: horse._id, ownerId: owner },
        {
          tournamentId: race.tournamentId,
          raceId: race._id,
          horseId: horse._id,
          ownerId: owner,
          rank,
          amount,
          status: 'PAID',
          paidAt: race.endTime || daysAgo(2),
        },
        'Prize rank=' + rank + ' race=' + race.name
      );
    }
  }

  // ──────────────────────────────────────────────────────────
  // 13. PREDICTIONS (spectators đặt cược vào races đã xong)
  // ──────────────────────────────────────────────────────────
  console.log('[13/15] Predictions...');
  const spectators = [
    U['spectator1@horsetrack.local'],
    U['spectator2@horsetrack.local'],
    U['spectator3@horsetrack.local'],
    U['spectator4@horsetrack.local'],
    U['spectator5@horsetrack.local'],
  ];
  // Mỗi spectator đặt cược vào 2 race đã kết thúc
  const doneRaces = [R[0], R[1], R[4], R[5]];
  for (let si = 0; si < spectators.length; si++) {
    const sp = spectators[si];
    for (let ri = 0; ri < Math.min(2, doneRaces.length); ri++) {
      const race = doneRaces[(si + ri) % doneRaces.length];
      // Pick a horse in that race
      const raceRegs = regByRace[race._id.toString()];
      if (!raceRegs || raceRegs.length === 0) continue;
      const pickedHorse = raceRegs[si % raceRegs.length].horse;
      const isWinner = raceRegs[si % raceRegs.length].reg._id && si % raceRegs.length === 0;
      await upsertOne(Prediction,
        { raceId: race._id, userId: sp._id },
        {
          raceId: race._id,
          userId: sp._id,
          predictedHorseId: pickedHorse._id,
          status: isWinner ? 'WON' : 'LOST',
          betPoints: 50,
          rewardPoints: isWinner ? 150 : 0,
          evaluatedAt: race.endTime || daysAgo(1),
        },
        'Prediction: ' + sp.fullName + ' @ ' + race.name
      );
    }
  }

  // ──────────────────────────────────────────────────────────
  // 14. REWARD POINT LEDGER
  // ──────────────────────────────────────────────────────────
  console.log('[14/15] Reward Point Ledger...');
  // Ledger entry cho từng spectator có points
  for (const sp of spectators) {
    if (sp.points > 0) {
      // Kiểm tra đã có ledger chưa (dùng userId + sourceType + note để dedup)
      const existing = await RewardPointLedger.findOne({ userId: sp._id, sourceType: 'admin_adjustment', note: 'Initial seed balance' });
      if (!existing) {
        await RewardPointLedger.create({ userId: sp._id, sourceType: 'admin_adjustment', pointsDelta: sp.points, balanceAfter: sp.points, note: 'Initial seed balance', createdBy: U['admin@horsetrack.local']._id });
        created++;
        console.log('  CREATE Ledger: ' + sp.fullName + ' +' + sp.points + ' pts');
      } else {
        skipped++;
      }
    }
  }
  // Ledger entry cho race win rewards (owner1)
  const ledgerEntries = [
    { userId: U['owner1@horsetrack.local']._id, sourceType: 'race_win_reward', pointsDelta: 100, balanceAfter: 600, note: 'Thang Vong Loai 1 - Thunder Bolt' },
    { userId: U['owner2@horsetrack.local']._id, sourceType: 'race_win_reward', pointsDelta: 70,  balanceAfter: 390, note: 'Hang 2 Vong Loai 2 - Iron Duke' },
    { userId: U['referee1@horsetrack.local']._id, sourceType: 'referee_salary', pointsDelta: 200, balanceAfter: 200, note: 'Luong trong tai 6 cuoc dua' },
  ];
  for (const e of ledgerEntries) {
    const existing = await RewardPointLedger.findOne({ userId: e.userId, note: e.note });
    if (!existing) {
      await RewardPointLedger.create({ ...e, createdBy: U['admin@horsetrack.local']._id });
      created++;
      console.log('  CREATE Ledger: ' + e.note);
    } else {
      skipped++;
    }
  }

  // ──────────────────────────────────────────────────────────
  // 15. AI PREDICTION PACKAGES
  // ──────────────────────────────────────────────────────────
  console.log('[15/15] AI Prediction Packages...');
  const packages = [
    { name: 'Goi Co Ban',       description: 'Du doan AI co ban, 7 ngay su dung.',                  price: 29000,  durationDays: 7,  accuracyRate: 70, status: 'ACTIVE' },
    { name: 'Goi Tieu Chuan',   description: 'Du doan AI chinh xac hon, 30 ngay su dung.',          price: 99000,  durationDays: 30, accuracyRate: 80, status: 'ACTIVE' },
    { name: 'Goi Chuyen Nghiep',description: 'Du doan AI chuyen nghiep, phan tich chi tiet.',       price: 199000, durationDays: 30, accuracyRate: 88, status: 'ACTIVE' },
    { name: 'Goi VIP',          description: 'Du doan AI VIP, do chinh xac cao nhat, 90 ngay.',     price: 499000, durationDays: 90, accuracyRate: 93, status: 'ACTIVE' },
  ];
  for (const p of packages) {
    await upsertOne(AIPredictionPackage, { name: p.name }, p, 'AIPackage: ' + p.name);
  }

  // ──────────────────────────────────────────────────────────
  // DONE
  // ──────────────────────────────────────────────────────────
  console.log('\n===================================================');
  console.log('SEED HOAN TAT!');
  console.log('  Tao moi : ' + created + ' documents');
  console.log('  Bo qua  : ' + skipped + ' (da ton tai)');
  console.log('');
  console.log('Password tat ca accounts: password123');
  console.log('');
  console.log('Collections da seed:');
  console.log('  [1]  users                  (20 accounts)');
  console.log('  [2]  jockeys                (4 profiles)');
  console.log('  [3]  refereeprofiles        (3 profiles)');
  console.log('  [4]  horses                 (12 con ngua)');
  console.log('  [5]  tournaments            (3 giai dau)');
  console.log('  [6]  races                  (8 cuoc dua)');
  console.log('  [7]  refereeassignments     (12 assignments)');
  console.log('  [8]  registrations          (20 dang ky)');
  console.log('  [9]  jockeyinvitations      (20 loi moi)');
  console.log('  [10] racechecks             (tat ca race da xong)');
  console.log('  [11] raceresults            (tat ca race da xong)');
  console.log('  [12] prizes                 (rank 1-3 moi race)');
  console.log('  [13] predictions            (5 spectators x 2 races)');
  console.log('  [14] rewardpointledgers     (spectators + owners + referee)');
  console.log('  [15] aipredictionpackages   (4 goi AI)');
  console.log('');
  console.log('Danh sach accounts:');
  console.log('  admin         -> admin@horsetrack.local');
  console.log('  demo owner    -> owner@horsetrack.local');
  console.log('  demo jockey   -> jockey@horsetrack.local');
  console.log('  demo referee  -> referee@horsetrack.local');
  console.log('  demo spectator-> spectator@horsetrack.local');
  console.log('  demo counter  -> counter@horsetrack.local');
  console.log('  owner 1-3     -> owner1-3@horsetrack.local');
  console.log('  jockey 1-3    -> jockey1-3@horsetrack.local');
  console.log('  referee 1-2   -> referee1-2@horsetrack.local');
  console.log('  counter       -> counter@horsetrack.local');
  console.log('  spectator 1-5 -> spectator1-5@horsetrack.local');
  console.log('===================================================');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed that bai:', err.message);
  console.error(err.stack);
  process.exit(1);
});
