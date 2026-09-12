import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { config } from '../config/env.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(config.mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Issue.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const citizen = await User.create({
      name: 'Hardik Patel',
      phone: '9898000001',
      email: 'hardik.citizen@bhavnagar.gov.in',
      password: 'password123',
      role: 'citizen',
      department: 'General Administration',
      ward: 'Ward 2 - Waghawadi Road & Takhteshwar'
    });

    const officerRoads = await User.create({
      name: 'Rajesh Vaghela',
      phone: '9898000002',
      email: 'rajesh.pwd@bhavnagar.gov.in',
      password: 'password123',
      role: 'officer',
      department: 'Roads & Buildings (PWD)',
      ward: 'Ward 1 - Kaliyabid & Hill Drive'
    });

    const officerWaste = await User.create({
      name: 'Meena Trivedi',
      phone: '9898000003',
      email: 'meena.swm@bhavnagar.gov.in',
      password: 'password123',
      role: 'officer',
      department: 'Solid Waste Management',
      ward: 'Ward 3 - Nilambag & Ghogha Circle'
    });

    const admin = await User.create({
      name: 'Dr. Sanjay Bhatt (Municipal Commissioner)',
      phone: '9898000004',
      email: 'commissioner@bhavnagar.gov.in',
      password: 'password123',
      role: 'admin',
      department: 'General Administration',
      ward: 'Ward 7 - Kalanala & Crescent Circle'
    });

    console.log('[Seed] Creating realistic Bhavnagar civic issues...');

    const sampleIssues = [
      {
        trackingId: 'SB-2026-101',
        title: 'Deep Hazardous Pothole near Takhteshwar Temple Approach',
        description: 'Large asphalt crater over 8 inches deep causing frequent two-wheeler skids and sudden traffic halts near the uphill temple curve.',
        category: 'roads_potholes',
        images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60'],
        location: {
          type: 'Point',
          coordinates: [72.1465, 21.7580], // Takhteshwar Temple area
          address: 'Takhteshwar Temple Road, Ward 2',
          ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
          landmark: 'Opposite Hill Crest Gardens'
        },
        reportedBy: citizen._id,
        citizenContact: { name: 'Hardik Patel', phone: '9898000001' },
        status: 'in_progress',
        priority: 'urgent',
        assignedDepartment: 'Roads & Buildings (PWD)',
        assignedOfficer: {
          officerId: officerRoads._id,
          officerName: officerRoads.name,
          assignedAt: new Date(Date.now() - 24 * 3600000)
        },
        aiAnalysis: {
          analyzedAt: new Date(Date.now() - 28 * 3600000),
          confidence: 0.94,
          suggestedCategory: 'roads_potholes',
          suggestedDepartment: 'Roads & Buildings (PWD)',
          severityScore: 9,
          safetyHazard: true,
          urgencyReason: 'Deep crater on elevated curve directly endangers two-wheeler commuters.',
          detectedKeywords: ['crater', 'two-wheeler skid', 'hazardous pothole'],
          summary: 'High-risk road depression on arterial pilgrim corridor requiring immediate patch-mix asphalt leveling.'
        },
        timeline: [
          {
            status: 'submitted',
            notes: 'Citizen submitted report with geo-tagged photograph.',
            timestamp: new Date(Date.now() - 30 * 3600000),
            updatedBy: 'Hardik Patel'
          },
          {
            status: 'ai_analyzed',
            notes: 'AI Triage classified as Urgent Priority (Severity 9/10) with public safety hazard flag.',
            timestamp: new Date(Date.now() - 28 * 3600000),
            updatedBy: 'AI Civic Engine'
          },
          {
            status: 'assigned',
            notes: 'Dispatched to PWD Quick Response Team Lead Rajesh Vaghela.',
            timestamp: new Date(Date.now() - 24 * 3600000),
            updatedBy: 'Dispatch System'
          },
          {
            status: 'in_progress',
            notes: 'Asphalt roller and road repair crew deployed on site. Leveling underway.',
            timestamp: new Date(Date.now() - 6 * 3600000),
            updatedBy: 'Rajesh Vaghela'
          }
        ]
      },
      {
        trackingId: 'SB-2026-102',
        title: 'Overflowing Community Waste Bins near Crescent Circle',
        description: 'Secondary waste containers overflowing across pedestrian sidewalk. Strong stench causing distress to local shopkeepers and passersby.',
        category: 'garbage_waste',
        images: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60'],
        location: {
          type: 'Point',
          coordinates: [72.1480, 21.7725], // Crescent Circle area
          address: 'Station Road, Near Crescent Market',
          ward: 'Ward 7 - Kalanala & Crescent Circle',
          landmark: 'Near Crescent Circle Fountain'
        },
        reportedBy: null,
        citizenContact: { name: 'Pooja Jani', phone: '9825102030' },
        status: 'resolved',
        priority: 'high',
        assignedDepartment: 'Solid Waste Management',
        assignedOfficer: {
          officerId: officerWaste._id,
          officerName: officerWaste.name,
          assignedAt: new Date(Date.now() - 48 * 3600000)
        },
        resolution: {
          resolvedAt: new Date(Date.now() - 4 * 3600000),
          resolvedBy: officerWaste._id,
          notes: 'BMC hydraulic dumper truck cleared 2.4 tons of accumulated refuse. Disinfectant lime powder sprayed across sidewalk perimeter.',
          proofImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60'
        },
        citizenFeedback: {
          rating: 5,
          comment: 'Incredible speed! The area is spotless and sanitization powder was also applied.',
          submittedAt: new Date(Date.now() - 2 * 3600000)
        },
        aiAnalysis: {
          analyzedAt: new Date(Date.now() - 50 * 3600000),
          confidence: 0.92,
          suggestedCategory: 'garbage_waste',
          suggestedDepartment: 'Solid Waste Management',
          severityScore: 7,
          safetyHazard: false,
          urgencyReason: 'Commercial zone accumulation posing sanitation and vector control risk.',
          detectedKeywords: ['overflowing waste', 'sidewalk blockage', 'stench'],
          summary: 'SWM compactor dispatch recommended within 6-hour SLA window.'
        },
        timeline: [
          {
            status: 'submitted',
            notes: 'Citizen report logged.',
            timestamp: new Date(Date.now() - 52 * 3600000),
            updatedBy: 'Pooja Jani'
          },
          {
            status: 'assigned',
            notes: 'Assigned to SWM Ward Inspector Meena Trivedi.',
            timestamp: new Date(Date.now() - 48 * 3600000),
            updatedBy: 'BMC Dispatch'
          },
          {
            status: 'in_progress',
            notes: 'SWM Dumper vehicle dispatched to Crescent Circle.',
            timestamp: new Date(Date.now() - 10 * 3600000),
            updatedBy: 'Meena Trivedi'
          },
          {
            status: 'resolved',
            notes: 'Area cleared and bleached. Before/After proof verified.',
            timestamp: new Date(Date.now() - 4 * 3600000),
            updatedBy: 'Meena Trivedi'
          }
        ]
      },
      {
        trackingId: 'SB-2026-103',
        title: 'Main Drinking Water Pipeline Rupture with High-Volume Flow',
        description: 'Potable water pipeline joint burst leaking thousands of liters per hour onto Victoria Park Road. Water pressure completely dropped in nearby residential colony.',
        category: 'water_drainage',
        images: ['https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=60'],
        location: {
          type: 'Point',
          coordinates: [72.1380, 21.7520], // Victoria Park / Kaliyabid
          address: 'Hill Drive Road, Adjacent to Victoria Park Gate 2',
          ward: 'Ward 1 - Kaliyabid & Hill Drive',
          landmark: 'Victoria Park Gate 2'
        },
        reportedBy: citizen._id,
        citizenContact: { name: 'Kishan Dave', phone: '9712345678' },
        status: 'assigned',
        priority: 'urgent',
        assignedDepartment: 'Water Works & Drainage',
        assignedOfficer: {
          officerId: officerRoads._id,
          officerName: 'Anil Makwana (Hydraulic Dept)',
          assignedAt: new Date(Date.now() - 3 * 3600000)
        },
        aiAnalysis: {
          analyzedAt: new Date(Date.now() - 5 * 3600000),
          confidence: 0.96,
          suggestedCategory: 'water_drainage',
          suggestedDepartment: 'Water Works & Drainage',
          severityScore: 9,
          safetyHazard: true,
          urgencyReason: 'Major clean drinking water loss and potential erosion of road foundation under pavement.',
          detectedKeywords: ['pipeline burst', 'drinking water loss', 'road flooding'],
          summary: 'Urgent hydraulic valve isolation required to prevent residential water outage.'
        },
        timeline: [
          {
            status: 'submitted',
            notes: 'Reported with high priority tag.',
            timestamp: new Date(Date.now() - 6 * 3600000),
            updatedBy: 'Kishan Dave'
          },
          {
            status: 'ai_analyzed',
            notes: 'AI flagged as Critical Resource Hazard (Urgency 9/10).',
            timestamp: new Date(Date.now() - 5 * 3600000),
            updatedBy: 'AI Engine'
          },
          {
            status: 'assigned',
            notes: 'Dispatched to Water Works Emergency Mobile Unit.',
            timestamp: new Date(Date.now() - 3 * 3600000),
            updatedBy: 'BMC Water Works'
          }
        ]
      },
      {
        trackingId: 'SB-2026-104',
        title: 'Flickering and Faulty Streetlights on Ghogha Circle Stretch',
        description: 'Row of 6 LED streetlights completely unlit for 3 nights, creating pitch dark zone on busy circle junction prone to vehicle collisions.',
        category: 'street_light',
        images: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60'],
        location: {
          type: 'Point',
          coordinates: [72.1620, 21.7680], // Ghogha Circle
          address: 'Ghogha Road Junction, Near Bhavnagar Port Highway',
          ward: 'Ward 3 - Nilambag & Ghogha Circle',
          landmark: 'Near Ghogha Circle Petrol Pump'
        },
        reportedBy: null,
        citizenContact: { name: 'Aakash Rathod', phone: '9428001122' },
        status: 'ai_analyzed',
        priority: 'high',
        assignedDepartment: 'Electrical & Street Lighting',
        aiAnalysis: {
          analyzedAt: new Date(Date.now() - 8 * 3600000),
          confidence: 0.89,
          suggestedCategory: 'street_light',
          suggestedDepartment: 'Electrical & Street Lighting',
          severityScore: 6,
          safetyHazard: false,
          urgencyReason: 'Circulatory junction night visibility blackout increases vehicular accident risk.',
          detectedKeywords: ['street light failure', 'dark junction', 'LED outage'],
          summary: 'Electrical department pole inspection required along Ghogha Road perimeter.'
        },
        timeline: [
          {
            status: 'submitted',
            notes: 'Citizen reported dark highway stretch.',
            timestamp: new Date(Date.now() - 9 * 3600000),
            updatedBy: 'Aakash Rathod'
          },
          {
            status: 'ai_analyzed',
            notes: 'AI Triage categorized under Electrical & Street Lighting.',
            timestamp: new Date(Date.now() - 8 * 3600000),
            updatedBy: 'AI Engine'
          }
        ]
      },
      {
        trackingId: 'SB-2026-105',
        title: 'Herd of Unattended Stray Cattle Blocking Waghawadi Main Road',
        description: 'Over 10 stray cows and bulls resting in middle of high-speed Waghawadi carriage-way during peak evening school/office transit.',
        category: 'stray_animals',
        images: ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=60'],
        location: {
          type: 'Point',
          coordinates: [72.1420, 21.7610], // Waghawadi road
          address: 'Waghawadi Road, Opposite Jewels Circle',
          ward: 'Ward 2 - Waghawadi Road & Takhteshwar',
          landmark: 'Jewels Circle Crossing'
        },
        reportedBy: null,
        citizenContact: { name: 'Vikramsinh Gohil', phone: '9909012345' },
        status: 'resolved',
        priority: 'high',
        assignedDepartment: 'Encroachment & Animal Control',
        resolution: {
          resolvedAt: new Date(Date.now() - 14 * 3600000),
          notes: 'BMC Cattle Impounding Van (CNB) relocated 11 stray bovines to Panjrapole / municipal gaushala shelter.',
          proofImage: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=60'
        },
        citizenFeedback: {
          rating: 5,
          comment: 'Quick response before evening rush hour. Road cleared completely.',
          submittedAt: new Date(Date.now() - 12 * 3600000)
        },
        aiAnalysis: {
          analyzedAt: new Date(Date.now() - 20 * 3600000),
          confidence: 0.95,
          suggestedCategory: 'stray_animals',
          suggestedDepartment: 'Encroachment & Animal Control',
          severityScore: 8,
          safetyHazard: true,
          urgencyReason: 'Active traffic hazard with heavy vehicular collision risks on Bhavnagar primary arterial road.',
          detectedKeywords: ['stray cattle', 'waghawadi road', 'traffic obstruction'],
          summary: 'Animal control dispatch mandated for immediate road clearance.'
        },
        timeline: [
          {
            status: 'submitted',
            notes: 'Citizen submitted report with photo.',
            timestamp: new Date(Date.now() - 22 * 3600000),
            updatedBy: 'Vikramsinh Gohil'
          },
          {
            status: 'assigned',
            notes: 'Cattle impound team mobilized.',
            timestamp: new Date(Date.now() - 18 * 3600000),
            updatedBy: 'Control Room'
          },
          {
            status: 'resolved',
            notes: 'Cattle safely transferred to shelter. Traffic normalized.',
            timestamp: new Date(Date.now() - 14 * 3600000),
            updatedBy: 'BMC Animal Control'
          }
        ]
      },
      {
        trackingId: 'SB-2026-106',
        title: 'Open Gutter Chamber without Safety Cover near Primary School',
        description: 'Drainage manhole lid cracked and missing for 4 days on pedestrian walkway right in front of Municipal School No. 14 in Chitra.',
        category: 'water_drainage',
        images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60'],
        location: {
          type: 'Point',
          coordinates: [72.1280, 21.7850], // Chitra GIDC area
          address: 'Main Industrial Road, Chitra GIDC',
          ward: 'Ward 4 - Chitra GIDC & Subhashnagar',
          landmark: 'Near Municipal School No. 14'
        },
        reportedBy: citizen._id,
        citizenContact: { name: 'Bhupatbhai Solanki', phone: '9879054321' },
        status: 'in_progress',
        priority: 'urgent',
        assignedDepartment: 'Water Works & Drainage',
        aiAnalysis: {
          analyzedAt: new Date(Date.now() - 16 * 3600000),
          confidence: 0.98,
          suggestedCategory: 'water_drainage',
          suggestedDepartment: 'Water Works & Drainage',
          severityScore: 10,
          safetyHazard: true,
          urgencyReason: 'Open chamber adjacent to elementary school presents lethal falling hazard to young children and pedestrians.',
          detectedKeywords: ['open manhole', 'school zone', 'falling hazard'],
          summary: 'Maximum urgency emergency alert triggered. Immediate barricade and concrete chamber cover placement required.'
        },
        timeline: [
          {
            status: 'submitted',
            notes: 'Urgent citizen grievance received.',
            timestamp: new Date(Date.now() - 18 * 3600000),
            updatedBy: 'Bhupatbhai Solanki'
          },
          {
            status: 'ai_analyzed',
            notes: 'AI identified Severity 10/10 Public Danger. Emergency escalation triggered.',
            timestamp: new Date(Date.now() - 16 * 3600000),
            updatedBy: 'AI Engine'
          },
          {
            status: 'in_progress',
            notes: 'Warning cones and barricades installed. Reinforced concrete cover arriving by transport truck.',
            timestamp: new Date(Date.now() - 2 * 3600000),
            updatedBy: 'BMC Engineering'
          }
        ]
      }
    ];

    await Issue.insertMany(sampleIssues);
    console.log(`[Seed] Successfully seeded ${sampleIssues.length} issues and demo users!`);
    return { success: true, count: sampleIssues.length };
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
