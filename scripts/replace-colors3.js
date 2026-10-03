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

const replacements = [
  // bg-primary with text-foreground should be text-primary-foreground
  [/bg-primary hover:bg-primary\/90 text-foreground/g, 'bg-primary hover:bg-primary/90 text-primary-foreground'],
  [/bg-primary text-foreground/g, 'bg-primary text-primary-foreground'],
  // bg-accent with text-foreground should be text-accent-foreground (but only for solid bg-accent, not bg-accent/10)
  [/bg-accent text-foreground/g, 'bg-accent text-accent-foreground'],
  // Fix bg-gray-500/10
  [/bg-gray-500\/10/g, 'bg-muted'],
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
