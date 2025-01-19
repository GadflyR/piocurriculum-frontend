// src/components/CurriculumForm.js

import React, { useState, useEffect } from "react";
import { Accordion, Form, Row, Col, Button, ProgressBar } from "react-bootstrap";
import { generatePlan } from "../services/curriculumService";
import { ALL_COURSES, groupCoursesBySubject } from "../utils/courseSubjectUtil";

// For major direction
const MAJOR_DIRECTIONS = [
  { code: 1, label: "STEM" },
  { code: 2, label: "MEDICAL" },
  { code: 3, label: "BUSINESS" },
  { code: 4, label: "SOCIAL_SCIENCE" },
  { code: 5, label: "ENVIRONMENTAL" },
  { code: 6, label: "CS_DATA" },
  { code: 7, label: "LANGUAGE_CULTURE" },
  { code: 8, label: "LAW_POLICY" },
];

const SUBJECT_ORDER = [
  "English",
  "Math",
  "Science",
  "Social Studies",
  "World Language",
  "Computer/Tech",
  "Business/Financial",
  "Arts/PE/Elective",
  "Other",
];

const CurriculumForm = () => {
  const [grade, setGrade] = useState(9);
  const [majorDirection, setMajorDirection] = useState(1);
  const [completedCourses, setCompletedCourses] = useState([]);

  // For the progress bar
  const [isLoading, setIsLoading] = useState(false);

  // Result from the backend
  const [result, setResult] = useState(null);

  // Group all courses by subject
  const [coursesBySubject, setCoursesBySubject] = useState({});

  useEffect(() => {
    const grouped = groupCoursesBySubject(ALL_COURSES);
    setCoursesBySubject(grouped);
  }, []);

  // Toggle a course in our completedCourses array
  const handleCourseToggle = (courseName) => {
    setCompletedCourses((prev) => {
      if (prev.includes(courseName)) {
        return prev.filter((c) => c !== courseName);
      } else {
        return [...prev, courseName];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // start progress
    setResult(null);

    try {
      const payload = {
        grade: parseInt(grade, 10),
        completedCourses: completedCourses,
        majorDirectionCode: parseInt(majorDirection, 10),
      };
      const data = await generatePlan(payload);
      setResult(data);
    } catch (error) {
      console.error("Error generating plan:", error);
      // Optionally show an error message
    } finally {
      setIsLoading(false); // end progress
    }
  };

  return (
    <div className="container mt-4">

      {/* Title */}
      <h2 className="mb-3">Curriculum Planner</h2>

      {/* Form for grade & direction */}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="gradeSelect">
              <Form.Label>Student Grade</Form.Label>
              <Form.Select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="majorDirectionSelect">
              <Form.Label>Major Direction</Form.Label>
              <Form.Select
                value={majorDirection}
                onChange={(e) => setMajorDirection(e.target.value)}
              >
                {MAJOR_DIRECTIONS.map((dir) => (
                  <option key={dir.code} value={dir.code}>
                    {dir.code} - {dir.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Accordion with courses grouped by subject */}
        <Accordion defaultActiveKey="0" alwaysOpen className="mb-3">
          {SUBJECT_ORDER.map((subj, index) => {
            const coursesInSubject = coursesBySubject[subj] || [];
            if (coursesInSubject.length === 0) {
              return null; // skip if no courses in that subject
            }
            return (
              <Accordion.Item eventKey={String(index)} key={subj}>
                <Accordion.Header>{subj}</Accordion.Header>
                <Accordion.Body>
                  {coursesInSubject.map((course) => (
                    <Form.Check
                      key={course}
                      type="checkbox"
                      label={course}
                      checked={completedCourses.includes(course)}
                      onChange={() => handleCourseToggle(course)}
                      className="mb-2"
                    />
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>

        {/* Submit button */}
        <Button type="submit" variant="primary" disabled={isLoading}>
          Generate Plan
        </Button>
      </Form>

      {/* Progress bar while loading */}
      {isLoading && (
        <div className="mt-3">
          <ProgressBar
            animated
            now={100}
            label="Generating..."
            style={{ height: "30px" }}
          />
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="mt-5">
          <h3>Results</h3>

          {/* Highest GPA Plans */}
          <div>
            <h4>Highest GPA Plans</h4>
            {result.highestGpaPlans && result.highestGpaPlans.length > 0 ? (
              result.highestGpaPlans.map((plan, idx) => (
                <div key={idx} style={{ marginBottom: "1rem" }}>
                  <strong>Math & English combo:</strong> {plan.mathEnglishCombo}
                  <ul>
                    {plan.periods.map((p) => (
                      <li key={p.period}>
                        <b>Period {p.period}:</b> {p.courseNames.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>No highest GPA plan found.</p>
            )}
          </div>

          {/* Most Relevant Plan */}
          <div>
            <h4>Most Relevant Plan (by period)</h4>
            {result.mostRelevantPlan && result.mostRelevantPlan.length > 0 ? (
              <ul>
                {result.mostRelevantPlan.map((p, idx) => (
                  <li key={idx}>
                    <b>Period {p.period}:</b> {p.courseNames.join(", ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No most relevant plan found.</p>
            )}
          </div>

          {/* Easiest Plans */}
          <div>
            <h4>Easiest Plans</h4>
            {result.easiestPlans && result.easiestPlans.length > 0 ? (
              result.easiestPlans.map((plan, idx) => (
                <div key={idx} style={{ marginBottom: "1rem" }}>
                  <strong>Math & English combo:</strong>{" "}
                  {plan.mathEnglishCombo}
                  <ul>
                    {plan.periods.map((p) => (
                      <li key={p.period}>
                        <b>Period {p.period}:</b> {p.courseNames.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>No easiest plan found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumForm;
