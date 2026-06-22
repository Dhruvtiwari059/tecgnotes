-- First delete subjects associated with semesters of branches to be removed
DELETE FROM subjects WHERE semester_id IN (
  SELECT s.id FROM semesters s 
  JOIN branches b ON s.branch_id = b.id 
  WHERE b.slug IN ('ece', 'me', 'ce', 'ee')
);

-- Delete semesters for ECE, ME, CE, EE branches
DELETE FROM semesters WHERE branch_id IN (
  SELECT id FROM branches WHERE slug IN ('ece', 'me', 'ce', 'ee')
);

-- Delete the branches
DELETE FROM branches WHERE slug IN ('ece', 'me', 'ce', 'ee');