import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { Auction } from '../models/Auction.js';
import { Bid } from '../models/Bid.js';
import { Transaction } from '../models/Transaction.js';

const seedData = async () => {
  await connectDB();
  console.log('[Seed] Connected to database. Purging old data...');

  await Promise.all([
    User.deleteMany({}),
    Wallet.deleteMany({}),
    Auction.deleteMany({}),
    Bid.deleteMany({}),
    Transaction.deleteMany({})
  ]);

  console.log('[Seed] Creating demo users...');

  const users = await User.create([
    {
      name: 'Elena Rostova (Admin)',
      email: 'admin@auctionhub.com',
      password: 'password123',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Marcus Sterling (Seller)',
      email: 'seller@auctionhub.com',
      password: 'password123',
      role: 'SELLER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Alex Rivera (Bidder)',
      email: 'bidder1@auctionhub.com',
      password: 'password123',
      role: 'BIDDER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Sophia Chen (Bidder)',
      email: 'bidder2@auctionhub.com',
      password: 'password123',
      role: 'BIDDER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'David Kim (Bidder)',
      email: 'bidder3@auctionhub.com',
      password: 'password123',
      role: 'BIDDER',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80'
    }
  ]);

  const [admin, seller, bidder1, bidder2, bidder3] = users;

  console.log('[Seed] Creating wallets for users...');
  const wallets = await Wallet.create([
    { userId: admin._id, availableBalance: 15000, heldBalance: 0 },
    { userId: seller._id, availableBalance: 2500, heldBalance: 0 },
    { userId: bidder1._id, availableBalance: 12500, heldBalance: 0 },
    { userId: bidder2._id, availableBalance: 9800, heldBalance: 0 },
    { userId: bidder3._id, availableBalance: 7500, heldBalance: 0 },
  ]);

  console.log('[Seed] Creating sample auctions...');

  const now = new Date();
  const thirtyMinsLater = new Date(now.getTime() + 30 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const sampleAuctions = [
    {
      title: '1967 Shelby GT500 "Eleanor" Tribute Spec',
      description: 'Meticulously crafted restoration featuring a 428 Cobra Jet V8, Tremec 5-speed manual, side exhaust, and iconic Pepper Gray finish with black Le Mans racing stripes.',
      category: 'Vehicles',
      images: [
        'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=1200&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=85'
      ],
      sellerId: seller._id,
      startingPrice: 3500,
      currentHighestBid: 4200,
      highestBidderId: bidder2._id,
      minIncrement: 100,
      reservePrice: 5000,
      startTime: yesterday,
      endTime: twoHoursLater, // LIVE with 2 hours remaining
      status: 'LIVE',
      totalBids: 4,
      version: 4
    },
    {
      title: 'Patek Philippe Nautilus 5711/1R Rose Gold',
      description: 'Iconic luxury timepiece featuring an 18k rose gold case, graduated brown dial, and automatic Caliber 324 S C movement. Complete box, papers, and provenance certificate.',
      category: 'Watches',
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      ],
      sellerId: seller._id,
      startingPrice: 1200,
      currentHighestBid: 1450,
      highestBidderId: bidder1._id,
      minIncrement: 50,
      reservePrice: 2000,
      startTime: yesterday,
      endTime: thirtyMinsLater, // LIVE with 30 mins remaining
      status: 'LIVE',
      totalBids: 3,
      version: 3
    },
    {
      title: 'Original Banksy Signed Screenprint - Balloon Girl (2004)',
      description: 'Numbered edition 88/150 with Pest Control COA included. Pristine condition, preserved in archival museum glass with custom acid-free matting.',
      category: 'Art & Collectibles',
      images: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&auto=format&fit=crop&q=80'
      ],
      sellerId: seller._id,
      startingPrice: 2000,
      currentHighestBid: 0,
      highestBidderId: null,
      minIncrement: 50,
      reservePrice: 2500,
      startTime: yesterday,
      endTime: tomorrow,
      status: 'LIVE',
      totalBids: 0,
      version: 0
    },
    {
      title: '5.20 Carat Emerald-Cut Ceylon Sapphire Ring',
      description: 'Unheated natural royal blue sapphire accompanied by GIA certification, flanked by trapezoid diamond side stones set in platinum 950.',
      category: 'Jewelry',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'
      ],
      sellerId: seller._id,
      startingPrice: 1800,
      currentHighestBid: 0,
      highestBidderId: null,
      minIncrement: 50,
      reservePrice: 2200,
      startTime: new Date(now.getTime() + 10 * 60 * 1000), // starts in 10 mins
      endTime: tomorrow,
      status: 'SCHEDULED',
      totalBids: 0,
      version: 0
    },
    {
      title: 'Leica M11 Rangefinder Silver Chrome Camera Kit',
      description: 'Brand new in sealed box with Noctilux-M 50mm f/0.95 ASPH lens and artisanal handcrafted Italian leather half-case.',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
      ],
      sellerId: seller._id,
      startingPrice: 900,
      currentHighestBid: 0,
      highestBidderId: null,
      minIncrement: 25,
      reservePrice: 1200,
      startTime: tomorrow,
      endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      status: 'DRAFT', // ready for admin approval
      totalBids: 0,
      version: 0
    },
    {
      title: 'First Edition Signed Harry Potter & The Philosopher\'s Stone',
      description: 'Bloomsbury 1997 hardback first edition, first impression with complete line of numbers 10 9 8 7 6 5 4 3 2 1 and authenticated J.K. Rowling signature.',
      category: 'Art & Collectibles',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
      ],
      sellerId: seller._id,
      startingPrice: 800,
      currentHighestBid: 1600,
      highestBidderId: bidder3._id,
      minIncrement: 50,
      reservePrice: 1200,
      startTime: yesterday,
      endTime: oneHourAgo,
      status: 'SETTLED',
      winnerId: bidder3._id,
      winningBid: 1600,
      totalBids: 6,
      version: 6
    }
  ];

  const createdAuctions = await Auction.create(sampleAuctions);

  // Set wallet holds for bidder1 on Patek ($1450) and bidder2 on GT500 ($4200)
  await Wallet.updateOne(
    { userId: bidder1._id },
    { $inc: { availableBalance: -1450, heldBalance: 1450 } }
  );
  await Wallet.updateOne(
    { userId: bidder2._id },
    { $inc: { availableBalance: -4200, heldBalance: 4200 } }
  );

  // Create initial bid records
  await Bid.create([
    {
      auctionId: createdAuctions[0]._id,
      bidderId: bidder2._id,
      amount: 1300,
      status: 'OUTBID',
      createdAt: new Date(now.getTime() - 20 * 60 * 1000)
    },
    {
      auctionId: createdAuctions[0]._id,
      bidderId: bidder3._id,
      amount: 1350,
      status: 'OUTBID',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000)
    },
    {
      auctionId: createdAuctions[0]._id,
      bidderId: bidder1._id,
      amount: 1450,
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000)
    },
    {
      auctionId: createdAuctions[1]._id,
      bidderId: bidder1._id,
      amount: 3800,
      status: 'OUTBID',
      createdAt: new Date(now.getTime() - 45 * 60 * 1000)
    },
    {
      auctionId: createdAuctions[1]._id,
      bidderId: bidder2._id,
      amount: 4200,
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000)
    }
  ]);

  console.log('[Seed] Database seeded successfully!');
  console.log('Demo Credentials:');
  console.log(' - Admin:   admin@auctionhub.com   / password123');
  console.log(' - Seller:  seller@auctionhub.com  / password123');
  console.log(' - Bidder1: bidder1@auctionhub.com / password123 (Balance: $11,050 avail / $1,450 held)');
  console.log(' - Bidder2: bidder2@auctionhub.com / password123 (Balance: $5,600 avail / $4,200 held)');
  console.log(' - Bidder3: bidder3@auctionhub.com / password123 (Balance: $7,500 avail)');

  process.exit(0);
};

seedData().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
