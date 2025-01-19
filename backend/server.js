// backend/server.js (ES Modules style)

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// 1) Import from your React file:
import { ALL_COURSES, getSubject } from "../src/utils/courseSubjectUtil.js";

// If you're using ES Modules, __dirname is not defined, so replicate it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ======================================
//  TRANSFORM: Convert each string into a course object
// ======================================
function transformToCourseObjects(names) {
  return names.map((courseName, idx) => {
    // 1) Determine a "subject" like "English", "Math", "Science", etc.
    const rawSubject = getSubject(courseName);

    // 2) We'll store that in a field called "category" that your feasibility checks look for
    //    (They check if category === "Math" or "English" for feasibility.)
    //    We'll keep the same text for other subjects (like "Science", "Social Studies", etc.).
    const category = rawSubject;

    // 3) Assign default values
    const gpa = 4.0;             // you can tweak
    const difficulty = 3.0;      // you can tweak
    const relevance = 4.0;       // so "most relevant" isn't always zero
    const period = (idx % 5) + 1; // random period 1..5
    const gradeLevelMin = 9;     // allow them for grades 9..12
    const gradeLevelMax = 12;
    const isAP = courseName.startsWith("AP ");

    return {
      name: courseName,
      category,      
      gpa,
      difficulty,
      relevance,
      period,
      gradeLevelMin,
      gradeLevelMax,
      isAP,
    };
  });
}

// We build our "courses" array once:
const courses = transformToCourseObjects(ALL_COURSES);

// ======================================
//  HELPER FUNCTIONS (Filter/Generate/Feasibility)
// ======================================

function filterCourses(courses, completed, grade) {
  const completedSet = new Set(completed);
  return courses.filter((c) => {
    // Already completed? skip
    if (completedSet.has(c.name)) return false;
    // Grade constraints
    if (grade < c.gradeLevelMin || grade > c.gradeLevelMax) return false;
    return true;
  });
}

// We'll generate combos by picking exactly 1 course per period:
function generateAllPlans(courses) {
  const byPeriod = {};
  for (const c of courses) {
    if (!byPeriod[c.period]) {
      byPeriod[c.period] = [];
    }
    byPeriod[c.period].push(c);
  }

  const periods = Object.keys(byPeriod).map((p) => parseInt(p, 10));
  periods.sort((a, b) => a - b);

  const results = [];
  function backtrack(idx, current) {
    if (idx === periods.length) {
      results.push([...current]);
      return;
    }
    const p = periods[idx];
    for (const course of byPeriod[p]) {
      current.push(course);
      backtrack(idx + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return results;
}

/**
 * Check feasibility:
 * Must have exactly 1 course whose category === 'Math'
 * and exactly 1 course whose category === 'English'.
 */
function isFeasible(plan, grade) {
  const mathCount = plan.filter((c) => c.category === "Math").length;
  const engCount = plan.filter((c) => c.category === "English").length;
  if (mathCount !== 1 || engCount !== 1) return false;
  // optionally enforce other constraints if you like
  return true;
}

/** Averages for GPA / difficulty */
function averageGPA(plan) {
  let sum = 0;
  for (const c of plan) {
    sum += c.gpa;
  }
  return plan.length > 0 ? sum / plan.length : 0;
}
function averageDifficulty(plan) {
  let sum = 0;
  for (const c of plan) {
    sum += c.difficulty;
  }
  return plan.length > 0 ? sum / plan.length : 0;
}

/** Return subset(s) with highest GPA */
function getHighestGPAPlans(feasible) {
  let maxG = -1;
  for (const plan of feasible) {
    const g = averageGPA(plan);
    if (g > maxG) maxG = g;
  }
  return feasible.filter((plan) => Math.abs(averageGPA(plan) - maxG) < 1e-9);
}

/** Return subset(s) with lowest difficulty */
function getEasiestPlans(feasible) {
  let minDiff = Infinity;
  for (const plan of feasible) {
    const d = averageDifficulty(plan);
    if (d < minDiff) minDiff = d;
  }
  return feasible.filter((plan) => Math.abs(averageDifficulty(plan) - minDiff) < 1e-9);
}

/** Return a single array by period with the highest relevance courses (tie is allowed) */
function getMostRelevantPlan(feasible) {
  const periodMap = {};
  for (const plan of feasible) {
    for (const c of plan) {
      if (!periodMap[c.period]) {
        periodMap[c.period] = [];
      }
      periodMap[c.period].push(c);
    }
  }
  const result = [];
  for (const p of Object.keys(periodMap)) {
    const arr = periodMap[p];
    let maxRel = -1;
    for (const c of arr) {
      if (c.relevance > maxRel) maxRel = c.relevance;
    }
    const best = arr.filter((c) => Math.abs(c.relevance - maxRel) < 1e-9);
    result.push({
      period: parseInt(p, 10),
      courseNames: best.map((b) => b.name),
    });
  }
  // sort by period asc
  result.sort((a, b) => a.period - b.period);
  return result;
}

/**
 * Turn a list of plan arrays (each plan is an array of courses)
 * into data that includes "math & english combo" + periods
 */
function transformPlanList(planList) {
  return planList.map((plan) => {
    // group courses by period
    const periodMap = {};
    for (const c of plan) {
      if (!periodMap[c.period]) {
        periodMap[c.period] = [];
      }
      periodMap[c.period].push(c.name);
    }
    // convert to sorted array
    const periods = Object.keys(periodMap)
      .map((p) => ({
        period: parseInt(p, 10),
        courseNames: periodMap[p],
      }))
      .sort((a, b) => a.period - b.period);

    // find the math & english combos
    const math = plan.find((c) => c.category === "Math");
    const eng = plan.find((c) => c.category === "English");
    const comboName = (math ? math.name : "None") + " & " + (eng ? eng.name : "None");

    return {
      mathEnglishCombo: comboName,
      periods,
    };
  });
}

// ======================================
//  MAIN ENDPOINT: POST /api/curriculum/plan
// ======================================
app.post("/api/curriculum/plan", (req, res) => {
  const { grade, completedCourses, majorDirectionCode } = req.body;

  // 1) Filter out completed or grade-incompatible courses
  const filtered = filterCourses(courses, completedCourses || [], grade || 9);

  // 2) Generate all possible plans (1 course per period)
  const allPlans = generateAllPlans(filtered);

  // 3) Feasibility check
  const feasiblePlans = allPlans.filter((plan) => isFeasible(plan, grade || 9));

  // If no feasible plan, return empty arrays
  if (feasiblePlans.length === 0) {
    return res.json({
      highestGpaPlans: [],
      mostRelevantPlan: [],
      easiestPlans: [],
    });
  }

  // 4) Summaries
  const highestGpa = getHighestGPAPlans(feasiblePlans);
  const easiest = getEasiestPlans(feasiblePlans);
  const mostRelevant = getMostRelevantPlan(feasiblePlans);

  // 5) Transform plan arrays into your desired structure
  const response = {
    highestGpaPlans: transformPlanList(highestGpa),
    mostRelevantPlan: mostRelevant,
    easiestPlans: transformPlanList(easiest),
  };

  return res.json(response);
});

// ======================================
//  SERVE REACT BUILD IN PRODUCTION
// ======================================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });
}

// ======================================
//  START SERVER
// ======================================
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
