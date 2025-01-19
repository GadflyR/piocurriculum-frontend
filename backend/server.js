/* eslint-disable no-case-declarations */

const cors = require('cors');
const bodyParser = require('body-parser');
const fileURLToPath = require('url');
const express = require('express');
const path = require('path');
const app = express();
// If using ESM, replicate __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

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
  // Java's "MajorDirection.fromCode(...)"
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

// GraduationRequirements, simplified as an object with updateRequirements
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

// Data structures from version10
const courseLevelMap = new Map([
  // MATH
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

  // Non-math examples
  ["Biology, CP", 3],
  ["Biology, Honors", 3],
  ["AP Biology", 4],
  ["Chemistry, CP", 3],
  ["Chemistry, Honors", 3],
  ["AP Chemistry", 4],
  ["Physics, CP/Honors", 3],
  ["AP Physics I", 4],
  ["Spanish I /Arabic I /Turkish I / Chinese I / French I (Independent Study with a Supervisor)", 1],
  ["Honors Spanish I", 2],
  ["Spanish II, Honors", 3],
  ["Spanish III, Honors", 4],
  ["Spanish IV, Honors", 5],
  ["US History, CP", 3],
  ["US History, Honors", 3],
  ["AP US History", 4],
  ["Computer Programming I (Fall) / Computer Programming II (Spring)", 3],
  ["AP Computer Science A", 4],
  ["AP Computer Science Principles", 4],
]);

// prerequisitesMap
const prerequisitesMap = new Map([
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

const CONFLICT_BASES = new Set(["Biology", "Chemistry", "US History"]);

// ======================= 2) CORE LOGIC =======================

/**
 * We'll define a "Course" object in JS, matching your Java fields:
 * {
 *   name, category, gpa, difficulty, relevance, prerequisites (string[]),
 *   period, gradeLevelMin, gradeLevelMax, isAP
 * }
 */

function initAllCourses() {
  const list = [];
  
  // Helper function to add courses
  const helper = (name, gpa, diff, rel, period, minG, maxG, ap) => {
    const cat = getCategoryByName(name);
    const prereq = prerequisitesMap.get(name) || [];
    const c = {
      name,
      category: cat,
      gpa,
      difficulty: diff,
      relevance: rel,
      prerequisites: prereq,
      period,
      gradeLevelMin: minG,
      gradeLevelMax: maxG,
      isAP: ap,
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

// getCategoryByName => from version10 (unchanged)
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
    name.includes("PreCalculus") ||
    name.includes("AP Precalculus") ||
    name.includes("Honors Precalculus") ||
    name.includes("Calculus") ||
    name.includes("AP Calculus") ||
    name.includes("Statistics") ||
    name.includes("Probability & Statistics") ||
    name.includes("SAT Math")
  ) {
    return CourseCategory.MATH;
  }
  if (
    name.includes("Biology") ||
    name.includes("Chemistry") ||
    name.includes("Physics") ||
    name.includes("Anatomy and Physiology") ||
    name.includes("Environmental Science") ||
    name.includes("Forensic Science") ||
    name.includes("Organic Chemistry")
  ) {
    return CourseCategory.SCIENCE;
  }
  if (
    name.includes("World History") ||
    name.includes("US History") ||
    name.includes("AP US Government") ||
    name.includes("AP US History") ||
    name.includes("AP Comparative Government") ||
    name.includes("AP European History") ||
    name.includes("AP Macroeconomics") ||
    name.includes("AP Microeconomics") ||
    name.includes("AP Psychology") ||
    name.includes("Sociology") ||
    name.includes("Global Issues") ||
    name.includes("Intro to World Religions") ||
    name.includes("Mythology") ||
    name.includes("Cultural Studies")
  ) {
    return CourseCategory.SOCIAL_STUDIES;
  }
  if (
    name.includes("Financial Literacy") ||
    name.includes("Intro to Business") ||
    name.includes("Principles of Business") ||
    name.includes("Project Management") ||
    name.includes("Entrepreneurship") ||
    name.includes("Marketing")
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
    name.includes("Seniors Only Independent Online Courses")
  ) {
    return CourseCategory.ELECTIVES;
  }
  return CourseCategory.ELECTIVES;
}

function getBaseCourseName(name) {
  return name
    .replaceAll("(Fall)", "")
    .replaceAll("(Spring)", "")
    .replaceAll("/Fall", "")
    .replaceAll("/Spring", "")
    .replaceAll("AP ", "")
    .replaceAll(", CP", "")
    .replaceAll(", Honors", "")
    .trim();
}

function getLevel(courseName) {
  return courseLevelMap.get(courseName) || 0;
}

function arePrerequisitesMet(course, completedSet) {
  const prereqs = prerequisitesMap.get(course.name) || [];
  if (prereqs.length === 0) return true;

  const isMathCourse = course.category === CourseCategory.MATH;

  // OR logic
  let hasAnyPrereqSatisfied = false;
  for (const pr of prereqs) {
    const multipleOptions = pr.split("/");
    let thisLineMet = false;
    for (const singleOpt of multipleOptions) {
      const so = singleOpt.trim();
      if (isMathCourse) {
        // math => same category + level >= needed
        const needLvl = getLevel(so);
        const needCat = getCategoryByName(so);
        // check if any completed matches this
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
        for (const comp of completedSet) {
          if (comp.trim().toLowerCase() === so.toLowerCase()) {
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

// 6-non-math categories
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
    courseName.includes("AP Computer Science") ||
    courseName.includes("Web Development")
  ) {
    return "CS";
  }
  return null;
}

function filterCourses(all, completedNames, grade, req, completedObjs) {
  // replicate your advanced filter logic
  const completedSet = new Set(completedNames);

  // collect completedBasesForConflict
  const completedBasesForConflict = new Set();
  for (const cmpl of completedNames) {
    if (cmpl.includes("AP ")) continue;
    const base = getBaseCourseName(cmpl);
    if (CONFLICT_BASES.has(base)) {
      completedBasesForConflict.add(base);
    }
  }

  // track highestMathLevel
  const highestMathLevelMap = new Map();
  for (const cmpl of completedNames) {
    const cat = getCategoryByName(cmpl);
    if (cat === CourseCategory.MATH) {
      const lvl = getLevel(cmpl);
      const old = highestMathLevelMap.get(cat) || 0;
      if (lvl > old) highestMathLevelMap.set(cat, lvl);
    }
  }

  // track highestNonMath
  const highestNonMathLevelMap = {};
  for (const cmpl of completedNames) {
    const nm = getNonMathCategoryBase(cmpl);
    if (nm) {
      const lvl = getLevel(cmpl);
      if (!(nm in highestNonMathLevelMap)) {
        highestNonMathLevelMap[nm] = lvl;
      } else {
        highestNonMathLevelMap[nm] = Math.max(highestNonMathLevelMap[nm], lvl);
      }
    }
  }

  const res = [];
  for (const c of all) {
    // 1) skip if completed
    if (completedSet.has(c.name)) continue;
    // 1.1) CP/Honors conflict
    if (!c.isAP) {
      const base = getBaseCourseName(c.name);
      if (CONFLICT_BASES.has(base) && completedBasesForConflict.has(base)) {
        continue;
      }
    }
    // 2) grade check
    if (grade < c.gradeLevelMin || grade > c.gradeLevelMax) continue;
    // 3) prereqs
    if (!arePrerequisitesMet(c, completedSet)) continue;
    // 4) MATH => only allow higher
    if (c.category === CourseCategory.MATH) {
      const cLevel = getLevel(c.name);
      const maxLvl = highestMathLevelMap.get(CourseCategory.MATH) || 0;
      if (cLevel <= maxLvl) continue;
    } else {
      // 6 big nonmath => skip if level <= completed
      const nm = getNonMathCategoryBase(c.name);
      if (nm) {
        const cLevel = getLevel(c.name);
        const maxLvl = highestNonMathLevelMap[nm] || 0;
        if (cLevel <= maxLvl) continue;
      }
    }
    // no advanced "already fulfilled category" logic

    res.push(c);
  }

  return res;
}

function generateAllPossiblePlans(periodMap, grade) {
  if (!periodMap || Object.keys(periodMap).length === 0) {
    return [];
  }
  const periods = Object.keys(periodMap).map((n) => parseInt(n, 10)).sort((a, b) => a - b);

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
  // if grade ==10 => must have English 10
  if (grade === 10) {
    const hasEnglish10 = plan.some(
      (c) => c.category === CourseCategory.ENGLISH && c.name.includes("English 10"),
    );
    if (!hasEnglish10) {
      // see if possible in future
      let possibleInFuture = false;
      for (let i = idx + 1; i < periods.length; i++) {
        const p = periods[i];
        const future = periodMap[p] || [];
        if (
          future.some(
            (cc) => cc.category === CourseCategory.ENGLISH && cc.name.includes("English 10"),
          )
        ) {
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

  // check correct grade-level english
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
  // For each category, we can only have the highest-level item. 
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

function printAPRecommendation(direction) {
  // (In Node, we won't literally "print" to console for the user. 
  //  We can store suggestions or just skip.)
}

// Summaries
function getHighestGPAPlans(feasible) {
  let maxGPA = -1;
  for (const plan of feasible) {
    const g = averageGPA(plan);
    if (g > maxGPA) maxGPA = g;
  }
  const topPlans = feasible.filter((p) => Math.abs(averageGPA(p) - maxGPA) < 1e-9);
  return topPlans;
}

function getEasiestPlans(feasible) {
  let minDiff = Infinity;
  for (const plan of feasible) {
    const d = averageDifficulty(plan);
    if (d < minDiff) minDiff = d;
  }
  const easiest = feasible.filter((p) => Math.abs(averageDifficulty(p) - minDiff) < 1e-9);
  return easiest;
}

function getMostRelevantPlan(feasible, direction) {
  // replicate "printMostRelevantPlan"
  // We pick for each period from all feasible plans, 
  // then filter by isCourseInMajor => highest relevance
  const periodMap = {};
  for (const plan of feasible) {
    for (const c of plan) {
      if (!periodMap[c.period]) periodMap[c.period] = new Set();
      periodMap[c.period].add(c);
    }
  }
  // build array
  const result = [];
  for (const p of Object.keys(periodMap).map((x) => parseInt(x, 10)).sort((a, b) => a - b)) {
    let cands = Array.from(periodMap[p]);
    // remove FREE_PERIOD
    cands = cands.filter((c) => c.category !== CourseCategory.FREE_PERIOD);
    if (cands.length === 0) {
      result.push({ period: p, courseNames: ["<<<FREE>>>"] });
      continue;
    }
    // keep only in major
    cands = cands.filter((c) => isCourseInMajor(direction, c));
    if (cands.length === 0) {
      result.push({ period: p, courseNames: ["<<<FREE>>>"] });
      continue;
    }
    let maxRel = -1;
    for (const c of cands) {
      if (c.relevance > maxRel) maxRel = c.relevance;
    }
    const best = cands.filter((cc) => Math.abs(cc.relevance - maxRel) < 1e-9);
    const names = best.map((b) => b.name);
    result.push({ period: p, courseNames: names });
  }
  return result;
}

// same logic from version10
function isCourseInMajor(directionStr, c) {
  // directionStr is one of: "STEM", "MEDICAL", "BUSINESS", "SOCIAL_SCIENCE", ...
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
      )
        return true;
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

/** Summaries that transform the plan data into JSON friendly format */
function transformPlanList(planList) {
  // similar to your "printMergedByPeriod"
  const result = [];
  for (const plan of planList) {
    // gather periods
    const periods = new Set(plan.map((c) => c.period));
    const sortedPeriods = Array.from(periods).sort((a, b) => a - b);
    const periodOutputs = [];
    for (const p of sortedPeriods) {
      const coursesInPeriod = plan.filter((c) => c.period === p).map((c) => c.name);
      periodOutputs.push({ period: p, courseNames: coursesInPeriod });
    }
    // find the single math & english
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

// ======================= 4) MAIN ENDPOINT =======================
app.post("/api/curriculum/plan", (req, res) => {
  const { grade, completedCourses, majorDirectionCode } = req.body;

  // 1) map completed courses to Course objects
  // In version10, you call mapCoursesByName(all, completedCourses).
  // We'll replicate that to get "completedCourseObjs" 
  // mostly so we can do the GraduationRequirements logic if we want.
  const completedSet = new Set(completedCourses || []);
  const completedCourseObjs = ALL.filter((c) => completedSet.has(c.name));

  // 2) graduation requirements update
  const reqs = new GraduationRequirements();
  reqs.updateRequirements(completedCourseObjs);

  // 3) count how many PE Health completed
  const completedPECount = completedCourseObjs.filter((c) => c.category === CourseCategory.PE_HEALTH).length;

  // 4) filter
  const filtered = filterCourses(
    ALL,
    completedCourses || [],
    grade || 9,
    reqs,
    completedCourseObjs
  );

  // If PE/Health completed 2+ times, skip more
  const finalFiltered = filtered.filter((c) => {
    if (c.category === CourseCategory.PE_HEALTH) {
      return completedPECount < 2;
    }
    return true;
  });

  // group by period => generate combos
  const periodMap = {};
  for (const c of finalFiltered) {
    if (!periodMap[c.period]) periodMap[c.period] = [];
    periodMap[c.period].push(c);
  }
  const allPlans = generateAllPossiblePlans(periodMap, grade);

  // feasible
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

  // produce 3 summaries
  const directionStr = fromCode(majorDirectionCode || 1);

  const highestGPA = getHighestGPAPlans(feasiblePlans);
  const easiest = getEasiestPlans(feasiblePlans);
  const mostRelevant = getMostRelevantPlan(feasiblePlans, directionStr);

  // transform highest/easiest into planList format
  const highestGpaPlans = transformPlanList(highestGPA);
  const easiestPlans = transformPlanList(easiest);

  // mostRelevant is period => courseNames
  const response = {
    highestGpaPlans,
    mostRelevantPlan: mostRelevant,
    easiestPlans,
  };
  return res.json(response);
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
