/* eslint-disable no-case-declarations */

const cors = require('cors');
const bodyParser = require('body-parser');
const fileURLToPath = require('url');
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// ===================== 1) STATIC CONSTANTS (like Java) =====================
const MAX_PLANS = 1000;

// Enums
const MajorDirection = {
  STEM: 1,
  MEDICAL: 2,
  BUSINESS: 3,
  SOCIAL_SCIENCE: 4,
  ENVIRONMENTAL: 5,
  CS_DATA: 6,
  LANGUAGE_CULTURE: 7,
  LAW_POLICY: 8,
};

function fromCode(c) {
  switch (c) {
    case 1: return "STEM";
    case 2: return "MEDICAL";
    case 3: return "BUSINESS";
    case 4: return "SOCIAL_SCIENCE";
    case 5: return "ENVIRONMENTAL";
    case 6: return "CS_DATA";
    case 7: return "LANGUAGE_CULTURE";
    case 8: return "LAW_POLICY";
    default: return "STEM"; // default fallback
  }
}

const CourseCategory = {
  ENGLISH: "ENGLISH",
  MATH: "MATH",
  SCIENCE: "SCIENCE",
  SOCIAL_STUDIES: "SOCIAL_STUDIES",
  FINANCIAL: "FINANCIAL",
  PE_HEALTH: "PE_HEALTH",
  VPA: "VPA",
  WL: "WL",
  LIFE_CAREERS: "LIFE_CAREERS",
  ELECTIVES: "ELECTIVES",
  FREE_PERIOD: "FREE_PERIOD",
};

// GraduationRequirements
class GraduationRequirements {
  constructor() {
    this.englishNeeded = 20;
    this.mathNeeded = 15;
    this.scienceNeeded = 15;
    this.socialNeeded = 15;
    this.financialNeeded = 5;
    this.peHealthNeeded = 10;
    this.vpaNeeded = 5;
    this.wlNeeded = 10;
    this.lifeCareersNeeded = 5;
    this.electivesNeeded = 30;
  }
  updateRequirements(completed) {
    for (const c of completed) {
      switch (c.category) {
        case CourseCategory.ENGLISH: this.englishNeeded -= 5; break;
        case CourseCategory.MATH: this.mathNeeded -= 5; break;
        case CourseCategory.SCIENCE: this.scienceNeeded -= 5; break;
        case CourseCategory.SOCIAL_STUDIES: this.socialNeeded -= 5; break;
        case CourseCategory.FINANCIAL: this.financialNeeded -= 5; break;
        case CourseCategory.PE_HEALTH: this.peHealthNeeded -= 5; break;
        case CourseCategory.VPA: this.vpaNeeded -= 5; break;
        case CourseCategory.WL: this.wlNeeded -= 5; break;
        case CourseCategory.LIFE_CAREERS: this.lifeCareersNeeded -= 5; break;
        case CourseCategory.ELECTIVES: this.electivesNeeded -= 5; break;
        default:
          break;
      }
    }
    // clamp to 0
    this.englishNeeded = Math.max(0, this.englishNeeded);
    this.mathNeeded = Math.max(0, this.mathNeeded);
    this.scienceNeeded = Math.max(0, this.scienceNeeded);
    this.socialNeeded = Math.max(0, this.socialNeeded);
    this.financialNeeded = Math.max(0, this.financialNeeded);
    this.peHealthNeeded = Math.max(0, this.peHealthNeeded);
    this.vpaNeeded = Math.max(0, this.vpaNeeded);
    this.wlNeeded = Math.max(0, this.wlNeeded);
    this.lifeCareersNeeded = Math.max(0, this.lifeCareersNeeded);
    this.electivesNeeded = Math.max(0, this.electivesNeeded);
  }
  needThisCategory(cat) {
    switch (cat) {
      case CourseCategory.ENGLISH: return this.englishNeeded > 0;
      case CourseCategory.MATH: return this.mathNeeded > 0;
      case CourseCategory.SCIENCE: return this.scienceNeeded > 0;
      case CourseCategory.SOCIAL_STUDIES: return this.socialNeeded > 0;
      case CourseCategory.FINANCIAL: return this.financialNeeded > 0;
      case CourseCategory.PE_HEALTH: return this.peHealthNeeded > 0;
      case CourseCategory.VPA: return this.vpaNeeded > 0;
      case CourseCategory.WL: return this.wlNeeded > 0;
      case CourseCategory.LIFE_CAREERS: return this.lifeCareersNeeded > 0;
      case CourseCategory.ELECTIVES: return this.electivesNeeded > 0;
      default: return false;
    }
  }
}

/**
 * Utility function to unify non-AP names.
 * Example: "Geometry, CP" → "Geometry", "English 9, Honors" → "English 9"
 * Does not touch “AP” courses.
 */
function unifyNonAPName(name) {
  if (name.includes("AP ")) {
    return name.trim();
  }
  return name
    .replace(", CP", "")
    .replace(", Honors", "")
    .replace("CP/Honors", "")
    .trim();
}

/**
 * We generate a raw map for course levels then build a unified courseLevelMap.
 * If multiple rawNames unify to the same key, we take the max level (or you could average).
 */
const rawCourseLevelMap = new Map([
  // math
  ["Algebra I", 4],
  ["Geometry, CP", 5],
  ["Geometry, Honors", 5],
  ["Algebra II", 5],
  ["Algebra 2, Honors", 5],
  ["Pre Calculus, CP", 6],
  ["Honors Precalculus", 6],
  ["AP Precalculus", 6],
  ["Calculus", 7],
  ["AP Calculus AB", 7],
  ["AP Calculus BC", 8],
  ["AP Statistics", 9],
  ["SAT Math (Fall)/SAT Math (Spring)", 4],

  // science
  ["Biology, CP", 3],
  ["Biology, Honors", 3],
  ["AP Biology", 4],
  ["Chemistry, CP", 3],
  ["Chemistry, Honors", 3],
  ["AP Chemistry", 4],
  ["Physics, CP/Honors", 3],
  ["AP Physics I", 4],
  ["AP Environmental Science", 4],

  // world lang
  ["Spanish I /Arabic I /Turkish I / Chinese I / French I (Independent Study with a Supervisor)", 1],
  ["Honors Spanish I", 2],
  ["Spanish II, Honors", 3],
  ["Spanish III, Honors", 4],
  ["Spanish IV, Honors", 5],

  // social
  ["US History, CP", 3],
  ["US History, Honors", 3],
  ["AP US History", 4],

  // cs
  ["Computer Programming I (Fall) / Computer Programming II (Spring)", 3],
  ["AP Computer Science A", 4],
  ["AP Computer Science Principles", 4],
]);

// Build the unified courseLevelMap:
const courseLevelMap = new Map();

for (const [rawName, lvl] of rawCourseLevelMap.entries()) {
  const unified = unifyNonAPName(rawName);
  const existing = courseLevelMap.get(unified);
  if (existing == null) {
    courseLevelMap.set(unified, lvl);
  } else {
    // If CP/Honors unify to the same key, pick the max
    courseLevelMap.set(unified, Math.max(existing, lvl));
  }
}

/**
 * We do the same for prerequisitesMap, unifying keys and prerequisite entries.
 * Example:
 *  - "Geometry, CP" and "Geometry, Honors" both become "Geometry"
 *  - Then "Algebra I" stays "Algebra I" because it doesn't have “, CP” or “, Honors”
 *  - AP courses remain as is.
 */
const rawPrerequisitesMap = new Map([
  // MATH
  ["Geometry, CP", ["Algebra I"]],
  ["Geometry, Honors", ["Algebra I"]],
  ["Algebra II", ["Algebra I"]],
  ["Algebra 2, Honors", ["Algebra I"]],
  ["Pre Calculus, CP", ["Algebra II", "Algebra 2, Honors"]],
  ["Honors Precalculus", ["Algebra II", "Algebra 2, Honors"]],
  ["AP Precalculus", ["Algebra II", "Algebra 2, Honors"]],
  ["Calculus", ["Pre Calculus, CP", "Honors Precalculus", "AP Precalculus"]],
  ["AP Calculus AB", ["Pre Calculus, CP", "Honors Precalculus", "AP Precalculus"]],
  ["AP Calculus BC", ["AP Calculus AB"]],
  ["AP Statistics", ["AP Calculus BC"]],

  // Science
  ["AP Biology", ["Biology, CP", "Biology, Honors"]],
  ["AP Chemistry", ["Chemistry, CP", "Chemistry, Honors"]],
  ["AP Physics I", ["Physics, CP/Honors"]],
  ["AP Environmental Science", ["Biology, CP", "Chemistry, CP"]],

  // CS
  ["AP Computer Science A", ["Computer Programming I (Fall) / Computer Programming II (Spring)"]],
  ["AP Computer Science Principles", ["Computer Programming I (Fall) / Computer Programming II (Spring)"]],

  // Social/Econ
  ["AP US History", ["US History, CP", "US History, Honors"]],

  // Language
  ["Spanish II, Honors", ["Spanish I"]],
  ["Spanish III, Honors", ["Spanish II, Honors"]],
  ["Spanish IV, Honors", ["Spanish III, Honors"]],
  ["Arabic II, CP", ["Arabic I"]],
  ["Arabic III & IV, Honors", ["Arabic II, CP"]],
]);

const prerequisitesMap = new Map();

// Function to unify each individual prerequisite name in the arrays
function unifyPrereqList(rawPrereqs) {
  return rawPrereqs.map((pr) => {
    // Some prerequisites have multiple slash options, e.g. "Physics, CP/Honors"
    // We'll unify each slice individually.
    const chunks = pr.split("/");
    return chunks
      .map((piece) => unifyNonAPName(piece.trim()))
      .join(" / ");
  });
}

for (const [rawKey, rawValues] of rawPrerequisitesMap.entries()) {
  const unifiedKey = unifyNonAPName(rawKey);
  const unifiedVals = unifyPrereqList(rawValues);
  // If we already have something for unifiedKey, merge them
  if (!prerequisitesMap.has(unifiedKey)) {
    prerequisitesMap.set(unifiedKey, unifiedVals);
  } else {
    // Merge arrays
    const oldArray = prerequisitesMap.get(unifiedKey);
    const newArray = [...oldArray, ...unifiedVals];
    prerequisitesMap.set(unifiedKey, newArray);
  }
}

// Conflict set:
const CONFLICT_BASES = new Set(["Biology", "Chemistry", "US History"]);

// ======================= 2) CORE LOGIC =======================
function initAllCourses() {
  const list = [];

  // Helper function to add a course. We unify the name right at creation.
  const helper = (originalName, gpa, diff, rel, period, minG, maxG, isAP) => {
    const unifiedName = unifyNonAPName(originalName);
    const cat = getCategoryByName(unifiedName);
    const prereq = prerequisitesMap.get(unifiedName) || [];
    const c = {
      name: unifiedName,
      category: cat,
      gpa,
      difficulty: diff,
      relevance: rel,
      prerequisites: prereq,
      period,
      gradeLevelMin: minG,
      gradeLevelMax: maxG,
      isAP,
    };
    list.push(c);
  };

  // ==================== Period 1 ====================
  helper("Biology, CP", 4.33, 4.5, 4.7, 1, 9, 12, false);
  helper("Geometry, Honors", 5.00, 2.6, 2.5, 1, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 4.6, 2.4, 1, 9, 12, false);
  helper("Chemistry, Honors", 5.00, 2.7, 2.6, 1, 9, 12, false);
  helper("Modern World History, CP", 4.33, 3.5, 4.3, 1, 9, 12, false);
  helper("Financial Literacy (Fall)/ Intro to Business (Spring)", 4.00, 4.3, 3.5, 1, 9, 12, false);
  helper("SAT English (Spring)", 4.00, 4.9, 3.7, 1, 9, 12, false);
  helper("SAT Math (Fall)/SAT Math (Spring)", 4.00, 4.6, 3.4, 1, 9, 12, false);
  helper("English 11, Honors", 5.00, 4.0, 4.6, 1, 11, 11, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.9, 3.1, 1, 9, 12, false);
  helper("Spanish IV, Honors", 5.00, 3.7, 4.7, 1, 9, 12, false);
  helper("Arabic III & IV, Honors", 5.00, 3.9, 4.8, 1, 9, 12, false);
  helper("Essay Writing for Seniors (Fall)", 4.00, 3.8, 4.5, 1, 12, 12, false);
  helper("AP Statistics", 5.33, 4.8, 5.0, 1, 10, 12, true);
  helper("Cybersecurity", 4.00, 4.5, 4.8, 1, 9, 12, false);

  // ==================== Period 2 ====================
  helper("Algebra I", 4.00, 3.2, 3.8, 2, 9, 12, false);
  helper("Geometry, CP", 4.33, 3.5, 4.0, 2, 9, 12, false);
  helper("Graphic Design - Full Year", 4.00, 3.9, 4.2, 2, 9, 12, false);
  helper("Modern World History, CP", 4.33, 4.0, 4.3, 2, 9, 12, false);
  helper("English 10, Honors", 5.00, 4.1, 4.7, 2, 10, 10, false);
  helper("Honors Precalculus", 5.00, 4.7, 5.0, 2, 9, 12, false);
  helper("Spanish III, Honors", 5.00, 3.6, 4.8, 2, 9, 12, false);
  helper("Anatomy and Physiology", 4.00, 4.5, 4.2, 2, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.0, 2.9, 2, 9, 12, false);
  helper("National & International Current Affairs (Fall) / Public Speaking (Spring)", 4.00, 3.7, 4.0, 2, 9, 12, false);
  helper("English 12, CP", 4.33, 4.2, 4.5, 2, 12, 12, false);
  helper("AP US History", 5.33, 4.9, 5.0, 2, 10, 12, true);
  helper("Broadcast Media Production", 4.00, 3.7, 4.0, 2, 9, 12, false);
  helper("Dynamic Programming", 4.00, 4.8, 5.0, 2, 9, 12, false);

  // ==================== Period 3 ====================
  helper("Spanish I /Arabic I /Turkish I / Chinese I / French I (Independent Study with a Supervisor)", 4.00, 3.2, 3.5, 3, 9, 12, false);
  helper("English 9, Honors", 5.00, 3.6, 4.5, 3, 9, 9, false);
  helper("Digital Visual Art (Fall) / Cultivating Creativity (Spring)", 4.00, 4.0, 3.7, 3, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.2, 3.0, 3, 9, 12, false);
  helper("English 10, CP", 4.33, 3.5, 4.0, 3, 10, 10, false);
  helper("AP Precalculus", 5.33, 4.8, 5.0, 3, 10, 12, true);
  helper("Chemistry, CP", 4.33, 3.5, 4.7, 3, 9, 12, false);
  helper("Web Development I (Fall)/Web Development II", 4.00, 4.6, 5.0, 3, 9, 12, false);
  helper("Sociology of the Future (Fall) / Global Issues (Spring)", 4.00, 3.8, 4.3, 3, 9, 12, false);
  helper("Pre Calculus, CP", 4.33, 4.0, 4.6, 3, 9, 12, false);
  helper("National & International Current Affairs (Fall) / Public Speaking (Spring)", 4.00, 3.7, 3.8, 3, 9, 12, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.8, 3.0, 3, 9, 12, false);
  helper("AP English Language & Composition", 5.33, 4.6, 5.0, 3, 11, 12, true);
  helper("Calculus", 4.00, 4.3, 4.7, 3, 9, 12, false);
  helper("AP Physics I", 5.33, 4.9, 5.0, 3, 10, 12, true);

  // ==================== Period 4 ====================
  helper("US History, CP", 4.33, 3.7, 4.2, 4, 9, 12, false);
  helper("Biology, Honors", 5.00, 4.2, 4.8, 4, 9, 12, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.9, 3.2, 4, 9, 12, false);
  helper("Spanish II, Honors", 5.00, 3.8, 4.7, 4, 9, 12, false);
  helper("Arabic II, CP", 4.33, 3.5, 4.0, 4, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.1, 3.0, 4, 9, 12, false);
  helper("English 11", 4.00, 3.9, 4.3, 4, 11, 11, false);
  helper("AP Computer Science A", 5.33, 4.9, 5.0, 4, 10, 12, true);
  helper("AP Chemistry", 5.33, 5.0, 5.0, 4, 10, 12, true);
  helper("Financial Literacy (Fall)/ Intro to Business (Spring)", 4.00, 4.1, 4.3, 4, 9, 12, false);
  helper("Juniors Only with cumulative unweighted GPA 3.75 and above", 4.00, 4.0, 4.0, 4, 11, 11, false);
  helper("Seniors Only Independent Online Courses with a Supervisor (Fall) / Independent Online Courses with a Supervisor (Spring)", 4.00, 3.8, 4.2, 4, 12, 12, false);
  helper("Intro to World Religions, Mythology, and Belief Systems I (Fall) / Intro to World Religions, Mythology, and Belief", 4.00, 3.7, 4.0, 4, 9, 12, false);
  helper("Sociology (Fall)/Anthropology(Spring)", 4.00, 4.0, 4.5, 4, 9, 12, false);

  // ==================== Period 5 ====================
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.8, 3.2, 5, 9, 12, false);
  helper("English 9, Honors", 5.00, 3.5, 4.6, 5, 9, 9, false);
  helper("Pencil and Ink Illustration (Fall) / Drawing and Painting (Spring)", 4.00, 4.0, 3.5, 5, 9, 12, false);
  helper("US History, Honors", 5.00, 4.4, 5.0, 5, 9, 12, false);
  helper("Chemistry, CP", 4.33, 3.9, 4.5, 5, 9, 12, false);
  helper("Computer Programming I (Fall) / Computer Programming II (Spring)", 4.00, 4.7, 5.0, 5, 9, 12, false);
  helper("AP Biology", 5.33, 4.9, 5.0, 5, 10, 12, true);
  helper("AP Psychology", 5.33, 4.8, 5.0, 5, 10, 12, true);
  helper("Physics, CP/Honors", 5.00, 4.5, 4.9, 5, 9, 12, false);
  helper("AP Comparative Government and Politics", 5.33, 5.0, 5.0, 5, 10, 12, true);
  helper("Entrepreneurship / Marketing", 4.00, 4.2, 4.7, 5, 9, 12, false);
  helper("Pre Calculus, CP", 4.33, 4.1, 4.6, 5, 9, 12, false);
  helper("Calculus", 4.00, 4.5, 4.7, 5, 9, 12, false);
  helper("AP Calculus AB", 5.33, 4.9, 5.0, 5, 10, 12, true);
  helper("Principles of Business (Fall)/ Project Management (Spring)", 4.00, 4.3, 4.6, 5, 9, 12, false);

  // ==================== Period 7 ====================
  helper("English 9, CP", 4.33, 3.5, 4.0, 7, 9, 9, false);
  helper("US History, Honors", 5.00, 4.4, 5.0, 7, 9, 12, false);
  helper("Biology, Honors", 5.00, 4.3, 4.8, 7, 9, 12, false);
  helper("Algebra II", 4.00, 4.0, 4.3, 7, 9, 12, false);
  helper("Modern World History, Honors", 5.00, 4.1, 4.8, 7, 9, 12, false);
  helper("Pencil and Ink Illustration (Fall) / Drawing and Painting (Spring)", 4.00, 3.5, 3.6, 7, 9, 12, false);
  helper("English 10, CP", 4.33, 3.7, 4.2, 7, 10, 10, false);
  helper("AP US Government and Politics", 5.33, 4.9, 5.0, 7, 10, 12, true);
  helper("AP Macroeconomics", 5.33, 5.0, 5.0, 7, 10, 12, true);
  helper("AP Computer Science Principles", 5.33, 4.7, 5.0, 7, 10, 12, true);
  helper("Principles of Engineering (Fall)\nArchitectural CAD (Spring)", 4.00, 4.5, 4.8, 7, 9, 12, false);
  helper("Environmental Science", 4.00, 3.8, 4.6, 7, 9, 12, false);
  helper("English 12, Honors", 5.00, 4.2, 4.8, 7, 12, 12, false);
  helper("Honors Probability & Statistics", 5.00, 4.5, 4.6, 7, 9, 12, false); // Note: levelMap not configured

  // ==================== Period 8 ====================
  helper("Digital Visual Art (Fall) / Animated Thinking (Spring)", 4.00, 3.9, 3.7, 8, 9, 12, false);
  helper("Instrumental Music I (Fall) / Instrumental Music II(Spring)", 4.00, 3.2, 3.0, 8, 9, 12, false);
  helper("Honors Spanish I", 5.00, 3.8, 4.5, 8, 9, 12, false);
  helper("Geometry, CP", 4.33, 3.5, 4.0, 8, 9, 12, false);
  helper("Algebra 2, Honors", 5.00, 4.5, 4.7, 8, 9, 12, false);
  helper("PE/Health (Fall) / PE/Health (Spring)", 4.00, 2.8, 3.2, 8, 9, 12, false);
  helper("Cultural Studies I/ Cultural Studies II", 4.00, 3.7, 4.0, 8, 9, 12, false);
  helper("Forensic Science (Fall)/ Introduction to Organic Chemistry (Spring)", 4.00, 4.4, 4.5, 8, 9, 12, false);
  helper("AP European History", 5.33, 4.8, 5.0, 8, 10, 12, true);
  helper("English 11, Honors", 5.00, 4.0, 4.6, 8, 11, 11, false);
  helper("AP Microeconomics", 5.33, 5.0, 5.0, 8, 10, 12, true);
  helper("AP Calculus BC", 5.33, 5.0, 5.0, 8, 10, 12, true);
  helper("English 12, Honors", 5.00, 4.3, 4.8, 8, 12, 12, false);

  return list;
}

// getCategoryByName => same logic, but it will see the unified name now
function getCategoryByName(name) {
  if (
    name.includes("English 9") ||
    name.includes("English 10") ||
    name.includes("English 11") ||
    name.includes("English 12") ||
    name.includes("AP English Language") ||
    name.includes("Essay Writing for Seniors") ||
    name.includes("SAT English")
  ) {
    return CourseCategory.ENGLISH;
  }
  if (
    name.includes("Algebra I") ||
    name.includes("Algebra II") ||
    name.includes("Algebra 2") ||
    name.includes("Geometry") ||
    name.includes("Pre Calculus") ||
    name.includes("Precalculus") ||
    name.includes("Calculus") ||
    name.includes("Statistics") ||
    name.includes("SAT Math")
  ) {
    return CourseCategory.MATH;
  }
  if (
    name.includes("Biology") ||
    name.includes("Chemistry") ||
    name.includes("Physics") ||
    name.includes("Physiology") ||
    name.includes("Environmental Science") ||
    name.includes("Forensic Science") ||
    name.includes("Organic Chemistry")
  ) {
    return CourseCategory.SCIENCE;
  }
  if (
    name.includes("World History") ||
    name.includes("US History") ||
    name.includes("Government") ||
    name.includes("Politics") ||
    name.includes("Economics") ||
    name.includes("Sociology") ||
    name.includes("Global Issues") ||
    name.includes("Mythology") ||
    name.includes("Cultural Studies") ||
    name.includes("Psychology")
  ) {
    return CourseCategory.SOCIAL_STUDIES;
  }
  if (
    name.includes("Financial Literacy") ||
    name.includes("Business") ||
    name.includes("Marketing") ||
    name.includes("Entrepreneurship")
  ) {
    return CourseCategory.FINANCIAL;
  }
  if (name.includes("PE/Health")) {
    return CourseCategory.PE_HEALTH;
  }
  if (
    name.includes("Instrumental Music") ||
    name.includes("Pencil and Ink Illustration") ||
    name.includes("Drawing and Painting") ||
    name.includes("Digital Visual Art") ||
    name.includes("Cultivating Creativity") ||
    name.includes("Animated Thinking")
  ) {
    return CourseCategory.VPA;
  }
  if (
    name.includes("Spanish") ||
    name.includes("Arabic") ||
    name.includes("Turkish") ||
    name.includes("Chinese") ||
    name.includes("French")
  ) {
    return CourseCategory.WL;
  }
  if (
    name.includes("National & International Current Affairs") ||
    name.includes("Public Speaking") ||
    name.includes("Graphic Design") ||
    name.includes("Cybersecurity") ||
    name.includes("Web Development") ||
    name.includes("Computer Programming") ||
    name.includes("AP Computer Science") ||
    name.includes("Dynamic Programming") ||
    name.includes("Principles of Engineering") ||
    name.includes("Architectural CAD")
  ) {
    return CourseCategory.LIFE_CAREERS;
  }
  if (
    name.includes("Broadcast Media Production") ||
    name.includes("Juniors Only") ||
    name.includes("Seniors Only")
  ) {
    return CourseCategory.ELECTIVES;
  }
  return CourseCategory.ELECTIVES;
}

/**
 * Return a “base” like "Biology" or "US History" used for conflict detection.
 * Because we’ve already stripped “, CP” and “, Honors,”
 * your checks become simpler for non-AP courses.
 */
function getBaseCourseName(name) {
  return name
    .replace("AP ", "")
    .trim();
}

/**
 * We use our unified courseLevelMap to look up level.
 */
function getLevel(courseName) {
  return courseLevelMap.get(courseName) || 0;
}

/**
 * Are prerequisites met now uses the new (unified) name in prerequisitesMap.
 */
function arePrerequisitesMet(course, completedSet) {
  const prereqs = course.prerequisites || [];
  if (prereqs.length === 0) return true;

  const isMathCourse = course.category === CourseCategory.MATH;

  // OR logic
  let hasAnyPrereqSatisfied = false;
  for (const pr of prereqs) {
    // "Geometry / Algebra II" might have slash. We only need one to be satisfied.
    const multipleOptions = pr.split("/");
    let thisLineMet = false;
    for (const singleOpt of multipleOptions) {
      const so = singleOpt.trim();
      if (isMathCourse) {
        // math => same category + level >= needed
        const needLvl = getLevel(so);
        const needCat = getCategoryByName(so);
        for (const comp of completedSet) {
          const compLvl = getLevel(comp);
          const compCat = getCategoryByName(comp);
          if (compCat === needCat && compLvl >= needLvl) {
            thisLineMet = true;
            break;
          }
        }
      } else {
        // non-math => exact name match
        // (We are storing unified names in completedSet.)
        for (const comp of completedSet) {
          if (comp.toLowerCase() === so.toLowerCase()) {
            thisLineMet = true;
            break;
          }
        }
      }
      if (thisLineMet) break;
    }
    if (thisLineMet) {
      hasAnyPrereqSatisfied = true;
      break;
    }
  }
  return hasAnyPrereqSatisfied;
}

function getNonMathCategoryBase(courseName) {
  if (courseName.includes("Biology")) return "Biology";
  if (courseName.includes("Chemistry")) return "Chemistry";
  if (courseName.includes("Physics")) return "Physics";
  if (
    courseName.includes("Spanish") ||
    courseName.includes("Arabic") ||
    courseName.includes("Turkish") ||
    courseName.includes("Chinese") ||
    courseName.includes("French")
  ) {
    return "WL";
  }
  if (courseName.includes("US History")) return "USHistory";
  if (
    courseName.includes("Computer Programming") ||
    courseName.includes("Computer Science") ||
    courseName.includes("Web Development")
  ) {
    return "CS";
  }
  return null;
}

/**
 * Filter out courses that are either completed, or don’t match grade, or for which
 * prerequisites aren’t met, or are not strictly higher-level than what the student already has.
 */
function filterCourses(all, completedNames, grade, req, completedObjs) {
  const completedSet = new Set(completedNames);

  // Track if user has already done certain “base” courses
  const completedBasesForConflict = new Set();
  for (const cmpl of completedNames) {
    if (cmpl.startsWith("AP ")) continue; // skip AP from base-conflict blocking
    const base = getBaseCourseName(cmpl);
    if (CONFLICT_BASES.has(base)) {
      completedBasesForConflict.add(base);
    }
  }

  // highest math level seen in completed
  let highestMathLevel = 0;
  for (const cmpl of completedNames) {
    const cat = getCategoryByName(cmpl);
    if (cat === CourseCategory.MATH) {
      const lvl = getLevel(cmpl);
      if (lvl > highestMathLevel) highestMathLevel = lvl;
    }
  }

  // track highest for non-math categories with a “base”
  const highestNonMathLevelMap = {};
  for (const cmpl of completedNames) {
    const nm = getNonMathCategoryBase(cmpl);
    if (nm) {
      const lvl = getLevel(cmpl);
      highestNonMathLevelMap[nm] = Math.max(highestNonMathLevelMap[nm] || 0, lvl);
    }
  }

  const res = [];
  for (const c of all) {
    // skip if already completed
    if (completedSet.has(c.name)) continue;

    // skip if conflict base is in completed
    if (!c.isAP) {
      const base = getBaseCourseName(c.name);
      if (CONFLICT_BASES.has(base) && completedBasesForConflict.has(base)) {
        continue;
      }
    }

    // grade check
    if (grade < c.gradeLevelMin || grade > c.gradeLevelMax) continue;

    // prereqs?
    if (!arePrerequisitesMet(c, completedSet)) continue;

    // MATH => must be strictly higher than highest completed
    if (c.category === CourseCategory.MATH) {
      const cLevel = getLevel(c.name);
      if (cLevel <= highestMathLevel) continue;
    } else {
      const nm = getNonMathCategoryBase(c.name);
      if (nm) {
        const cLevel = getLevel(c.name);
        const maxLvl = highestNonMathLevelMap[nm] || 0;
        if (cLevel <= maxLvl) continue;
      }
    }

    res.push(c);
  }
  return res;
}

function mergePlansByPeriod(plans) {
  // Group by mathEnglishCombo
  const groups = new Map();
  for (const plan of plans) {
    const key = plan.mathEnglishCombo;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(plan);
  }

  const mergedResults = [];
  for (const [combo, comboPlans] of groups.entries()) {
    const periodMap = new Map();
    for (const plan of comboPlans) {
      for (const p of plan.periods) {
        if (!periodMap.has(p.period)) {
          periodMap.set(p.period, new Set());
        }
        for (const cname of p.courseNames) {
          periodMap.get(p.period).add(cname);
        }
      }
    }

    const mergedPeriods = [];
    const sortedPeriods = Array.from(periodMap.keys()).sort((a, b) => a - b);
    for (const period of sortedPeriods) {
      const courseArr = Array.from(periodMap.get(period)).sort();
      mergedPeriods.push({ period, courseNames: courseArr });
    }

    mergedResults.push({
      mathEnglishCombo: combo,
      periods: mergedPeriods,
    });
  }

  return mergedResults;
}

function generateAllPossiblePlans(periodMap, grade) {
  if (!periodMap || Object.keys(periodMap).length === 0) {
    return [];
  }
  const periods = Object.keys(periodMap)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);

  const result = [];
  function backtrack(idx, current) {
    if (idx === periods.length) {
      result.push([...current]);
      return;
    }
    const p = periods[idx];
    const candidates = periodMap[p] || [];
    if (candidates.length === 0) return;
    for (const c of candidates) {
      current.push(c);
      if (partialCheckPlan(current, grade, idx, periods, periodMap)) {
        backtrack(idx + 1, current);
      }
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}

function partialCheckPlan(plan, grade, idx, periods, periodMap) {
  if (!checkNoDuplicateCourse(plan)) return false;
  if (!checkCourseLevelVariants(plan)) return false;
  // If grade=10 => must have "English 10" somewhere in final
  if (grade === 10) {
    const hasEnglish10 = plan.some(
      (c) => c.category === CourseCategory.ENGLISH && c.name.includes("English 10"),
    );
    if (!hasEnglish10) {
      let possibleInFuture = false;
      for (let i = idx + 1; i < periods.length; i++) {
        const p = periods[i];
        const future = periodMap[p] || [];
        if (future.some(
          (cc) => cc.category === CourseCategory.ENGLISH && cc.name.includes("English 10"),
        )) {
          possibleInFuture = true;
          break;
        }
      }
      if (!possibleInFuture) return false;
    }
  }
  return true;
}

function isFeasible(plan, grade) {
  if (!checkNoDuplicateCourse(plan)) return false;
  if (!checkCourseLevelVariants(plan)) return false;

  // exactly 1 MATH + exactly 1 ENGLISH
  const mathList = plan.filter((c) => c.category === CourseCategory.MATH);
  const engList = plan.filter((c) => c.category === CourseCategory.ENGLISH);
  if (mathList.length !== 1) return false;
  if (engList.length !== 1) return false;

  // correct grade-level English
  let hasEnglishForGrade = false;
  for (const c of plan) {
    if (c.category === CourseCategory.ENGLISH) {
      if (grade === 9 && c.name.includes("English 9")) hasEnglishForGrade = true;
      if (grade === 10 && c.name.includes("English 10")) hasEnglishForGrade = true;
      if (grade === 11 && (c.name.includes("English 11") || c.name.includes("AP English"))) {
        hasEnglishForGrade = true;
      }
      if (grade === 12 && (c.name.includes("English 12") || c.name.includes("AP English"))) {
        hasEnglishForGrade = true;
      }
    }
  }
  if (!hasEnglishForGrade) return false;

  return true;
}

function checkNoDuplicateCourse(plan) {
  const bases = new Set();
  for (const c of plan) {
    if (c.category === CourseCategory.FREE_PERIOD) continue;
    const base = getBaseCourseName(c.name);
    if (bases.has(base)) return false;
    bases.add(base);
  }
  return true;
}

function checkCourseLevelVariants(plan) {
  const catMaxLvl = new Map();
  for (const c of plan) {
    if (c.category === CourseCategory.FREE_PERIOD) continue;
    const lvl = getLevel(c.name);
    const old = catMaxLvl.get(c.category) || 0;
    if (lvl > old) catMaxLvl.set(c.category, lvl);
  }
  for (const c of plan) {
    if (c.category === CourseCategory.FREE_PERIOD) continue;
    const lvl = getLevel(c.name);
    const maxLvl = catMaxLvl.get(c.category) || 0;
    if (lvl < maxLvl) return false;
  }
  return true;
}

function averageGPA(plan) {
  let sum = 0;
  let count = 0;
  for (const c of plan) {
    if (c.category !== CourseCategory.FREE_PERIOD) {
      sum += c.gpa;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

function averageDifficulty(plan) {
  let sum = 0;
  let count = 0;
  for (const c of plan) {
    if (c.category !== CourseCategory.FREE_PERIOD) {
      sum += c.difficulty;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

function getHighestGPAPlans(feasible) {
  let maxGPA = -1;
  for (const plan of feasible) {
    const g = averageGPA(plan);
    if (g > maxGPA) maxGPA = g;
  }
  return feasible.filter((p) => Math.abs(averageGPA(p) - maxGPA) < 1e-9);
}

function getEasiestPlans(feasible) {
  let minDiff = Infinity;
  for (const plan of feasible) {
    const d = averageDifficulty(plan);
    if (d < minDiff) minDiff = d;
  }
  return feasible.filter((p) => Math.abs(averageDifficulty(p) - minDiff) < 1e-9);
}

/**
 * "Most relevant plan": for each period, choose the highest relevance courses that match the major.
 * This yields a single “plan” in a period-by-period sense.
 */
function getMostRelevantPlan(feasible, direction) {
  const periodMap = {};
  for (const plan of feasible) {
    for (const c of plan) {
      if (!periodMap[c.period]) periodMap[c.period] = new Set();
      periodMap[c.period].add(c);
    }
  }
  const result = [];
  const sortedPeriods = Object.keys(periodMap).map((x) => parseInt(x, 10)).sort((a, b) => a - b);
  for (const p of sortedPeriods) {
    let candidates = Array.from(periodMap[p]);
    // remove FREE_PERIOD
    candidates = candidates.filter((c) => c.category !== CourseCategory.FREE_PERIOD);
    if (candidates.length === 0) {
      result.push({ period: p, courseNames: ["<<<FREE>>>"] });
      continue;
    }
    // keep only those in major
    candidates = candidates.filter((c) => isCourseInMajor(direction, c));
    if (candidates.length === 0) {
      result.push({ period: p, courseNames: ["<<<FREE>>>"] });
      continue;
    }
    let maxRel = -1;
    for (const c of candidates) {
      if (c.relevance > maxRel) maxRel = c.relevance;
    }
    const best = candidates.filter((cc) => Math.abs(cc.relevance - maxRel) < 1e-9);
    const names = best.map((b) => b.name);
    result.push({ period: p, courseNames: names });
  }
  return result;
}

function isCourseInMajor(directionStr, c) {
  switch (directionStr) {
    case "STEM":
      return (
        c.category === CourseCategory.MATH ||
        c.category === CourseCategory.SCIENCE ||
        (c.category === CourseCategory.LIFE_CAREERS &&
          (c.name.includes("Computer") || c.name.includes("Programming")))
      );
    case "MEDICAL":
      if (c.category === CourseCategory.SCIENCE) return true;
      if (c.name.includes("Physiology") || c.name.includes("Psychology")) return true;
      return false;
    case "BUSINESS":
      if (c.category === CourseCategory.FINANCIAL) return true;
      if (
        c.name.includes("Business") ||
        c.name.includes("Marketing") ||
        c.name.includes("Economics")
      ) {
        return true;
      }
      return false;
    case "SOCIAL_SCIENCE":
      if (c.category === CourseCategory.SOCIAL_STUDIES) return true;
      if (
        c.name.includes("Sociology") ||
        c.name.includes("Anthropology") ||
        c.name.includes("Psychology")
      ) {
        return true;
      }
      return false;
    case "ENVIRONMENTAL":
      if (c.name.includes("Environmental")) return true;
      if (c.category === CourseCategory.SCIENCE && c.name.includes("Chemistry")) return true;
      return false;
    case "CS_DATA":
      if (
        c.category === CourseCategory.LIFE_CAREERS &&
        (c.name.includes("Computer") || c.name.includes("Web") || c.name.includes("Programming"))
      ) {
        return true;
      }
      if (
        c.category === CourseCategory.MATH &&
        (c.name.includes("Calculus") || c.name.includes("Statistics"))
      ) {
        return true;
      }
      return false;
    case "LANGUAGE_CULTURE":
      if (c.category === CourseCategory.WL) return true;
      if (c.category === CourseCategory.ENGLISH && c.name.includes("English")) return true;
      if (
        c.category === CourseCategory.SOCIAL_STUDIES &&
        (c.name.includes("History") || c.name.includes("Culture"))
      ) {
        return true;
      }
      return false;
    case "LAW_POLICY":
      if (
        c.category === CourseCategory.SOCIAL_STUDIES &&
        (c.name.includes("Government") || c.name.includes("Politics") || c.name.includes("History"))
      ) {
        return true;
      }
      if (c.name.includes("Economics") || c.name.includes("Law")) return true;
      return false;
    default:
      return false;
  }
}

/** Transform an array of plan arrays into JSON-friendly plan objects. */
function transformPlanList(planList) {
  const result = [];
  for (const plan of planList) {
    const periods = new Set(plan.map((c) => c.period));
    const sortedPeriods = Array.from(periods).sort((a, b) => a - b);
    const periodOutputs = [];
    for (const p of sortedPeriods) {
      const coursesInPeriod = plan.filter((c) => c.period === p).map((c) => c.name);
      periodOutputs.push({ period: p, courseNames: coursesInPeriod });
    }
    const math = plan.find((c) => c.category === CourseCategory.MATH) || { name: "None" };
    const eng = plan.find((c) => c.category === CourseCategory.ENGLISH) || { name: "None" };
    const comboName = `${math.name} & ${eng.name}`;
    result.push({
      mathEnglishCombo: comboName,
      periods: periodOutputs,
    });
  }
  return result;
}

// ======================= 3) BUILD THE "ALL_COURSES" ONCE =======================
const ALL = initAllCourses();

// ======================= 4) MAIN ENDPOINT: /api/curriculum/plan =======================
app.post("/api/curriculum/plan", (req, res) => {
  const { grade, completedCourses, majorDirectionCode } = req.body;

  // 1) unify all completedCourses the same way
  const completedUnified = (completedCourses || []).map((n) => unifyNonAPName(n));
  // find the Course objects for them
  const completedCourseObjs = ALL.filter((c) => completedUnified.includes(c.name));

  // 2) update requirements
  const reqs = new GraduationRequirements();
  reqs.updateRequirements(completedCourseObjs);

  // 3) how many PE Health completed
  const completedPECount = completedCourseObjs.filter((c) => c.category === CourseCategory.PE_HEALTH).length;

  // 4) filter courses
  const filtered = filterCourses(ALL, completedUnified, grade || 9, reqs, completedCourseObjs);
  // skip more PE if user already has 2
  const finalFiltered = filtered.filter((c) => {
    if (c.category === CourseCategory.PE_HEALTH) {
      return completedPECount < 2;
    }
    return true;
  });

  // group by period -> all possible combos
  const periodMap = {};
  for (const c of finalFiltered) {
    if (!periodMap[c.period]) {
      periodMap[c.period] = [];
    }
    periodMap[c.period].push(c);
  }

  const allPlans = generateAllPossiblePlans(periodMap, grade);
  const feasiblePlans = [];
  for (const plan of allPlans) {
    if (isFeasible(plan, grade)) {
      feasiblePlans.push(plan);
    }
  }

  if (feasiblePlans.length === 0) {
    return res.json({
      highestGpaPlans: [],
      mostRelevantPlan: [],
      easiestPlans: [],
    });
  }

  const directionStr = fromCode(majorDirectionCode || 1);

  const highestGPA = getHighestGPAPlans(feasiblePlans);
  const easiest = getEasiestPlans(feasiblePlans);
  const mostRelevant = getMostRelevantPlan(feasiblePlans, directionStr);

  const highestGpaPlansRaw = transformPlanList(highestGPA);
  const highestGpaPlans = mergePlansByPeriod(highestGpaPlansRaw);
  const easiestPlansRaw = transformPlanList(easiest);
  const easiestPlans = mergePlansByPeriod(easiestPlansRaw);

  return res.json({
    highestGpaPlans,
    mostRelevantPlan: mostRelevant,
    easiestPlans,
  });
});

// ======================= 5) SERVE REACT IN PRODUCTION =======================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });
}

// ======================= 6) START SERVER =======================
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});