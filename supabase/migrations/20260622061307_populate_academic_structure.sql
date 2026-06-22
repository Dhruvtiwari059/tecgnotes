-- Populate years
INSERT INTO years (number, label) VALUES
  (1, '1st Year'),
  (2, '2nd Year'),
  (3, '3rd Year'),
  (4, '4th Year');

-- Populate branches
INSERT INTO branches (name, slug) VALUES
  ('Common (First Year)', 'common'),
  ('Computer Science & Engineering', 'cse'),
  ('Information Technology', 'it'),
  ('Artificial Intelligence & Machine Learning', 'aiml'),
  ('Electronics & Communication Engineering', 'ece'),
  ('Mechanical Engineering', 'me'),
  ('Civil Engineering', 'ce'),
  ('Electrical Engineering', 'ee');

-- Populate semesters (2 per year, linked to branches)
-- For 1st year: Common branch
-- For other years: Each branch has its own semesters

-- Get IDs
DO $$
DECLARE
  y1_id uuid; y2_id uuid; y3_id uuid; y4_id uuid;
  common_id uuid; cse_id uuid; it_id uuid; aiml_id uuid; 
  ece_id uuid; me_id uuid; ce_id uuid; ee_id uuid;
BEGIN
  SELECT id INTO y1_id FROM years WHERE number = 1;
  SELECT id INTO y2_id FROM years WHERE number = 2;
  SELECT id INTO y3_id FROM years WHERE number = 3;
  SELECT id INTO y4_id FROM years WHERE number = 4;
  
  SELECT id INTO common_id FROM branches WHERE slug = 'common';
  SELECT id INTO cse_id FROM branches WHERE slug = 'cse';
  SELECT id INTO it_id FROM branches WHERE slug = 'it';
  SELECT id INTO aiml_id FROM branches WHERE slug = 'aiml';
  SELECT id INTO ece_id FROM branches WHERE slug = 'ece';
  SELECT id INTO me_id FROM branches WHERE slug = 'me';
  SELECT id INTO ce_id FROM branches WHERE slug = 'ce';
  SELECT id INTO ee_id FROM branches WHERE slug = 'ee';

  -- Year 1: Common branch (Sem 1 & 2)
  INSERT INTO semesters (year_id, branch_id, number) VALUES (y1_id, common_id, 1);
  INSERT INTO semesters (year_id, branch_id, number) VALUES (y1_id, common_id, 2);
  
  -- Year 2: Each branch has Sem 3 & 4
  INSERT INTO semesters (year_id, branch_id, number) SELECT y2_id, b.id, 3 FROM branches b WHERE b.slug != 'common';
  INSERT INTO semesters (year_id, branch_id, number) SELECT y2_id, b.id, 4 FROM branches b WHERE b.slug != 'common';
  
  -- Year 3: Each branch has Sem 5 & 6
  INSERT INTO semesters (year_id, branch_id, number) SELECT y3_id, b.id, 5 FROM branches b WHERE b.slug != 'common';
  INSERT INTO semesters (year_id, branch_id, number) SELECT y3_id, b.id, 6 FROM branches b WHERE b.slug != 'common';
  
  -- Year 4: Each branch has Sem 7 & 8
  INSERT INTO semesters (year_id, branch_id, number) SELECT y4_id, b.id, 7 FROM branches b WHERE b.slug != 'common';
  INSERT INTO semesters (year_id, branch_id, number) SELECT y4_id, b.id, 8 FROM branches b WHERE b.slug != 'common';

  -- Populate subjects for Year 1 (Common, Sem 1)
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Engineering Mathematics I', 'MTH101', 'eng-math-1'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 1;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Engineering Physics', 'PHY101', 'eng-physics'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 1;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Engineering Chemistry', 'CHE101', 'eng-chemistry'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 1;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Basic Electrical Engineering', 'ELE101', 'basic-electrical'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 1;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Engineering Graphics', 'EG101', 'eng-graphics'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 1;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Programming Fundamentals', 'CS101', 'prog-fundamentals'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 1;

  -- Populate subjects for Year 1 (Common, Sem 2)
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Engineering Mathematics II', 'MTH102', 'eng-math-2'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 2;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Physics II (Electronics)', 'PHY102', 'physics-electronics'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 2;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Environmental Science', 'ENV101', 'env-science'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 2;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Workshop Practice', 'WS101', 'workshop'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 2;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Object Oriented Programming', 'CS102', 'oop'
  FROM semesters s WHERE s.year_id = y1_id AND s.branch_id = common_id AND s.number = 2;

  -- CSE Year 2 subjects (Sem 3)
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Data Structures', 'CS201', 'data-structures'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 3;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Discrete Mathematics', 'MTH201', 'discrete-math'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 3;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Digital Logic Design', 'CS202', 'digital-logic'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 3;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Computer Organization', 'CS203', 'computer-org'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 3;

  -- CSE Year 2 subjects (Sem 4)
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Algorithms', 'CS204', 'algorithms'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 4;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Operating Systems', 'CS205', 'operating-systems'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 4;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Database Management Systems', 'CS206', 'dbms'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 4;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Theory of Computation', 'CS207', 'theory-computation'
  FROM semesters s WHERE s.year_id = y2_id AND s.branch_id = cse_id AND s.number = 4;

  -- CSE Year 3 subjects (Sem 5)
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Computer Networks', 'CS301', 'computer-networks'
  FROM semesters s WHERE s.year_id = y3_id AND s.branch_id = cse_id AND s.number = 5;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Software Engineering', 'CS302', 'software-eng'
  FROM semesters s WHERE s.year_id = y3_id AND s.branch_id = cse_id AND s.number = 5;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Compiler Design', 'CS303', 'compiler-design'
  FROM semesters s WHERE s.year_id = y3_id AND s.branch_id = cse_id AND s.number = 5;

  -- CSE Year 3 subjects (Sem 6)
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Web Technologies', 'CS304', 'web-tech'
  FROM semesters s WHERE s.year_id = y3_id AND s.branch_id = cse_id AND s.number = 6;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Machine Learning', 'CS305', 'machine-learning'
  FROM semesters s WHERE s.year_id = y3_id AND s.branch_id = cse_id AND s.number = 6;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Artificial Intelligence', 'CS306', 'ai'
  FROM semesters s WHERE s.year_id = y3_id AND s.branch_id = cse_id AND s.number = 6;

  -- CSE Year 4 subjects (Sem 7 & 8)
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Cloud Computing', 'CS401', 'cloud-computing'
  FROM semesters s WHERE s.year_id = y4_id AND s.branch_id = cse_id AND s.number = 7;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Cyber Security', 'CS402', 'cyber-security'
  FROM semesters s WHERE s.year_id = y4_id AND s.branch_id = cse_id AND s.number = 7;
  INSERT INTO subjects (semester_id, name, code, slug)
  SELECT s.id, 'Big Data Analytics', 'CS403', 'big-data'
  FROM semesters s WHERE s.year_id = y4_id AND s.branch_id = cse_id AND s.number = 8;
END $$;