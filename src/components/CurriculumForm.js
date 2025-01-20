// src/components/CurriculumForm.js
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, ProgressBar, Accordion, Card } from "react-bootstrap";
import { generatePlan } from "../services/curriculumService.js";

import { ALL_COURSES } from "../utils/courseData.js";
import { groupCoursesBySubject } from "../utils/groupCoursesBySubject.js";

// For controlling the subject order in our UI
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
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // The grouped courses by subject
  const [coursesBySubject, setCoursesBySubject] = useState({});

  useEffect(() => {
    // Deduplicate & group
    const grouped = groupCoursesBySubject(ALL_COURSES);
    setCoursesBySubject(grouped);
  }, []);

  const handleCourseToggle = (courseName) => {
    setCompletedCourses((prev) =>
      prev.includes(courseName)
        ? prev.filter((c) => c !== courseName)
        : [...prev, courseName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const payload = {
        grade: parseInt(grade, 10),
        completedCourses,
        majorDirectionCode: parseInt(majorDirection, 10),
      };
      const data = await generatePlan(payload);
      setResult(data);
    } catch (err) {
      console.error("Error generating plan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ fontSize: "1rem" }}>
      <h2>Curriculum Planner</h2>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="gradeSelect">
              <Form.Label>Student Grade</Form.Label>
              <Form.Select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value={9}>9</option>
                <option value={10}>10</option>
                <option value={11}>11</option>
                <option value={12}>12</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="majorDirection">
              <Form.Label>Major Direction</Form.Label>
              <Form.Select
                value={majorDirection}
                onChange={(e) => setMajorDirection(e.target.value)}
              >
                <option value={1}>1 - STEM</option>
                <option value={2}>2 - MEDICAL</option>
                <option value={3}>3 - BUSINESS</option>
                <option value={4}>4 - SOCIAL_SCIENCE</option>
                <option value={5}>5 - ENVIRONMENTAL</option>
                <option value={6}>6 - CS_DATA</option>
                <option value={7}>7 - LANGUAGE_CULTURE</option>
                <option value={8}>8 - LAW_POLICY</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Accordion: displays courses by subject */}
        <Accordion alwaysOpen>
          {SUBJECT_ORDER.map((subj, idx) => {
            const list = coursesBySubject[subj] || [];
            if (!list.length) return null;
            return (
              <Accordion.Item eventKey={String(idx)} key={subj}>
                <Accordion.Header>{subj}</Accordion.Header>
                <Accordion.Body>
                  {list.map((course) => (
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

        <Button type="submit" variant="primary" className="mt-3" disabled={isLoading}>
          Generate Plan
        </Button>
      </Form>

      {isLoading && (
        <div className="mt-3">
          <ProgressBar animated now={100} label="Generating..." />
        </div>
      )}

      {/* Render results, etc. */}
      {result && !isLoading && (
        <div className="mt-4">
          {/* Example rendering of Highest GPA Plans, etc. */}
          <h3>Results</h3>
          {/* ... */}
        </div>
      )}
    </div>
  );
};

export default CurriculumForm;
