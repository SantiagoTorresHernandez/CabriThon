#!/usr/bin/env node

/**
 * Script to create a test user in Firebase
 * 
 * Usage: node create-test-user.js
 * 
 * This script will:
 * 1. Create a test user with email: test@gmail.com and password: 1234567890
 * 
 * Note: You must have the Firebase Admin SDK set up and initialized.
 * Make sure to update the path to your service account key.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Update this path to point to your Firebase service account key
const serviceAccountPath = path.join(__dirname, '../backend/CabriThon.Api/service-account-key.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Error: Could not find service account key at:', serviceAccountPath);
  console.error('Please ensure the Firebase service account key is in the correct location.');
  process.exit(1);
}

const auth = admin.auth();

// Test user credentials
const testUser = {
  email: 'test@gmail.com',
  password: '1234567890', // 10 characters minimum
  displayName: 'Test User',
};

async function createTestUser() {
  try {
    console.log('Creating test user...');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(testUser.email);
      console.log('\n✓ Test user already exists!');
      console.log(`UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        userRecord = await auth.createUser({
          email: testUser.email,
          password: testUser.password,
          displayName: testUser.displayName,
        });
        console.log('\n✓ Test user created successfully!');
        console.log(`UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    console.log('\nYou can now log in with:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
