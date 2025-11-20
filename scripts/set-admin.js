// scripts/set-admin.js
// Run this script to set admin claim for a user
// Usage: node scripts/set-admin.js USER_UID

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const admin = require('firebase-admin');

const serviceAccount = require(path.join(__dirname, '..', 'firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];

if (!uid) {
  console.error('Usage: node scripts/set-admin.js USER_UID');
  console.error('');
  console.error('To find your UID:');
  console.error('1. Go to Firebase Console > Authentication > Users');
  console.error('2. Copy the User UID for your account');
  process.exit(1);
}

async function setAdmin() {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✓ Admin claim set for user: ${uid}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Log out of the admin page');
    console.log('2. Log back in');
    console.log('3. You should now have admin access!');
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin claim:', err.message);
    process.exit(1);
  }
}

setAdmin();
