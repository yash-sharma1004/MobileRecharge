import { User } from '../modules/auth/user.model.js';
import { Coupon } from '../modules/recharge/coupon.model.js';
import { CashbackRule } from '../modules/recharge/cashbackRule.model.js';
import { Offer } from '../modules/recharge/offer.model.js';

export const seedDB = async () => {
  try {
    console.log('🌱 Starting database auto-seeding...');

    // 1. Seed Default Admin User
    let admin = await User.findOne({ mobile: '9999999999' });
    if (!admin) {
      // Create user using Mongoose schema so the pre('save') hook hashes the password
      await User.create({
        mobile: '9999999999',
        email: 'admin@recharge.com',
        name: 'Yash',
        passwordHash: 'AdminPassword123', // Will be hashed by pre-save hook
        role: 'ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        isNewUser: false
      });
      console.log('✅ Default Admin User seeded (Mobile: 9999999999 / Pass: AdminPassword123)');
    } else {
      if (admin.role !== 'ADMIN') {
        admin.role = 'ADMIN';
        admin.status = 'ACTIVE';
        await admin.save();
        console.log('✅ Existing user 9999999999 upgraded to ADMIN role');
      } else {
        console.log('⚡ Admin User already exists');
      }
    }

    // 2. Seed Default Coupons
    const couponsCount = await Coupon.countDocuments();
    if (couponsCount === 0) {
      const defaultCoupons = [
        { code: 'SAVE50', description: 'Flat ₹50 OFF', discount: 50, type: 'flat', minAmount: 200, expiry: new Date('2026-12-31'), isActive: true },
        { code: 'NEWUSER100', description: 'Flat ₹100 OFF on first recharge', discount: 100, type: 'flat', minAmount: 300, expiry: new Date('2026-12-31'), isActive: true },
        { code: 'BHAVYA2202', description: 'Flat ₹100 OFF', discount: 100, type: 'flat', minAmount: 0, expiry: new Date('2026-12-31'), isActive: true },
        { code: 'WEEKEND20', description: 'Flat ₹5 OFF', discount: 5, type: 'flat', minAmount: 150, expiry: new Date('2026-12-31'), isActive: true },
        { code: 'FLAT75', description: 'Flat ₹15.5 OFF', discount: 15.5, type: 'flat', minAmount: 500, expiry: new Date('2026-12-31'), isActive: true }
      ];
      await Coupon.insertMany(defaultCoupons);
      console.log('✅ Default Coupons seeded');
    } else {
      console.log('⚡ Coupons already seeded');
    }

    // 3. Seed Default Cashback Rule
    const cashbackRulesCount = await CashbackRule.countDocuments();
    if (cashbackRulesCount === 0) {
      await CashbackRule.create({
        type: 'random',
        minAmount: 0,
        minRandom: 1,
        maxRandom: 25,
        isActive: true
      });
      console.log('✅ Default Cashback Rule (Random 1-25) seeded');
    } else {
      console.log('⚡ Cashback rules already seeded');
    }

    // 4. Seed Default Offers
    const offersCount = await Offer.countDocuments();
    if (offersCount === 0) {
      const defaultOffers = [
        { title: 'Mobile offer', description: 'Get flat ₹30 cashback on unlimited plans of ₹299+', category: 'mobile', bannerUrl: './src/assets/mobile.png', isActive: true, code: 'MOB30' },
        { title: 'Jio Special', description: 'Get ₹50 cashback on Jio ₹749 plans', category: 'mobile', bannerUrl: './src/assets/mobile.png', isActive: true, code: 'JIO50' },
        { title: 'Metro Recharge', description: 'Get 20% off on your metro card recharge', category: 'card', bannerUrl: './src/assets/card.jpg', isActive: true, code: 'METRO20' },
        { title: 'Broadband Offer', description: 'Get Netflix free on yearly broadband plans', category: 'broadband', bannerUrl: './src/assets/broadband.jpg', isActive: true, code: 'STREAMFREE' },
        { title: 'Broadband Cashback', description: 'Flat ₹50 cashback on monthly renewals', category: 'broadband', bannerUrl: './src/assets/broadband.jpg', isActive: true, code: 'FIBER50' },
        { title: 'Landline Offer', description: 'Get 10% cashback on landline bill', category: 'landline', bannerUrl: './src/assets/landline.jpg', isActive: true, code: 'LANDLINE10' },
        { title: 'Cable TV Premium', description: 'Get 7 days extra on yearly subscription', category: 'cable tv', bannerUrl: './src/assets/cabletv.png', isActive: true, code: 'DTHFREE' },
        { title: 'Electricity Offer', description: 'Pay electricity bill & get ₹50 cashback', category: 'electricity', bannerUrl: './src/assets/electricity.jpg', isActive: true, code: 'POWER50' },
        { title: 'Gas Booking', description: 'Flat ₹30 cashback on booking cylinder', category: 'gas', bannerUrl: './src/assets/gas.jpg', isActive: true, code: 'GAS30' },
        { title: 'Water Cashback', description: 'Flat ₹15 cashback on water bill', category: 'water', bannerUrl: './src/assets/water.jpg', isActive: true, code: 'WATER15' }
      ];
      await Offer.insertMany(defaultOffers);
      console.log('✅ Default Category Offers/Banners seeded');
    } else {
      console.log('⚡ Offers already seeded');
    }

    console.log('🌱 Seeding process complete!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error.message);
  }
};
