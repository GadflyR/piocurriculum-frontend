// js/courseDefinitions.js
const COURSE_DEFINITIONS = [
  // ============ Period 1 ============
  { name: "Biology, CP", gpa: 4.33, diff: 4.5, rel: 4.7, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Geometry, Honors", gpa: 5.00, diff: 2.6, rel: 2.5, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Instrumental Music I (Fall) / Instrumental Music II(Spring)", gpa: 4.00, diff: 4.6, rel: 2.4, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Chemistry, Honors", gpa: 5.00, diff: 2.7, rel: 2.6, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Modern World History, CP", gpa: 4.33, diff: 3.5, rel: 4.3, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Financial Literacy (Fall)/ Intro to Business (Spring)", gpa: 4.00, diff: 4.3, rel: 3.5, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "SAT English (Spring)", gpa: 4.00, diff: 4.9, rel: 3.7, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "SAT Math (Fall)/SAT Math (Spring)", gpa: 4.00, diff: 4.6, rel: 3.4, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "English 11, Honors", gpa: 5.00, diff: 4.0, rel: 4.6, period: 1, minG: 11, maxG: 11, isAP: false },
  { name: "PE/Health (Fall) / PE/Health (Spring)", gpa: 4.00, diff: 2.9, rel: 3.1, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Spanish IV, Honors", gpa: 5.00, diff: 3.7, rel: 4.7, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Arabic III & IV, Honors", gpa: 5.00, diff: 3.9, rel: 4.8, period: 1, minG: 9,  maxG: 12, isAP: false },
  { name: "Essay Writing for Seniors (Fall)", gpa: 4.00, diff: 3.8, rel: 4.5, period: 1, minG: 12, maxG: 12, isAP: false },
  { name: "AP Statistics", gpa: 5.33, diff: 4.8, rel: 5.0, period: 1, minG: 10, maxG: 12, isAP: true },
  { name: "Cybersecurity", gpa: 4.00, diff: 4.5, rel: 4.8, period: 1, minG: 9,  maxG: 12, isAP: false },

  // ============ Period 2 ============
  { name: "Algebra I", gpa: 4.00, diff: 3.2, rel: 3.8, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "Geometry, CP", gpa: 4.33, diff: 3.5, rel: 4.0, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "Graphic Design - Full Year", gpa: 4.00, diff: 3.9, rel: 4.2, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "Modern World History, CP", gpa: 4.33, diff: 3.5, rel: 4.3, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "English 10, Honors", gpa: 5.00, diff: 4.1, rel: 4.7, period: 2, minG: 10, maxG: 10, isAP: false },
  { name: "Honors Precalculus", gpa: 5.00, diff: 4.7, rel: 5.0, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "Spanish III, Honors", gpa: 5.00, diff: 3.6, rel: 4.8, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "Anatomy and Physiology", gpa: 4.00, diff: 4.5, rel: 4.2, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "Instrumental Music I (Fall) / Instrumental Music II(Spring)", gpa: 4.00, diff: 4.6, rel: 2.4, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "National & International Current Affairs (Fall) / Public Speaking (Spring)", gpa: 4.00, diff: 3.7, rel: 4.0, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "English 12, CP", gpa: 4.33, diff: 4.2, rel: 4.5, period: 2, minG: 12, maxG: 12, isAP: false },
  { name: "AP US History", gpa: 5.33, diff: 4.9, rel: 5.0, period: 2, minG: 10, maxG: 12, isAP: true },
  { name: "Broadcast Media Production", gpa: 4.00, diff: 3.7, rel: 4.0, period: 2, minG: 9,  maxG: 12, isAP: false },
  { name: "Dynamic Programming", gpa: 4.00, diff: 4.8, rel: 5.0, period: 2, minG: 9,  maxG: 12, isAP: false },

  // ============ Period 3 ============
  { name: "Spanish I /Arabic I /Turkish I / Chinese I / French I (Independent Study with a Supervisor)", gpa: 4.00, diff: 3.2, rel: 3.5, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "English 9, Honors", gpa: 5.00, diff: 3.6, rel: 4.5, period: 3, minG: 9,  maxG: 9,  isAP: false },
  { name: "Digital Visual Art (Fall) / Cultivating Creativity (Spring)", gpa: 4.00, diff: 4.0, rel: 3.7, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "Instrumental Music I (Fall) / Instrumental Music II(Spring)", gpa: 4.00, diff: 4.6, rel: 2.4, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "English 10, CP", gpa: 4.33, diff: 3.5, rel: 4.0, period: 3, minG: 10, maxG: 10, isAP: false },
  { name: "AP Precalculus", gpa: 5.33, diff: 4.8, rel: 5.0, period: 3, minG: 10, maxG: 12, isAP: true },
  { name: "Chemistry, CP", gpa: 4.33, diff: 3.5, rel: 4.7, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "Web Development I (Fall)/Web Development II", gpa: 4.00, diff: 4.6, rel: 5.0, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "Sociology of the Future (Fall) / Global Issues (Spring)", gpa: 4.00, diff: 3.8, rel: 4.3, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "Precalculus, CP", gpa: 4.33, diff: 4.0, rel: 4.6, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "National & International Current Affairs (Fall) / Public Speaking (Spring)", gpa: 4.00, diff: 3.7, rel: 4.0, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "PE/Health (Fall) / PE/Health (Spring)", gpa: 4.00, diff: 2.9, rel: 3.1, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "AP English Language & Composition", gpa: 5.33, diff: 4.6, rel: 5.0, period: 3, minG: 11, maxG: 12, isAP: true },
  { name: "Calculus", gpa: 4.00, diff: 4.3, rel: 4.7, period: 3, minG: 9,  maxG: 12, isAP: false },
  { name: "AP Physics I", gpa: 5.33, diff: 4.9, rel: 5.0, period: 3, minG: 10, maxG: 12, isAP: true },

  // ============ Period 4 ============
  { name: "US History, CP", gpa: 4.33, diff: 3.7, rel: 4.2, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "Biology, Honors", gpa: 5.00, diff: 4.2, rel: 4.8, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "PE/Health (Fall) / PE/Health (Spring)", gpa: 4.00, diff: 2.9, rel: 3.1, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "Spanish II, Honors", gpa: 5.00, diff: 3.8, rel: 4.7, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "Arabic II, CP", gpa: 4.33, diff: 3.5, rel: 4.0, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "Instrumental Music I (Fall) / Instrumental Music II(Spring)", gpa: 4.00, diff: 4.6, rel: 2.4, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "English 11", gpa: 4.00, diff: 3.9, rel: 4.3, period: 4, minG: 11, maxG: 11, isAP: false },
  { name: "AP Computer Science A", gpa: 5.33, diff: 4.9, rel: 5.0, period: 4, minG: 10, maxG: 12, isAP: true },
  { name: "AP Chemistry", gpa: 5.33, diff: 5.0, rel: 5.0, period: 4, minG: 10, maxG: 12, isAP: true },
  { name: "Financial Literacy (Fall)/ Intro to Business (Spring)", gpa: 4.00, diff: 4.3, rel: 3.5, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "Juniors Only with cumulative unweighted GPA 3.75 and above", gpa: 4.00, diff: 4.0, rel: 4.0, period: 4, minG: 11, maxG: 11, isAP: false },
  { name: "Seniors Only Independent Online Courses with a Supervisor (Fall) / Independent Online Courses with a Supervisor (Spring)", gpa: 4.00, diff: 3.8, rel: 4.2, period: 4, minG: 12, maxG: 12, isAP: false },
  { name: "Intro to World Religions, Mythology, and Belief Systems I (Fall) / Intro to World Religions, Mythology, and Belief", gpa: 4.00, diff: 3.7, rel: 4.0, period: 4, minG: 9,  maxG: 12, isAP: false },
  { name: "Sociology (Fall)/Anthropology(Spring)", gpa: 4.00, diff: 4.0, rel: 4.5, period: 4, minG: 9,  maxG: 12, isAP: false },

  // ============ Period 5 ============
  { name: "PE/Health (Fall) / PE/Health (Spring)", gpa: 4.00, diff: 2.9, rel: 3.1, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "English 9, Honors", gpa: 5.00, diff: 3.5, rel: 4.6, period: 5, minG: 9,  maxG: 9,  isAP: false },
  { name: "Pencil and Ink Illustration (Fall) / Drawing and Painting (Spring)", gpa: 4.00, diff: 4.0, rel: 3.5, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "US History, Honors", gpa: 5.00, diff: 4.4, rel: 5.0, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "Chemistry, CP", gpa: 4.33, diff: 3.5, rel: 4.7, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "Computer Programming I (Fall) / Computer Programming II (Spring)", gpa: 4.00, diff: 4.7, rel: 5.0, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "AP Biology", gpa: 5.33, diff: 4.9, rel: 5.0, period: 5, minG: 10, maxG: 12, isAP: true },
  { name: "AP Psychology", gpa: 5.33, diff: 4.8, rel: 5.0, period: 5, minG: 10, maxG: 12, isAP: true },
  { name: "Physics, CP/Honors", gpa: 5.00, diff: 4.5, rel: 4.9, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "AP Comparative Government and Politics", gpa: 5.33, diff: 5.0, rel: 5.0, period: 5, minG: 10, maxG: 12, isAP: true },
  { name: "Entrepreneurship / Marketing", gpa: 4.00, diff: 4.2, rel: 4.7, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "Precalculus, CP", gpa: 4.33, diff: 4.0, rel: 4.6, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "Calculus", gpa: 4.00, diff: 4.3, rel: 4.7, period: 5, minG: 9,  maxG: 12, isAP: false },
  { name: "AP Calculus AB", gpa: 5.33, diff: 4.9, rel: 5.0, period: 5, minG: 10, maxG: 12, isAP: true },
  { name: "Principles of Business (Fall)/ Project Management (Spring)", gpa: 4.00, diff: 4.3, rel: 4.6, period: 5, minG: 9,  maxG: 12, isAP: false },

  // ============ Period 7 ============
  { name: "English 9, CP", gpa: 4.33, diff: 3.5, rel: 4.0, period: 7, minG: 9,  maxG: 9,  isAP: false },
  { name: "US History, Honors", gpa: 5.00, diff: 4.4, rel: 5.0, period: 7, minG: 9,  maxG: 12, isAP: false },
  { name: "Biology, Honors", gpa: 5.00, diff: 4.2, rel: 4.8, period: 7, minG: 9,  maxG: 12, isAP: false },
  { name: "Algebra II", gpa: 4.00, diff: 4.0, rel: 4.3, period: 7, minG: 9,  maxG: 12, isAP: false },
  { name: "Modern World History, Honors", gpa: 5.00, diff: 4.1, rel: 4.8, period: 7, minG: 9,  maxG: 12, isAP: false },
  { name: "Pencil and Ink Illustration (Fall) / Drawing and Painting (Spring)", gpa: 4.00, diff: 4.0, rel: 3.5, period: 7, minG: 9,  maxG: 12, isAP: false },
  { name: "English 10, CP", gpa: 4.33, diff: 3.5, rel: 4.2, period: 7, minG: 10, maxG: 10, isAP: false },
  { name: "AP US Government and Politics", gpa: 5.33, diff: 4.9, rel: 5.0, period: 7, minG: 10, maxG: 12, isAP: true },
  { name: "AP Macroeconomics", gpa: 5.33, diff: 5.0, rel: 5.0, period: 7, minG: 10, maxG: 12, isAP: true },
  { name: "AP Computer Science Principles", gpa: 5.33, diff: 4.7, rel: 5.0, period: 7, minG: 10, maxG: 12, isAP: true },
  { name: "Principles of Engineering (Fall)\nArchitectural CAD (Spring)", gpa: 4.00, diff: 4.5, rel: 4.8, period: 7, minG: 9,  maxG: 12, isAP: false },
  { name: "Environmental Science", gpa: 4.00, diff: 3.8, rel: 4.6, period: 7, minG: 9,  maxG: 12, isAP: false },
  { name: "English 12, Honors", gpa: 5.00, diff: 4.2, rel: 4.8, period: 7, minG: 12, maxG: 12, isAP: false },
  { name: "Honors Probability & Statistics", gpa: 5.00, diff: 4.5, rel: 4.6, period: 7, minG: 9,  maxG: 12, isAP: false },

  // ============ Period 8 ============
  { name: "Digital Visual Art (Fall) / Animated Thinking (Spring)", gpa: 4.00, diff: 3.9, rel: 3.7, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "Instrumental Music I (Fall) / Instrumental Music II(Spring)", gpa: 4.00, diff: 4.6, rel: 2.4, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "Honors Spanish I", gpa: 5.00, diff: 3.8, rel: 4.5, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "Geometry, CP", gpa: 4.33, diff: 3.5, rel: 4.0, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "Algebra 2, Honors", gpa: 5.00, diff: 4.5, rel: 4.7, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "PE/Health (Fall) / PE/Health (Spring)", gpa: 4.00, diff: 2.9, rel: 3.1, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "Cultural Studies I/ Cultural Studies II", gpa: 4.00, diff: 3.7, rel: 4.0, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "Forensic Science (Fall)/ Introduction to Organic Chemistry (Spring)", gpa: 4.00, diff: 4.4, rel: 4.5, period: 8, minG: 9,  maxG: 12, isAP: false },
  { name: "AP European History", gpa: 5.33, diff: 4.8, rel: 5.0, period: 8, minG: 10, maxG: 12, isAP: true },
  { name: "English 11, Honors", gpa: 5.00, diff: 4.0, rel: 4.6, period: 8, minG: 11, maxG: 11, isAP: false },
  { name: "AP Microeconomics", gpa: 5.33, diff: 5.0, rel: 5.0, period: 8, minG: 10, maxG: 12, isAP: true },
  { name: "AP Calculus BC", gpa: 5.33, diff: 5.0, rel: 5.0, period: 8, minG: 10, maxG: 12, isAP: true },
  { name: "English 12, Honors", gpa: 5.00, diff: 4.2, rel: 4.8, period: 8, minG: 12, maxG: 12, isAP: false }
];
