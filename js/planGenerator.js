// js/planGenerator.js
// Make sure that planConstants.js and courseDefinitions.js are loaded before this file.
const PlanGenerator = (() => {
  // -------------------------------------------------------------------------
  // 1) COURSE OBJECT CREATION
  // -------------------------------------------------------------------------
  function makeCourse(originalName, gpa, diff, rel, period, minG, maxG, isAP) {
    const unified = unifyNonAPName(originalName);
    const cat = getCategoryByName(originalName);
    const lvl = rawCourseLevelMap.get(originalName) || 0;
    const rawPreArr = rawPrereqMap.get(originalName) || [];
    const unifiedPrereqs = rawPreArr.map((r) => unifyNonAPName(r));
    return {
      name: originalName, // original name (with CP/Honors intact)
      unifiedName: unified, // normalized name for comparisons
      category: cat,
      gpa,
      difficulty: diff,
      relevance: rel,
      prerequisites: unifiedPrereqs,
      period,
      gradeLevelMin: minG,
      gradeLevelMax: maxG,
      isAP,
      level: lvl,
    };
  }

  // -------------------------------------------------------------------------
  // 2) INITIALIZE ALL COURSES
  // -------------------------------------------------------------------------
  function initAllCourses() {
    const list = [];
    if (typeof COURSE_DEFINITIONS === "undefined") {
      console.error(
        "COURSE_DEFINITIONS is not defined. Make sure courseDefinitions.js is loaded before planGenerator.js"
      );
      return list;
    }
    for (const def of COURSE_DEFINITIONS) {
      list.push(
        makeCourse(
          def.name,
          def.gpa,
          def.diff,
          def.rel,
          def.period,
          def.minG,
          def.maxG,
          def.isAP
        )
      );
    }
    return list;
  }

  const ALL = initAllCourses();

  // -------------------------------------------------------------------------
  // 3) GRADUATION REQUIREMENTS
  // -------------------------------------------------------------------------
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
    updateRequirements(completedCourses) {
      for (const c of completedCourses) {
        switch (c.category) {
          case CourseCategory.ENGLISH:
            this.englishNeeded -= 5;
            break;
          case CourseCategory.MATH:
            this.mathNeeded -= 5;
            break;
          case CourseCategory.SCIENCE:
            this.scienceNeeded -= 5;
            break;
          case CourseCategory.SOCIAL_STUDIES:
            this.socialNeeded -= 5;
            break;
          case CourseCategory.FINANCIAL:
            this.financialNeeded -= 5;
            break;
          case CourseCategory.PE_HEALTH:
            this.peHealthNeeded -= 5;
            break;
          case CourseCategory.VPA:
            this.vpaNeeded -= 5;
            break;
          case CourseCategory.WL:
            this.wlNeeded -= 5;
            break;
          case CourseCategory.LIFE_CAREERS:
            this.lifeCareersNeeded -= 5;
            break;
          case CourseCategory.ELECTIVES:
            this.electivesNeeded -= 5;
            break;
          default:
            break;
        }
      }
      // Clamp requirements to zero.
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
  }

  // -------------------------------------------------------------------------
  // 4) FILTERING & PLAN GENERATION HELPERS
  // -------------------------------------------------------------------------
  function arePrerequisitesMet(course, completedUnifiedSet) {
    if (!course.prerequisites || course.prerequisites.length === 0) return true;
    if (course.name === "AP Calculus BC") {
      return course.prerequisites.some((pr) => completedUnifiedSet.has(pr));
    }
    for (const pr of course.prerequisites) {
      if (!completedUnifiedSet.has(pr)) return false;
    }
    return true;
  }

  // In filterCourses we add a two‐pass approach for math courses:
  // 1. Compute the highest math level among completed courses.
  // 2. Gather candidate math courses; if any candidate has level equal to (highest + 1),
  //    then later only math courses with level exactly highest+1 will be allowed.
  function filterCourses(allCourses, completedUnifiedSet, grade, req) {
    const res = [];
    const CONFLICT_BASES = new Set(["Biology", "Chemistry", "US History"]);
    const userConflictBases = new Set();
    for (const unifiedName of completedUnifiedSet) {
      const base = unifyNonAPName(unifiedName).replace("AP ", "").trim();
      if (CONFLICT_BASES.has(base)) {
        userConflictBases.add(base);
      }
    }
    // Compute highest math level from completed courses (using ALL course objects)
    let highestMathLevel = 0;
    for (const course of ALL) {
      if (
        completedUnifiedSet.has(course.unifiedName) &&
        course.category === CourseCategory.MATH &&
        course.level > highestMathLevel
      ) {
        highestMathLevel = course.level;
      }
    }
    // Determine if there exists any candidate math course exactly one level higher.
    const candidateMathCourses = ALL.filter(course =>
      course.category === CourseCategory.MATH &&
      !completedUnifiedSet.has(course.unifiedName) &&
      course.level > highestMathLevel &&
      arePrerequisitesMet(course, completedUnifiedSet) &&
      (grade >= course.gradeLevelMin && grade <= course.gradeLevelMax)
    );
    const useLeastMathOnly = candidateMathCourses.some(c => c.level === highestMathLevel + 1);

    const highestNonMathLevelMap = {};
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
    for (const course of ALL) {
      if (
        completedUnifiedSet.has(course.unifiedName) &&
        getNonMathCategoryBase(course.unifiedName)
      ) {
        const nm = getNonMathCategoryBase(course.unifiedName);
        highestNonMathLevelMap[nm] = Math.max(highestNonMathLevelMap[nm] || 0, course.level);
      }
    }
    function getRequiredEnglishForGrade(grade, completedUnifiedSet) {
      if (grade === 9) {
        if ([...completedUnifiedSet].some(c => unifyNonAPName(c).toLowerCase() === "english 9")) {
          return "English 10";
        }
        return "English 9";
      } else if (grade === 10) {
        if ([...completedUnifiedSet].some(c => unifyNonAPName(c).toLowerCase() === "english 10")) {
          return "English 11";
        }
        return "English 10";
      } else if (grade === 11) {
        if ([...completedUnifiedSet].some(c =>
          unifyNonAPName(c).toLowerCase() === "english 11" ||
          unifyNonAPName(c).toLowerCase().includes("ap english")
        )) {
          return "English 12";
        }
        return "English 11";
      } else if (grade === 12) {
        return "English 12";
      }
      return "English 9";
    }
    const requiredEnglish = getRequiredEnglishForGrade(grade, completedUnifiedSet);

    for (const course of allCourses) {
      if (completedUnifiedSet.has(course.unifiedName)) continue;
      if (!course.isAP) {
        const base = unifyNonAPName(course.unifiedName.replace("AP ", ""));
        if (CONFLICT_BASES.has(base) && userConflictBases.has(base)) {
          continue;
        }
      }
      if (course.category === CourseCategory.ENGLISH) {
        if (
          unifyNonAPName(course.name).toLowerCase() !==
          unifyNonAPName(requiredEnglish).toLowerCase()
        ) {
          continue;
        }
      }
      if (
        !(course.category === CourseCategory.ENGLISH &&
          unifyNonAPName(course.name).toLowerCase() ===
          unifyNonAPName(requiredEnglish).toLowerCase())
      ) {
        if (grade < course.gradeLevelMin || grade > course.gradeLevelMax) continue;
      }
      if (!arePrerequisitesMet(course, completedUnifiedSet)) continue;
      if (course.category === CourseCategory.MATH) {
        // Only consider math courses with level greater than the highest completed.
        if (course.level <= highestMathLevel) continue;
        // And if there is at least one candidate math course exactly one level higher,
        // then only allow math courses whose level is exactly (highestMathLevel + 1).
        if (useLeastMathOnly && course.level !== highestMathLevel + 1) continue;
      } else {
        const nm = getNonMathCategoryBase(unifyNonAPName(course.unifiedName));
        if (nm) {
          const cLevel = course.level;
          const maxLvl = highestNonMathLevelMap[nm] || 0;
          if (cLevel <= maxLvl) continue;
        }
      }
      res.push(course);
    }
    return res;
  }

  function generateAllPossiblePlans(periodMap) {
    const periods = Object.keys(periodMap).map(Number).sort((a, b) => a - b);
    const results = [];
    function backtrack(idx, current) {
      if (idx === periods.length) {
        results.push([...current]);
        return;
      }
      const p = periods[idx];
      const candidates = periodMap[p] || [];
      for (const c of candidates) {
        current.push(c);
        if (checkNoDuplicateUnified(current)) {
          backtrack(idx + 1, current);
        }
        current.pop();
      }
    }
    backtrack(0, []);
    return results;
  }

  function checkNoDuplicateUnified(plan) {
    const set = new Set();
    for (const c of plan) {
      if (set.has(c.unifiedName)) return false;
      set.add(c.unifiedName);
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // 5) FEASIBILITY & SUMMARY FUNCTIONS
  // -------------------------------------------------------------------------
  // In isFeasible we also compute the highest completed math level from ALL courses
  // and—if there exists a candidate math course exactly one level above—reject plans whose math course isn’t that course.
  function isFeasible(plan, grade, completedUnifiedSet) {
    if (plan.length === 1) return true;
    
    let highestMathLevel = 0;
    for (const course of ALL) {
      if (
        completedUnifiedSet.has(course.unifiedName) &&
        course.category === CourseCategory.MATH &&
        course.level > highestMathLevel
      ) {
        highestMathLevel = course.level;
      }
    }
    const candidateMathCourses = ALL.filter(course =>
      course.category === CourseCategory.MATH &&
      !completedUnifiedSet.has(course.unifiedName) &&
      course.level > highestMathLevel &&
      arePrerequisitesMet(course, completedUnifiedSet) &&
      (grade >= course.gradeLevelMin && grade <= course.gradeLevelMax)
    );
    const useLeastMathOnly = candidateMathCourses.some(c => c.level === highestMathLevel + 1);
    
    const math = plan.filter((c) => c.category === CourseCategory.MATH);
    if (math.length !== 1) return false;
    if (math[0].level <= highestMathLevel) return false;
    if (useLeastMathOnly && math[0].level !== highestMathLevel + 1) return false;
    
    const requiredEnglish = (function (grade, completedUnifiedSet) {
      if (grade === 9) {
        if ([...completedUnifiedSet].some((c) => unifyNonAPName(c).toLowerCase() === "english 9"))
          return "English 10";
        return "English 9";
      } else if (grade === 10) {
        if ([...completedUnifiedSet].some((c) => unifyNonAPName(c).toLowerCase() === "english 10"))
          return "English 11";
        return "English 10";
      } else if (grade === 11) {
        if (
          [...completedUnifiedSet].some(
            (c) =>
              unifyNonAPName(c).toLowerCase() === "english 11" ||
              unifyNonAPName(c).toLowerCase().includes("ap english")
          )
        )
          return "English 12";
        return "English 11";
      } else if (grade === 12) {
        return "English 12";
      }
      return "English 9";
    })(grade, completedUnifiedSet);
    const eng = plan.filter((c) => c.category === CourseCategory.ENGLISH);
    if (eng.length !== 1) return false;
    const englishCourse = eng[0];
    if (
      unifyNonAPName(englishCourse.name).toLowerCase() !==
      unifyNonAPName(requiredEnglish).toLowerCase()
    )
      return false;
    return true;
  }

  function averageGPA(plan) {
    let sum = 0,
      count = 0;
    for (const c of plan) {
      if (c.category !== CourseCategory.FREE_PERIOD) {
        sum += c.gpa;
        count++;
      }
    }
    return count === 0 ? 0 : sum / count;
  }

  function averageDifficulty(plan) {
    let sum = 0,
      count = 0;
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

  function getMostRelevantPlan(feasible, direction) {
    const periodSet = new Set();
    for (const plan of feasible) {
      plan.forEach((c) => periodSet.add(c.period));
    }
    const sortedPeriods = [...periodSet].sort((a, b) => a - b);
    const result = [];
    for (const p of sortedPeriods) {
      let cands = [];
      for (const plan of feasible) {
        const found = plan.filter((cc) => cc.period === p);
        cands.push(...found);
      }
      const uniqueCandsMap = new Map();
      for (const c of cands) {
        if (!uniqueCandsMap.has(c.unifiedName)) {
          uniqueCandsMap.set(c.unifiedName, c);
        }
      }
      cands = Array.from(uniqueCandsMap.values());
      cands = cands.filter((c) => isCourseInMajor(direction, c));
      if (cands.length === 0) {
        result.push({ period: p, courseNames: ["<<<FREE>>>"] });
        continue;
      }
      let maxRel = -1;
      for (const c of cands) {
        if (c.relevance > maxRel) maxRel = c.relevance;
      }
      const best = cands.filter((c) => Math.abs(c.relevance - maxRel) < 1e-9);
      const names = best.map((c) => c.name);
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
        if (c.name.includes("Physiology") || c.name.includes("Psychology"))
          return true;
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
        )
          return true;
        return false;
      case "ENVIRONMENTAL":
        if (c.name.includes("Environmental")) return true;
        if (c.category === CourseCategory.SCIENCE && c.name.includes("Chemistry"))
          return true;
        return false;
      case "CS_DATA":
        if (
          c.category === CourseCategory.LIFE_CAREERS &&
          (c.name.includes("Computer") || c.name.includes("Web") || c.name.includes("Programming"))
        )
          return true;
        if (
          c.category === CourseCategory.MATH &&
          (c.name.includes("Calculus") || c.name.includes("Statistics"))
        )
          return true;
        return false;
      case "LANGUAGE_CULTURE":
        if (c.category === CourseCategory.WL) return true;
        if (c.category === CourseCategory.ENGLISH && c.name.includes("English"))
          return true;
        if (
          c.category === CourseCategory.SOCIAL_STUDIES &&
          (c.name.includes("History") || c.name.includes("Culture"))
        )
          return true;
        return false;
      case "LAW_POLICY":
        if (
          c.category === CourseCategory.SOCIAL_STUDIES &&
          (c.name.includes("Government") || c.name.includes("Politics") || c.name.includes("History"))
        )
          return true;
        if (c.name.includes("Economics") || c.name.includes("Law"))
          return true;
        return false;
      default:
        return false;
    }
  }

  function transformPlanList(planList) {
    const out = [];
    for (const plan of planList) {
      const math = plan.find((c) => c.category === CourseCategory.MATH) || { name: "None" };
      const eng = plan.find((c) => c.category === CourseCategory.ENGLISH) || { name: "None" };
      const comboName = `${math.name} & ${eng.name}`;
      const periodMap = {};
      for (const c of plan) {
        if (!periodMap[c.period]) {
          periodMap[c.period] = [];
        }
        periodMap[c.period].push(c.name);
      }
      const sortedPeriods = Object.keys(periodMap)
        .map(Number)
        .sort((a, b) => a - b);
      const periodOutputs = sortedPeriods.map((p) => ({
        period: p,
        courseNames: periodMap[p],
      }));
      out.push({
        mathEnglishCombo: comboName,
        periods: periodOutputs,
      });
    }
    return out;
  }

  function mergePlansByPeriod(planJSON) {
    const map = new Map();
    for (const p of planJSON) {
      const key = p.mathEnglishCombo;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(p);
    }
    const merged = [];
    for (const [combo, arr] of map.entries()) {
      const periodMap = new Map();
      for (const item of arr) {
        for (const pr of item.periods) {
          if (!periodMap.has(pr.period)) {
            periodMap.set(pr.period, new Set());
          }
          pr.courseNames.forEach((cn) => periodMap.get(pr.period).add(cn));
        }
      }
      const sortedP = [...periodMap.keys()].sort((a, b) => a - b);
      const newPeriods = sortedP.map((pp) => ({
        period: pp,
        courseNames: [...periodMap.get(pp)].sort(),
      }));
      merged.push({
        mathEnglishCombo: combo,
        periods: newPeriods,
      });
    }
    return merged;
  }

  // -------------------------------------------------------------------------
  // 6) EXPOSED FUNCTION: generatePlan
  // -------------------------------------------------------------------------
  function generatePlan(payload) {
    console.debug("generatePlan() called with payload:", payload);
    const { grade, completedCourses, majorDirectionCode } = payload;
    // Step 1: Unify completed courses.
    const completedUnified = (completedCourses || []).map((c) => unifyNonAPName(c));
    const completedCourseObjs = ALL.filter((c) => completedUnified.includes(c.unifiedName));

    // Step 2: Update graduation requirements.
    const reqs = new GraduationRequirements();
    reqs.updateRequirements(completedCourseObjs);

    // Step 3: Filter courses.
    let filtered = filterCourses(ALL, new Set(completedUnified), grade || 9, reqs);

    // Step 4: Skip extra PE courses if already completed 2 or more.
    const userPECount = completedCourseObjs.filter((c) => c.category === CourseCategory.PE_HEALTH).length;
    const finalFiltered = filtered.filter((c) => {
      if (c.category === CourseCategory.PE_HEALTH) {
        return userPECount < 2;
      }
      return true;
    });

    // Step 5: Group courses by period.
    const periodMap = {};
    for (const c of finalFiltered) {
      if (!periodMap[c.period]) {
        periodMap[c.period] = [];
      }
      periodMap[c.period].push(c);
    }

    // Step 6: Generate all possible plans.
    const allPlans = generateAllPossiblePlans(periodMap);

    // Step 7: Filter feasible plans.
    const feasible = [];
    for (const plan of allPlans) {
      if (isFeasible(plan, grade, new Set(completedUnified))) {
        feasible.push(plan);
      }
    }
    if (!feasible.length) {
      return {
        highestGpaPlans: [],
        mostRelevantPlan: [],
        easiestPlans: [],
      };
    }

    // Step 8: Create summaries.
    const directionStr = fromCode(majorDirectionCode || 1);
    const highest = getHighestGPAPlans(feasible);
    const easiest = getEasiestPlans(feasible);
    const mr = getMostRelevantPlan(feasible, directionStr);

    const highestRaw = transformPlanList(highest);
    const highestGpaPlans = mergePlansByPeriod(highestRaw);
    const easiestRaw = transformPlanList(easiest);
    const easiestPlans = mergePlansByPeriod(easiestRaw);

    return {
      highestGpaPlans,
      mostRelevantPlan: mr,
      easiestPlans,
    };
  }

  // -------------------------------------------------------------------------
  // 7) EXPOSE PUBLIC FUNCTIONS
  // -------------------------------------------------------------------------
  return {
    generatePlan,
    unifyNonAPName,
  };
})();
