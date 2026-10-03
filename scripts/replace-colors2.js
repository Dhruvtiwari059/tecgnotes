const fs = require('fs');
const path = require('path');

const files = [
  'app/not-found.tsx',
  'app/page.tsx',
  'app/admin/page.tsx',
  'app/chatbot/page.tsx',
  'app/dsa/page.tsx',
  'app/feedback/page.tsx',
  'app/imp-questions/page.tsx',
  'app/notes/page.tsx',
  'app/placement/page.tsx',
  'app/pyq/page.tsx',
  'app/search/page.tsx',
  'app/subject/[slug]/page.tsx',
  'app/syllabus/page.tsx',
  'app/year/[year]/page.tsx',
  'app/year/[year]/[branch]/page.tsx',
  'app/year/[year]/[branch]/semester/[sem]/page.tsx',
  'components/admin-panel.tsx',
  'components/all-notes.tsx',
  'components/all-pyq.tsx',
  'components/branch-selector.tsx',
  'components/chat-interface.tsx',
  'components/dsa-list.tsx',
  'components/feedback-form.tsx',
  'components/floating-chat.tsx',
  'components/footer.tsx',
  'components/hero-section.tsx',
  'components/imp-questions.tsx',
  'components/placement-list.tsx',
  'components/quick-access.tsx',
  'components/search-results.tsx',
  'components/semester-selector.tsx',
  'components/subject-detail.tsx',
  'components/subject-list.tsx',
  'components/syllabus.tsx',
  'components/year-selector.tsx',
];

// These patterns don't use \b since # is not a word char
const replacements = [
  [/bg-\[#1E3A8A\]\/90/g, 'bg-primary/90'],
  [/bg-\[#1E3A8A\]/g, 'bg-primary'],
  [/text-\[#1E3A8A\]/g, 'text-primary'],
  [/from-\[#1E3A8A\]/g, 'from-primary'],
  [/bg-\[#1E3A8A\]\/20/g, 'bg-primary/20'],
  [/bg-\[#1E3A8A\]\/10/g, 'bg-primary/10'],
  [/border-\[#1E3A8A\]/g, 'border-primary'],
  [/bg-\[#F97316\]\/90/g, 'bg-accent/90'],
  [/bg-\[#F97316\]\/10/g, 'bg-accent/10'],
  [/bg-\[#F97316\]/g, 'bg-accent'],
  [/text-\[#F97316\]/g, 'text-accent'],
  [/border-\[#F97316\]\/30/g, 'border-accent/30'],
  [/border-\[#F97316\]\/50/g, 'border-accent/50'],
  [/border-\[#F97316\]/g, 'border-accent'],
  [/from-\[#F97316\]/g, 'from-accent'],
  [/to-\[#F97316\]/g, 'to-accent'],
];

let changed = 0;
for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    changed++;
    console.log(`UPDATED: ${file}`);
  }
}
console.log(`\nTotal files changed: ${changed}`);
