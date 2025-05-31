const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const HealthCard = require('./models/HealthCard');
const Loan = require('./models/Loan');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');
const fs = require('fs');

// Read seed data files
const users = JSON.parse(fs.readFileSync('./seed/demoUsers.json', 'utf8'));
const hospitals = JSON.parse(fs.readFileSync('./seed/demoHospitals.json', 'utf8'));
const healthCards = JSON.parse(fs.readFileSync('./seed/demoHealthCards.json', 'utf8'));
const loans = JSON.parse(fs.readFileSync('./seed/demoLoans.json', 'utf8'));
const transactions = JSON.parse(fs.readFileSync('./seed/demoTransactions.json', 'utf8'));
const notifications = JSON.parse(fs.readFileSync('./seed/demoNotifications.json', 'utf8'));

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await HealthCard.deleteMany({});
    await Loan.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`Inserted ${createdUsers.length} users`);
    
    // Map user emails to their IDs for reference
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.email] = user._id;
    });

    // Insert hospitals and assign users
    const hospitalData = hospitals.map((hospital, index) => {
      let userEmail;
      
      if (hospital.name === "City General Hospital") {
        userEmail = "rajesh@cityhospital.com";
      } else if (hospital.name === "Wellness Multispecialty Hospital") {
        userEmail = "priya@wellnesshospital.com";
      } else if (hospital.name === "LifeCare Medical Center") {
        userEmail = "anand@lifecaremedical.com";
      } else {
        userEmail = "hospital@demo.com";
      }
      
      return {
        ...hospital,
        user: userMap[userEmail] || userMap["hospital@demo.com"]
      };
    });
    
    const createdHospitals = await Hospital.insertMany(hospitalData);
    console.log(`Inserted ${createdHospitals.length} hospitals`);

    // Insert health cards
    const healthCardData = healthCards.map(card => {
      if (!card.user) {
        const patientUser = createdUsers.find(user => user.role === 'patient');
        card.user = patientUser ? patientUser._id : createdUsers[0]._id;
      }
      return card;
    });
    
    const createdHealthCards = await HealthCard.insertMany(healthCardData);
    console.log(`Inserted ${createdHealthCards.length} health cards`);

    // Insert loans with proper user references
    const loanData = loans.map(loan => {
      if (loan.userEmail && userMap[loan.userEmail]) {
        loan.user = userMap[loan.userEmail];
        delete loan.userEmail;
      }
      return loan;
    });
    
    const createdLoans = await Loan.insertMany(loanData);
    console.log(`Inserted ${createdLoans.length} loans`);

    // Insert transactions with proper user references
    const transactionData = transactions.map(transaction => {
      if (!userMap[transaction.userEmail]) {
        // If user email doesn't exist in map, use a default user
        const defaultUser = createdUsers.find(user => user.role === 'patient') || createdUsers[0];
        transaction.user = defaultUser._id;
      } else {
        transaction.user = userMap[transaction.userEmail];
      }
      delete transaction.userEmail;
      return transaction;
    });
    
    const createdTransactions = await Transaction.insertMany(transactionData);
    console.log(`Inserted ${createdTransactions.length} transactions`);

    // Insert notifications with proper user references
    const notificationData = notifications.map(notification => {
      // If user email doesn't exist in map or isn't provided, use a default user
      if (!notification.userEmail || !userMap[notification.userEmail]) {
        const defaultUser = createdUsers.find(user => user.role === 'patient') || createdUsers[0];
        notification.user = defaultUser._id;
      } else {
        notification.user = userMap[notification.userEmail];
      }
      
      // Clean up the userEmail field
      delete notification.userEmail;
      return notification;
    });
    
    const createdNotifications = await Notification.insertMany(notificationData);
    console.log(`Inserted ${createdNotifications.length} notifications`);

    console.log('Database seeding completed successfully');
    console.log('Sample patient credentials for testing:');
    console.log('Email: patient@demo.com, Password: password123');
    console.log('Email: testpatient@demo.com, Password: password123');
    
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

seedDatabase();
