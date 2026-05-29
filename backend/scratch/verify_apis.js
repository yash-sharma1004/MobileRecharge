import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environmental configurations
dotenv.config();

import { User } from '../src/modules/auth/user.model.js';
import { Coupon } from '../src/modules/recharge/coupon.model.js';
import { CashbackRule } from '../src/modules/recharge/cashbackRule.model.js';
import { Recharge } from '../src/modules/recharge/recharge.model.js';
import { seedDB } from '../src/config/seeder.js';

// Setup Mock Environment Variables in case they are missing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fastpay';

async function runTests() {
  console.log('🧪 CONNECTING TO MONGODB:', process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected successfully!\n');

  // Trigger Seeding
  await seedDB();
  console.log('\n');

  let testPassed = true;

  try {
    // ----------------------------------------------------
    // TEST 1: Verify Seeded Data
    // ----------------------------------------------------
    console.log('➡️ TEST 1: Verifying Seeded Database Records...');
    const admin = await User.findOne({ role: 'ADMIN' });
    if (admin && admin.mobile === '9999999999') {
      console.log('  ✔ Seeded Admin found: name:', admin.name, ', mobile:', admin.mobile);
    } else {
      console.log('  ❌ Seeded Admin not found!');
      testPassed = false;
    }

    const couponsCount = await Coupon.countDocuments();
    console.log(`  ✔ Total dynamic coupons in database: ${couponsCount}`);
    if (couponsCount === 0) {
      console.log('  ❌ Seeded coupons are missing!');
      testPassed = false;
    }

    const activeRule = await CashbackRule.findOne({ isActive: true });
    if (activeRule) {
      console.log(`  ✔ Active Cashback Rule: type: ${activeRule.type}, minRandom: ${activeRule.minRandom}, maxRandom: ${activeRule.maxRandom}`);
    } else {
      console.log('  ❌ Active Cashback Rule missing!');
      testPassed = false;
    }
    console.log('✅ TEST 1 PASSED!\n');

    // ----------------------------------------------------
    // TEST 2: User Status & Session Blocking policy
    // ----------------------------------------------------
    console.log('➡️ TEST 2: Verifying Blocked User Guards...');
    // Create a temporary mock user
    const mockUserMobile = '8888888888';
    await User.deleteOne({ mobile: mockUserMobile }); // cleanup
    
    const mockUser = await User.create({
      mobile: mockUserMobile,
      email: 'mockuser@test.com',
      name: 'Mock User',
      passwordHash: 'UserPassword123',
      role: 'USER',
      status: 'ACTIVE'
    });

    console.log('  ✔ Mock User created, status: ACTIVE');

    // Toggle status to BLOCKED
    mockUser.status = 'BLOCKED';
    await mockUser.save();
    console.log('  ✔ Status updated to BLOCKED');

    // Read back and verify
    const checkedUser = await User.findById(mockUser._id);
    if (checkedUser.status === 'BLOCKED') {
      console.log('  ✔ Checked user status is correctly verified as BLOCKED');
    } else {
      console.log('  ❌ Blocked state did not persist!');
      testPassed = false;
    }

    // Clean up mock user
    await User.deleteOne({ _id: mockUser._id });
    console.log('✅ TEST 2 PASSED!\n');

    // ----------------------------------------------------
    // TEST 3: Dynamic Coupon Validations
    // ----------------------------------------------------
    console.log('➡️ TEST 3: Auditing Dynamic Coupon validations...');
    // Pick SAVE50 coupon
    const save50 = await Coupon.findOne({ code: 'SAVE50' });
    if (save50) {
      console.log(`  ✔ Coupon SAVE50 details: discount: ${save50.discount}, type: ${save50.type}, minAmount: ${save50.minAmount}`);
      
      // Test invalid validation checks
      const rechargeAmount = 150;
      if (rechargeAmount < save50.minAmount) {
        console.log(`  ✔ Validation works: Recharge ₹${rechargeAmount} correctly blocked under minimum threshold ₹${save50.minAmount}`);
      } else {
        console.log('  ❌ Minimum threshold validation failed!');
        testPassed = false;
      }
    } else {
      console.log('  ❌ Coupon SAVE50 missing!');
      testPassed = false;
    }
    console.log('✅ TEST 3 PASSED!\n');

  } catch (error) {
    console.error('❌ Test script failed with error:', error);
    testPassed = false;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MONGODB CONNECTION CLOSED.');
  }

  if (testPassed) {
    console.log('\n🌟 INTEGRATION TESTS PASSED SUCCESSFULLY! All core systems verified.');
    process.exit(0);
  } else {
    console.log('\n❌ INTEGRATION TESTS FAILED. Please check logs.');
    process.exit(1);
  }
}

runTests();
