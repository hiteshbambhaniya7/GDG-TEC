import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { Department, STANDARD_DEPARTMENTS } from '../models/Department.js';
import { Category, STANDARD_CATEGORIES } from '../models/Category.js';
import { Timeline } from '../models/Timeline.js';
import { Counter } from '../models/Counter.js';
import { setCounterSequence } from '../services/issueNumberService.js';
import { config } from '../config/env.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongoUri);
    }

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Issue.deleteMany({});
    await Department.deleteMany({});
    await Category.deleteMany({});
    await Timeline.deleteMany({});
    await Counter.deleteMany({});

    console.log('[Seed] Seeding municipal departments...');
    const departments = await Department.insertMany(STANDARD_DEPARTMENTS);
    console.log(`[Seed] Seeded ${departments.length} departments.`);

    console.log('[Seed] Seeding civic categories...');
    const categories = await Category.insertMany(STANDARD_CATEGORIES);
    console.log(`[Seed] Seeded ${categories.length} categories.`);

    console.log('[Seed] Creating demo users...');
    // 1. Mandatory Phase 1 Demo Accounts
    const demoCitizen = await User.create({
      name: 'Demo Citizen (Bhavnagar)',
      email: 'citizen@smartbhavnagar.demo',
      phone: '9898000010',
      password: 'Demo@123',
      role: 'citizen',
      department: 'General Administration',
      ward: 'Ward 1 - Kaliyabid'
    });

    const demoAdmin = await User.create({
      name: 'Municipal Commissioner (Admin)',
      email: 'admin@smartbhavnagar.demo',
      phone: '9898000020',
      password: 'Demo@123',
      role: 'admin',
      department: 'General Administration',
      ward: 'Ward 7 - Kalanala & Crescent Circle'
    });

    // 2. Legacy UI Persona Switcher Demo Accounts (for backwards compatibility)
    const personaCitizen = await User.create({
      name: 'Hardik Patel',
      email: 'hardik.patel@bhavnagar.demo',
      phone: '9898000001',
      password: 'password123',
      role: 'citizen',
      department: 'General Administration',
      ward: 'Ward 2 - Waghawadi Road & Takhteshwar'
    });

    const officerRoads = await User.create({
      name: 'Rajesh Vaghela',
      email: 'rajesh.pwd@bhavnagar.demo',
      phone: '9898000002',
      password: 'password123',
      role: 'officer',
      department: 'Roads & Infrastructure',
      ward: 'Ward 1 - Kaliyabid'
    });

    const officerSanitation = await User.create({
      name: 'Meena Trivedi',
      email: 'meena.swm@bhavnagar.demo',
      phone: '9898000003',
      password: 'password123',
      role: 'officer',
      department: 'Sanitation',
      ward: 'Ward 3 - Nilambag & Ghogha Circle'
    });

    const personaAdmin = await User.create({
      name: 'Dr. Sanjay Bhatt (Commissioner)',
      email: 'commissioner@bhavnagar.demo',
      phone: '9898000004',
      password: 'password123',
      role: 'admin',
      department: 'General Administration',
      ward: 'Ward 7 - Kalanala & Crescent Circle'
    });

    console.log('[Seed] Demo users initialized successfully.');

    // Realistic Bhavnagar Issues Definition (30 items)
    console.log('[Seed] Generating 30 realistic Bhavnagar civic issues...');

    const rawIssues = [
      // 1. Nearby Road Cluster - Waghawadi Road (Item 1)
      {
        issueNumber: 'BH-2026-00001',
        title: 'Deep Hazardous Pothole near Takhteshwar Temple Curve',
        description: 'Dangerous 8-inch asphalt crater on the uphill curve towards Takhteshwar Temple. Two-wheelers frequently lose balance and skid during peak evening hours.',
        category: 'Road & Pothole',
        severity: 'Critical',
        department: 'Roads & Infrastructure',
        status: 'In Progress',
        latitude: 21.7580,
        longitude: 72.1465,
        address: 'Takhteshwar Approach Road, near Hill Crest Gardens',
        area: 'Takhteshwar',
        ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Critical asphalt collapse on busy gradient road presenting acute accident hazard for two-wheelers.',
        aiConfidence: 0.94,
        reportedBy: demoCitizen._id,
        citizenName: 'Hardik Patel',
        assignedOfficer: officerRoads
      },

      // 2. Nearby Road Cluster - Waghawadi Road (Item 2 - DUPLICATE PAIR A)
      {
        issueNumber: 'BH-2026-00002',
        title: 'Severe Road Cave-in with Exposed Rebar near Victoria Park Gate 2',
        description: 'Large asphalt depression and cracked road slab opposite Victoria Park Gate 2 on Waghawadi Road. Vehicle rims getting bent and auto-rickshaws swerving dangerously.',
        category: 'Road & Pothole',
        severity: 'Critical',
        department: 'Roads & Infrastructure',
        status: 'Pending',
        latitude: 21.7565,
        longitude: 72.1450,
        address: 'Waghawadi Road, opposite Victoria Park Gate 2',
        area: 'Victoria Park',
        ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'High-severity road structural crater on primary arterial corridor requiring urgent patch surfacing.',
        aiConfidence: 0.93,
        reportedBy: demoCitizen._id,
        citizenName: 'Kishore Gohil'
      },

      // 3. Nearby Road Cluster - Waghawadi Road (Item 3 - DUPLICATE PAIR B, matching Item 2)
      {
        issueNumber: 'BH-2026-00003',
        title: 'Huge Dangerous Pothole right in front of Victoria Park 2nd Entrance',
        description: 'Deep road damage and gravel scattering on main Waghawadi Road opposite Victoria Park entrance #2. Very unsafe for night driving.',
        category: 'Road & Pothole',
        severity: 'Critical',
        department: 'Roads & Infrastructure',
        status: 'Pending',
        latitude: 21.7566,
        longitude: 72.1451,
        address: 'Opposite Victoria Park Entrance Gate 2, Waghawadi Road',
        area: 'Victoria Park',
        ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Potential duplicate report for Victoria Park arterial road depression.',
        aiConfidence: 0.91,
        reportedBy: personaCitizen._id,
        citizenName: 'Ramesh Shah'
      },

      // 4. Nearby Road Cluster - Waghawadi Road (Item 4)
      {
        issueNumber: 'BH-2026-00004',
        title: 'Asphalt Raveling and Edge Drop-off near Madhav Darshan Complex',
        description: 'Road margin has eroded completely along the shopping complex stretch, leaving a 4-inch drop between bitumen and pedestrian pavers.',
        category: 'Road & Pothole',
        severity: 'Medium',
        department: 'Roads & Infrastructure',
        status: 'In Progress',
        latitude: 21.7595,
        longitude: 72.1480,
        address: 'Waghawadi Road, near Madhav Darshan Complex',
        area: 'Waghawadi Road',
        ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Pavement edge erosion along commercial frontage.',
        aiConfidence: 0.88,
        reportedBy: demoCitizen._id,
        citizenName: 'Bhavna Ben'
      },

      // 5. Nearby Road Cluster - Kaliyabid (Item 5)
      {
        issueNumber: 'BH-2026-00005',
        title: 'Substantial Pothole Cluster after Kaliyabid Water Tank Circle',
        description: 'Series of 4 consecutive potholes near the main Kaliyabid water distribution tank. Commuters swerve across lanes into oncoming traffic.',
        category: 'Road & Pothole',
        severity: 'High',
        department: 'Roads & Infrastructure',
        status: 'Pending',
        latitude: 21.7485,
        longitude: 72.1380,
        address: 'Water Tank Circle Road, Kaliyabid',
        area: 'Kaliyabid',
        ward: 'Ward 1 - Kaliyabid',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Multiple road surface defects at junction intersection with collision risk.',
        aiConfidence: 0.92,
        reportedBy: demoCitizen._id,
        citizenName: 'Nilesh Vala'
      },

      // 6. Nearby Road Cluster - Kaliyabid (Item 6)
      {
        issueNumber: 'BH-2026-00006',
        title: 'Broken Paver Blocks and Sunken Trench near Swaminarayan Mandir',
        description: 'Underground utility trench not leveled properly after pipe installation. Paver blocks loose and jutting upwards.',
        category: 'Road & Pothole',
        severity: 'Medium',
        department: 'Roads & Infrastructure',
        status: 'Pending',
        latitude: 21.7495,
        longitude: 72.1395,
        address: 'BAPS Swaminarayan Mandir Approach Lane, Kaliyabid',
        area: 'Kaliyabid',
        ward: 'Ward 1 - Kaliyabid',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Unreinstated utility cut with loose paver surface.',
        aiConfidence: 0.87,
        reportedBy: demoCitizen._id,
        citizenName: 'Girishbhai Parmar'
      },

      // 7. Sanitation - Overflowing Community Dump (Item 7)
      {
        issueNumber: 'BH-2026-00007',
        title: 'Overflowing Municipal Dumper Bins near Ghogha Circle Sabzi Mandi',
        description: 'Three large green bins overflowing onto street for past 48 hours. Vegetable decay and stray cattle scattering plastic waste into traffic.',
        category: 'Garbage & Sanitation',
        severity: 'Critical',
        department: 'Sanitation',
        status: 'In Progress',
        latitude: 21.7640,
        longitude: 72.1610,
        address: 'Ghogha Circle, near Vegetable Wholesale Market',
        area: 'Ghogha Circle',
        ward: 'Ward 3 - Nilambag & Ghogha Circle',
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Severe bio-waste overflow in dense commercial market posing sanitation and health hazards.',
        aiConfidence: 0.95,
        reportedBy: demoCitizen._id,
        citizenName: 'Jitendra Rathod',
        assignedOfficer: officerSanitation
      },

      // 8. Sanitation - Resolved with Ground-Truth Verification (Item 8 - RESOLVED 1)
      {
        issueNumber: 'BH-2026-00008',
        title: 'Construction Debris Dumped on Footpath along Nilambag Perimeter',
        description: 'Discarded bricks, cement sacks, and plaster rubble dumped on public walkway outside Nilambag Palace heritage perimeter wall.',
        category: 'Garbage & Sanitation',
        severity: 'Medium',
        department: 'Sanitation',
        status: 'Resolved',
        latitude: 21.7615,
        longitude: 72.1440,
        address: 'Nilambag Palace South Wall Road',
        area: 'Nilambag',
        ward: 'Ward 3 - Nilambag & Ghogha Circle',
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=60',
        resolutionNote: 'BMC Sanitation Squad deployed hydraulic loader and tipper truck. 4.2 metric tons of debris cleared and walkway power-swept.',
        resolvedAt: new Date(Date.now() - 36 * 3600000),
        aiSummary: 'Unauthorized solid construction rubble obstruction on pedestrian footpath.',
        aiConfidence: 0.91,
        reportedBy: personaCitizen._id,
        citizenName: 'Sunil Mehta',
        assignedOfficer: officerSanitation
      },

      // 9. Streetlight - Dark Corridor (Item 9)
      {
        issueNumber: 'BH-2026-00009',
        title: 'Eight Consecutive Streetlights Dark on Hill Drive Overpass',
        description: 'Complete blackout on Hill Drive elevated overpass for 5 consecutive nights. High risk of mugging and vehicular accidents on sharp blind curve.',
        category: 'Streetlight',
        severity: 'High',
        department: 'Electrical',
        status: 'In Progress',
        latitude: 21.7450,
        longitude: 72.1350,
        address: 'Hill Drive Elevated Road, Ward 1',
        area: 'Hill Drive',
        ward: 'Ward 1 - Kaliyabid',
        imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Multi-pole electrical feeder circuit failure causing hazardous public corridor blackout.',
        aiConfidence: 0.96,
        reportedBy: demoCitizen._id,
        citizenName: 'Anil Makwana'
      },

      // 10. Streetlight - Resolved (Item 10 - RESOLVED 2)
      {
        issueNumber: 'BH-2026-00010',
        title: 'Sparking Electrical Junction Box on Pole near Crescent Circle',
        description: 'Heavy sparks emitting from loose capacitor box on streetlight pole #CR-14 during intermittent drizzle.',
        category: 'Streetlight',
        severity: 'Critical',
        department: 'Electrical',
        status: 'Resolved',
        latitude: 21.7710,
        longitude: 72.1480,
        address: 'Crescent Circle, opposite Post Office',
        area: 'Crescent Circle',
        ward: 'Ward 7 - Kalanala & Crescent Circle',
        imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c63f732?w=800&auto=format&fit=crop&q=60',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=60',
        resolutionNote: 'Electrical emergency squad isolated feeder line, replaced damaged 32A MCB, and re-insulated cabling with weatherproof junction casing.',
        resolvedAt: new Date(Date.now() - 48 * 3600000),
        aiSummary: 'Immediate electrical short-circuit hazard with risk of public electrocution.',
        aiConfidence: 0.98,
        reportedBy: demoCitizen._id,
        citizenName: 'Dr. Pravin Dave'
      },

      // 11. Water Leakage - Major Burst (Item 11)
      {
        issueNumber: 'BH-2026-00011',
        title: 'Main Drinking Water Pipeline Rupture Flooding Sir T Hospital Road',
        description: 'High-pressure 12-inch distribution pipeline cracked open. Potable water gushing 3 feet high and flooding the emergency ambulance lane.',
        category: 'Water Leakage',
        severity: 'Critical',
        department: 'Water Supply',
        status: 'In Progress',
        latitude: 21.7745,
        longitude: 72.1390,
        address: 'Hospital Road, outside Sir Takhtasinhji General Hospital',
        area: 'Hospital Road',
        ward: 'Ward 7 - Kalanala & Crescent Circle',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Catastrophic municipal clean water main burst obstructing critical hospital emergency access corridor.',
        aiConfidence: 0.97,
        reportedBy: demoCitizen._id,
        citizenName: 'Jayanti Patel'
      },

      // 12. Water Leakage - Resolved (Item 12 - RESOLVED 3)
      {
        issueNumber: 'BH-2026-00012',
        title: 'Leaking Sluice Valve Flooding Residential Alley in Sardarnagar',
        description: 'Water distribution sluice valve leaking clean water 24 hours a day, causing waterlogging in society entry gate #3.',
        category: 'Water Leakage',
        severity: 'Medium',
        department: 'Water Supply',
        status: 'Resolved',
        latitude: 21.7450,
        longitude: 72.1650,
        address: 'Street No. 4, Sardarnagar Main Road',
        area: 'Sardarnagar',
        ward: 'Ward 5 - Sardarnagar & Bharatnagar',
        imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=60',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
        resolutionNote: 'Water Works technicians excavated valve pit, replaced defective brass gland packing and rubber gasket seal. Flow pressure restored to normal.',
        resolvedAt: new Date(Date.now() - 24 * 3600000),
        aiSummary: 'Continuous freshwater wastage due to deteriorated valve packing gland.',
        aiConfidence: 0.9,
        reportedBy: personaCitizen._id,
        citizenName: 'Mansukhbhai Chauhan'
      },

      // 13. Drainage - Open Manhole (Item 13)
      {
        issueNumber: 'BH-2026-00013',
        title: 'Missing Manhole Cover in front of Municipal School No. 14 in Chitra',
        description: 'Concrete sewer chamber cover cracked and fell inside. Open pit over 7 feet deep directly on the school walking route.',
        category: 'Drainage',
        severity: 'Critical',
        department: 'Drainage',
        status: 'In Progress',
        latitude: 21.7850,
        longitude: 72.1280,
        address: 'Industrial Road, opposite Municipal School No. 14, Chitra GIDC',
        area: 'Chitra GIDC',
        ward: 'Ward 4 - Chitra GIDC & Subhashnagar',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Fatal fall hazard in school pedestrian zone. Extreme urgency safety hazard.',
        aiConfidence: 0.99,
        reportedBy: demoCitizen._id,
        citizenName: 'Bhupat Solanki'
      },

      // 14. Drainage - Resolved (Item 14 - RESOLVED 4)
      {
        issueNumber: 'BH-2026-00014',
        title: 'Choked Stormwater Drain Causing Foul Waterlogging in Anandnagar',
        description: 'Monsoon drainage channel clogged with single-use plastic bags and silt, overflowing onto road near Anandnagar water sump.',
        category: 'Drainage',
        severity: 'High',
        department: 'Drainage',
        status: 'Resolved',
        latitude: 21.7890,
        longitude: 72.1520,
        address: 'Crossroads near Water Sump, Anandnagar',
        area: 'Anandnagar',
        ward: 'Ward 8 - Anandnagar & Kumbharwada',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=60',
        resolutionNote: 'Super-sucker suction vehicle deployed by Drainage Department. 30-meter underground culvert de-silted and cleared.',
        resolvedAt: new Date(Date.now() - 12 * 3600000),
        aiSummary: 'Underground sewer obstruction creating standing stagnant wastewater.',
        aiConfidence: 0.93,
        reportedBy: demoCitizen._id,
        citizenName: 'Kanti Koli'
      },

      // 15. Traffic Signal - Defective Blinker (Item 15)
      {
        issueNumber: 'BH-2026-00015',
        title: 'Traffic Signal Controller Stuck on Red in All Directions at Rupani Circle',
        description: 'Smart traffic controller froze with red lights facing all 4 approach avenues, causing extreme gridlock extending 1 km.',
        category: 'Traffic Signal',
        severity: 'Critical',
        department: 'Traffic',
        status: 'In Progress',
        latitude: 21.7650,
        longitude: 72.1410,
        address: 'Rupani Circle 4-way Intersection',
        area: 'Rupani Circle',
        ward: 'Ward 6 - Rupani & Vidhyanagar',
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Signal controller logic fault resulting in severe multi-arm arterial gridlock.',
        aiConfidence: 0.94,
        reportedBy: demoCitizen._id,
        citizenName: 'Sanjay Vora'
      },

      // 16. Traffic Signal - Damaged Blinker (Item 16)
      {
        issueNumber: 'BH-2026-00016',
        title: 'Amber Flashing Warning Light Knocked Down by Truck at Vidhyanagar Gate',
        description: 'Solar amber blinker pole knocked down on pedestrian crossing near Bhavnagar University main gate.',
        category: 'Traffic Signal',
        severity: 'Medium',
        department: 'Traffic',
        status: 'Pending',
        latitude: 21.7680,
        longitude: 72.1380,
        address: 'Vidhyanagar, near Bhavnagar University Gate',
        area: 'Vidhyanagar',
        ward: 'Ward 6 - Rupani & Vidhyanagar',
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Damaged pedestrian warning fixture outside educational campus.',
        aiConfidence: 0.89,
        reportedBy: demoCitizen._id,
        citizenName: 'Prof. Hemant Shukla'
      },

      // 17. Public Property - Damaged Bus Shelter (Item 17)
      {
        issueNumber: 'BH-2026-00017',
        title: 'Shattered Glass Roof on Municipal Bus Stop Shelter at Kalanala',
        description: 'Toughened glass canopy panel broken with shards hanging precariously over passenger seating bench outside BMC HQ.',
        category: 'Public Property',
        severity: 'High',
        department: 'Public Property',
        status: 'Pending',
        latitude: 21.7710,
        longitude: 72.1480,
        address: 'Opposite Municipal Corporation Head Office, Kalanala',
        area: 'Kalanala',
        ward: 'Ward 7 - Kalanala & Crescent Circle',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Overhead structural hazard on public transit infrastructure with risk of injury to commuters.',
        aiConfidence: 0.93,
        reportedBy: demoCitizen._id,
        citizenName: 'Mehul Trivedi'
      },

      // 18. Public Property - Encroachment / Divider Railing (Item 18)
      {
        issueNumber: 'BH-2026-00018',
        title: 'Broken Center Divider Railings Knocked into Fast Lane on Sidsar Road',
        description: 'Iron median railing smashed over 15 meters by vehicle crash, with sharp steel bars protruding into high-speed lane.',
        category: 'Public Property',
        severity: 'High',
        department: 'Public Property',
        status: 'In Progress',
        latitude: 21.7320,
        longitude: 72.1750,
        address: 'Sidsar Connecting Bypass Road, near Akwada Lake turn',
        area: 'Sidsar',
        ward: 'Ward 9 - Sidsar & Akwada Lake Area',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Damaged highway barrier posing impalement and collision threat to oncoming traffic.',
        aiConfidence: 0.95,
        reportedBy: demoCitizen._id,
        citizenName: 'Devendra Jadav'
      },

      // 19. Tree & Environment - Fallen Banyan Branch (Item 19)
      {
        issueNumber: 'BH-2026-00019',
        title: 'Large Heavy Banyan Branch Blocking Entire Road near Motibagh Town Hall',
        description: 'Storm wind snapped ancient tree branch measuring 20 feet long. Road completely blocked between Town Hall and Court complex.',
        category: 'Tree & Environment',
        severity: 'Critical',
        department: 'Garden & Environment',
        status: 'In Progress',
        latitude: 21.7725,
        longitude: 72.1460,
        address: 'Town Hall Court Road, Motibagh Area',
        area: 'Motibagh',
        ward: 'Ward 7 - Kalanala & Crescent Circle',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Complete roadway obstruction by fallen heritage arboriculture limb requiring mechanical chainsaw clearance.',
        aiConfidence: 0.96,
        reportedBy: demoCitizen._id,
        citizenName: 'Haresh Dodiya'
      },

      // 20. Tree & Environment - Resolved (Item 20 - RESOLVED 5)
      {
        issueNumber: 'BH-2026-00020',
        title: 'Dangerous Overhanging Branches Touching Overhead Power Cables in Victoria Park Buffer',
        description: 'Neem branches growing into 11kV distribution line, causing sparks and localized power flickers.',
        category: 'Tree & Environment',
        severity: 'High',
        department: 'Garden & Environment',
        status: 'Resolved',
        latitude: 21.7540,
        longitude: 72.1420,
        address: 'Victoria Park Buffer Road, near Forest Rest House',
        area: 'Victoria Park',
        ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=60',
        resolutionNote: 'Joint operation by BMC Horticulture Wing and PGVCL. Branches safely pruned with hydraulic boom lift.',
        resolvedAt: new Date(Date.now() - 18 * 3600000),
        aiSummary: 'Vegetation interference with high-voltage electrical infrastructure.',
        aiConfidence: 0.94,
        reportedBy: personaCitizen._id,
        citizenName: 'Dharmesh Baraiya'
      },

      // 21. Other - Stray Cattle Encroachment (Item 21)
      {
        issueNumber: 'BH-2026-00021',
        title: 'Herd of 15 Stray Cattle Blocking Subhashnagar Vegetable Market Road',
        description: 'Unattended cattle herd blocking vegetable delivery tempo access and charging at pedestrians in crowded market lane.',
        category: 'Other',
        severity: 'Medium',
        department: 'Sanitation',
        status: 'Pending',
        latitude: 21.7820,
        longitude: 72.1320,
        address: 'Subhashnagar Main Bazaar, Ward 4',
        area: 'Subhashnagar',
        ward: 'Ward 4 - Chitra GIDC & Subhashnagar',
        imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Livestock obstruction creating commercial lane stoppage and pedestrian friction.',
        aiConfidence: 0.88,
        reportedBy: demoCitizen._id,
        citizenName: 'Babubhai Vagh'
      },

      // 22. Other - Reopened Grievance (Item 22 - REOPENED 1)
      {
        issueNumber: 'BH-2026-00022',
        title: 'Illegal Commercial Hoarding Blocking Traffic View at Crescent Crossway',
        description: 'Huge 40-foot metallic advertising banner erected without municipal NOC, completely blinding drivers turning onto Station Road.',
        category: 'Public Property',
        severity: 'High',
        department: 'Public Property',
        status: 'Reopened',
        latitude: 21.7715,
        longitude: 72.1490,
        address: 'Station Road Junction, Crescent Circle',
        area: 'Crescent Circle',
        ward: 'Ward 7 - Kalanala & Crescent Circle',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Unapproved large-format billboard causing line-of-sight visual impediment at intersection.',
        aiConfidence: 0.92,
        reportedBy: demoCitizen._id,
        citizenName: 'Karan Joshi'
      },

      // 23. Road & Pothole - Reopened (Item 23 - REOPENED 2)
      {
        issueNumber: 'BH-2026-00023',
        title: 'Pothole Patch Washed Away in First Rain on Bharatnagar Road',
        description: 'Temporary gravel patch applied last week washed out overnight leaving deeper trenches than before.',
        category: 'Road & Pothole',
        severity: 'High',
        department: 'Roads & Infrastructure',
        status: 'Reopened',
        latitude: 21.7420,
        longitude: 72.1620,
        address: 'Bharatnagar Colony Main Road, near Water Tower',
        area: 'Bharatnagar',
        ward: 'Ward 5 - Sardarnagar & Bharatnagar',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Recurrent pavement failure following substandard temporary cold-mix repair.',
        aiConfidence: 0.9,
        reportedBy: demoCitizen._id,
        citizenName: 'Manish Sheth'
      },

      // 24. Drainage - Reopened (Item 24 - REOPENED 3)
      {
        issueNumber: 'BH-2026-00024',
        title: 'Sewer Line Choking Again after Incomplete Desilting in Kumbharwada',
        description: 'Sewer line was declared resolved on Monday, but black sewage is bubbling out of house drain traps again.',
        category: 'Drainage',
        severity: 'High',
        department: 'Drainage',
        status: 'Reopened',
        latitude: 21.7890,
        longitude: 72.1530,
        address: 'Lane 7, Kumbharwada Colony',
        area: 'Kumbharwada',
        ward: 'Ward 8 - Anandnagar & Kumbharwada',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Chronic subterranean drainage backup recurring due to main line siltation.',
        aiConfidence: 0.91,
        reportedBy: demoCitizen._id,
        citizenName: 'Raju Rathod'
      },

      // 25. Road - APMC Market Heavy Traffic (Item 25)
      {
        issueNumber: 'BH-2026-00025',
        title: 'Rutting and Deep Bitumen Waves near Bhavnagar APMC Market Gate',
        description: 'Heavy onion and cotton trucks have rutted the road into 10-inch asphalt ridges. Small vehicles and autorickshaws scraping undercarriages.',
        category: 'Road & Pothole',
        severity: 'High',
        department: 'Roads & Infrastructure',
        status: 'Pending',
        latitude: 21.7910,
        longitude: 72.1220,
        address: 'APMC Market Main Entry, Ruva Pari Road',
        area: 'Ruva Pari',
        ward: 'Ward 10 - Ruva & Nari Road',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Severe pavement shear rutting under heavy freight loading.',
        aiConfidence: 0.92,
        reportedBy: demoCitizen._id,
        citizenName: 'Ashok Patel'
      },

      // 26. Sanitation - Akwada Lake Promenade (Item 26)
      {
        issueNumber: 'BH-2026-00026',
        title: 'Plastic Bottle and Pouch Littering along Akwada Lake Jogging Track',
        description: 'Over 200 meters of lakeside jogging promenade littered with disposable water bottles, plastic cups, and snack packets.',
        category: 'Garbage & Sanitation',
        severity: 'Low',
        department: 'Sanitation',
        status: 'Pending',
        latitude: 21.7310,
        longitude: 72.1760,
        address: 'Lakeside Jogging Promenade, Akwada Lake',
        area: 'Akwada Lake',
        ward: 'Ward 9 - Sidsar & Akwada Lake Area',
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Non-biodegradable municipal recreational park litter.',
        aiConfidence: 0.86,
        reportedBy: demoCitizen._id,
        citizenName: 'Dr. Kinjal Desai'
      },

      // 27. Streetlight - Low Hanging Wire (Item 27)
      {
        issueNumber: 'BH-2026-00027',
        title: 'Sagging Overhead Streetlight Cable Touching Truck Tops on Nari Road',
        description: 'Service wire spanning across Nari Road is hanging below 12 feet, already brushed by two container trucks.',
        category: 'Streetlight',
        severity: 'High',
        department: 'Electrical',
        status: 'In Progress',
        latitude: 21.7950,
        longitude: 72.1150,
        address: 'Nari Road Industrial Crossing',
        area: 'Nari Road',
        ward: 'Ward 10 - Ruva & Nari Road',
        imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c63f732?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Sagging live overhead conductor crossing major freight highway.',
        aiConfidence: 0.95,
        reportedBy: demoCitizen._id,
        citizenName: 'Irfan Mansuri'
      },

      // 28. Water Leakage - Low Pressure Contamination (Item 28)
      {
        issueNumber: 'BH-2026-00028',
        title: 'Muddy Discolored Drinking Water Supplied to 40 Homes in Shishu Vihar',
        description: 'Tap water coming out dark brown and smelling of soil for the 2nd morning in a row in Shishu Vihar societies.',
        category: 'Water Leakage',
        severity: 'Critical',
        department: 'Water Supply',
        status: 'Pending',
        latitude: 21.7700,
        longitude: 72.1450,
        address: 'Shishu Vihar Circle Residential Lane',
        area: 'Shishu Vihar',
        ward: 'Ward 7 - Kalanala & Crescent Circle',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Municipal potable supply contamination indicating subterranean cross-infiltration.',
        aiConfidence: 0.96,
        reportedBy: demoCitizen._id,
        citizenName: 'Pratibha Ben'
      },

      // 29. Public Property - Coastal Road Signage (Item 29)
      {
        issueNumber: 'BH-2026-00029',
        title: 'Reflective Caution Signs Missing on Sharp Curves of Ghogha Port Road',
        description: 'Night guidance chevron boards rusted and broken off along the coastal curve near Ghogha salt pans.',
        category: 'Public Property',
        severity: 'Low',
        department: 'Public Property',
        status: 'Pending',
        latitude: 21.7580,
        longitude: 72.1720,
        address: 'Ghogha Port Coastal Road, KM 4 Marker',
        area: 'Ghogha Road',
        ward: 'Ward 3 - Nilambag & Ghogha Circle',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Missing roadway delineators on dark intercity transit alignment.',
        aiConfidence: 0.85,
        reportedBy: demoCitizen._id,
        citizenName: 'Chetan Vaghela'
      },

      // 30. Tree & Environment - Withered Garden Plants (Item 30)
      {
        issueNumber: 'BH-2026-00030',
        title: 'Drip Irrigation Broken and Flower Beds Withered at Victoria Park Children Area',
        description: 'Sprinkler pipes cut and decorative flower beds completely dried up in the children playground zone of Victoria Park.',
        category: 'Tree & Environment',
        severity: 'Low',
        department: 'Garden & Environment',
        status: 'Pending',
        latitude: 21.7550,
        longitude: 72.1435,
        address: 'Victoria Park Children Play Area, Ward 2',
        area: 'Victoria Park',
        ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
        aiSummary: 'Horticultural irrigation failure in public recreational garden.',
        aiConfidence: 0.87,
        reportedBy: demoCitizen._id,
        citizenName: 'Neelam Solanki'
      }
    ];

    const seededIssues = [];
    const timelineRecords = [];

    for (const item of rawIssues) {
      const isResolved = item.status === 'Resolved';
      const isInProgress = item.status === 'In Progress';
      const isReopened = item.status === 'Reopened';

      const issueDoc = {
        issueNumber: item.issueNumber,
        trackingId: item.issueNumber,
        title: item.title,
        description: item.description,
        category: item.category,
        severity: item.severity,
        department: item.department,
        assignedDepartment: item.department,
        status: item.status,
        latitude: item.latitude,
        longitude: item.longitude,
        location: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
          address: item.address,
          ward: item.ward,
          landmark: item.area
        },
        address: item.address,
        area: item.area,
        ward: item.ward,
        imageUrl: item.imageUrl || '',
        images: item.imageUrl ? [item.imageUrl] : [],
        resolutionImageUrl: item.resolutionImageUrl || '',
        resolutionNote: item.resolutionNote || '',
        resolvedAt: item.resolvedAt || null,
        resolution: isResolved
          ? {
              resolvedAt: item.resolvedAt,
              resolvedBy: item.assignedOfficer ? item.assignedOfficer._id : personaAdmin._id,
              notes: item.resolutionNote,
              proofImage: item.resolutionImageUrl
            }
          : undefined,
        citizenFeedback: isResolved
          ? {
              rating: 5,
              comment: 'Great work by Bhavnagar Municipal team. The problem was resolved quickly!',
              submittedAt: new Date(item.resolvedAt.getTime() + 2 * 3600000)
            }
          : undefined,
        aiSummary: item.aiSummary,
        aiConfidence: item.aiConfidence,
        aiAnalysis: {
          analyzedAt: new Date(Date.now() - 48 * 3600000),
          confidence: item.aiConfidence,
          suggestedCategory: item.category,
          suggestedDepartment: item.department,
          severityScore: item.severity === 'Critical' ? 9 : item.severity === 'High' ? 7 : item.severity === 'Medium' ? 5 : 3,
          safetyHazard: item.severity === 'Critical',
          urgencyReason: item.aiSummary,
          detectedKeywords: [item.category.toLowerCase(), item.area.toLowerCase()],
          summary: item.aiSummary
        },
        reportedBy: item.reportedBy,
        citizenContact: {
          name: item.citizenName,
          phone: '9876543210'
        },
        assignedOfficer: item.assignedOfficer
          ? {
              officerId: item.assignedOfficer._id,
              officerName: item.assignedOfficer.name,
              assignedAt: new Date(Date.now() - 30 * 3600000)
            }
          : undefined,
        timeline: []
      };

      // Construct Timeline entries
      const issueTimeline = [
        {
          action: 'Report Submitted',
          status: 'Pending',
          description: `Citizen ${item.citizenName} reported civic grievance with geo-coordinates.`,
          notes: `Citizen ${item.citizenName} reported civic grievance with geo-coordinates.`,
          performedBy: item.citizenName,
          updatedBy: item.citizenName,
          createdAt: new Date(Date.now() - 72 * 3600000),
          timestamp: new Date(Date.now() - 72 * 3600000)
        },
        {
          action: 'AI Analysis Completed',
          status: 'Pending',
          description: `AI Triage engine assigned severity ${item.severity} and routed ticket to ${item.department}.`,
          notes: `AI Triage engine assigned severity ${item.severity} and routed ticket to ${item.department}.`,
          performedBy: 'AI Civic Intelligence Engine',
          updatedBy: 'AI Civic Intelligence Engine',
          createdAt: new Date(Date.now() - 70 * 3600000),
          timestamp: new Date(Date.now() - 70 * 3600000)
        }
      ];

      if (isInProgress || isResolved || isReopened) {
        issueTimeline.push({
          action: 'Assigned',
          status: 'In Progress',
          description: `Assigned to field division of ${item.department} for inspection and dispatch.`,
          notes: `Assigned to field division of ${item.department} for inspection and dispatch.`,
          performedBy: 'Supervising Engineer',
          updatedBy: 'Supervising Engineer',
          createdAt: new Date(Date.now() - 50 * 3600000),
          timestamp: new Date(Date.now() - 50 * 3600000)
        });
        issueTimeline.push({
          action: 'Work Started',
          status: 'In Progress',
          description: `Municipal field team arrived on-site in ${item.area} and commenced repair work.`,
          notes: `Municipal field team arrived on-site in ${item.area} and commenced repair work.`,
          performedBy: item.assignedOfficer?.name || 'Field Duty Team',
          updatedBy: item.assignedOfficer?.name || 'Field Duty Team',
          createdAt: new Date(Date.now() - 40 * 3600000),
          timestamp: new Date(Date.now() - 40 * 3600000)
        });
      }

      if (isResolved) {
        issueTimeline.push({
          action: 'Resolution Submitted',
          status: 'Resolved',
          description: item.resolutionNote,
          notes: item.resolutionNote,
          performedBy: item.assignedOfficer?.name || 'BMC Field Engineer',
          updatedBy: item.assignedOfficer?.name || 'BMC Field Engineer',
          createdAt: item.resolvedAt,
          timestamp: item.resolvedAt
        });
        issueTimeline.push({
          action: 'Feedback Submitted',
          status: 'Resolved',
          description: 'Citizen verified photographic evidence on-site and submitted a 5-star rating.',
          notes: 'Citizen verified photographic evidence on-site and submitted a 5-star rating.',
          performedBy: item.citizenName,
          updatedBy: item.citizenName,
          createdAt: new Date(item.resolvedAt.getTime() + 2 * 3600000),
          timestamp: new Date(item.resolvedAt.getTime() + 2 * 3600000)
        });
      }

      if (isReopened) {
        issueTimeline.push({
          action: 'Reopened',
          status: 'Reopened',
          description: 'Citizen reported recurring hazard: initial repair was ineffective or incomplete.',
          notes: 'Citizen reported recurring hazard: initial repair was ineffective or incomplete.',
          performedBy: item.citizenName,
          updatedBy: item.citizenName,
          createdAt: new Date(Date.now() - 6 * 3600000),
          timestamp: new Date(Date.now() - 6 * 3600000)
        });
      }

      issueDoc.timeline = issueTimeline;
      seededIssues.push(issueDoc);
    }

    const insertedIssues = await Issue.insertMany(seededIssues);

    // Create corresponding Timeline records for all inserted issues
    for (const doc of insertedIssues) {
      for (const entry of doc.timeline) {
        timelineRecords.push({
          issueId: doc._id,
          action: entry.action,
          description: entry.description,
          performedBy: entry.performedBy,
          createdAt: entry.createdAt
        });
      }
    }
    await Timeline.insertMany(timelineRecords);

    // Set sequence counter so subsequent created issues start at BH-2026-00031
    await setCounterSequence(30, 2026);

    console.log(`[Seed] Successfully seeded:`);
    console.log(`  - 6 Demo Users (including citizen@smartbhavnagar.demo & admin@smartbhavnagar.demo)`);
    console.log(`  - ${departments.length} Municipal Departments`);
    console.log(`  - ${categories.length} Civic Categories`);
    console.log(`  - ${insertedIssues.length} Realistic Bhavnagar Issues`);
    console.log(`  - ${timelineRecords.length} Timeline History Records`);
    console.log(`  - Counter initialized at sequence 30 (Next issue: BH-2026-00031)`);

    return {
      success: true,
      usersCount: 6,
      departmentsCount: departments.length,
      categoriesCount: categories.length,
      issuesCount: insertedIssues.length,
      timelineCount: timelineRecords.length
    };
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

if (process.argv[1]?.endsWith('seedBhavnagarData.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Failed]:', err);
      process.exit(1);
    });
}
