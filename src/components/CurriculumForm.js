// src/components/CurriculumForm.js
import React, { useState } from "react";
import { generatePlan } from "../services/curriculumService";

const CurriculumForm = () => {
  const [grade, setGrade] = useState(9);
  const [completedCourses, setCompletedCourses] = useState("");
  const [majorDirectionCode, setMajorDirectionCode] = useState(1);

  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert completedCourses string into an array (semicolon-delimited as in your console code)
      const completedArray = completedCourses
        .split(";")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const payload = {
        grade,
        completedCourses: completedArray,
        majorDirectionCode,
      };

      const data = await generatePlan(payload);
      setResult(data);
    } catch (error) {
      console.error("Error generating plan:", error);
    }
  };

  return (
    <div>
      <h2>Curriculum Planner</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Student Grade (9,10,11,12): </label>
          <input
            type="number"
            value={grade}
            onChange={(e) => setGrade(parseInt(e.target.value, 10))}
          />
        </div>

        <div>
          <label>Completed Courses (semicolon-separated): </label>
          <textarea
            rows="3"
            cols="50"
            value={completedCourses}
            onChange={(e) => setCompletedCourses(e.target.value)}
          />
        </div>

        <div>
          <label>Major Direction Code (1..8): </label>
          <input
            type="number"
            value={majorDirectionCode}
            onChange={(e) => setMajorDirectionCode(parseInt(e.target.value, 10))}
          />
        </div>

        <button type="submit">Generate Plan</button>
      </form>

      {result && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Results</h3>
          <div>
            <h4>Highest GPA Plans</h4>
            {result.highestGpaPlans.map((plan, idx) => (
              <div key={idx} style={{ marginBottom: "1em" }}>
                <strong>Math & English combo: {plan.mathEnglishCombo}</strong>
                <ul>
                  {plan.periods.map((p) => (
                    <li key={p.period}>
                      <strong>Period {p.period}:</strong>{" "}
                      {p.courseNames.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h4>Most Relevant Plan (by period)</h4>
            <ul>
              {result.mostRelevantPlan.map((p, idx) => (
                <li key={idx}>
                  <strong>Period {p.period}:</strong>{" "}
                  {p.courseNames.join(", ")}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Easiest Plans</h4>
            {result.easiestPlans.map((plan, idx) => (
              <div key={idx} style={{ marginBottom: "1em" }}>
                <strong>Math & English combo: {plan.mathEnglishCombo}</strong>
                <ul>
                  {plan.periods.map((p) => (
                    <li key={p.period}>
                      <strong>Period {p.period}:</strong>{" "}
                      {p.courseNames.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumForm;
