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
  'components/ui/alert-dialog.tsx',
  'components/ui/dialog.tsx',
  'components/ui/drawer.tsx',
  'components/ui/sheet.tsx',
];

const replacements = [
  // Hex colors - do these first before the generic ones
  [/\bbg-\[#1E3A8A\]\/90\b/g, 'bg-primary/90'],
  [/\bbg-\[#1E3A8A\]\/80\b/g, 'bg-primary/80'],
  [/\bbg-\[#1E3A8A\]\b/g, 'bg-primary'],
  [/\btext-\[#1E3A8A\]\b/g, 'text-primary'],
  [/\bfrom-\[#1E3A8A\]\b/g, 'from-primary'],
  [/\bbg-\[#1E3A8A\]\/20\b/g, 'bg-primary/20'],
  [/\bbg-\[#1E3A8A\]\/10\b/g, 'bg-primary/10'],
  [/\bborder-\[#1E3A8A\]\b/g, 'border-primary'],
  [/\bbg-\[#F97316\]\/90\b/g, 'bg-accent/90'],
  [/\bbg-\[#F97316\]\/10\b/g, 'bg-accent/10'],
  [/\bbg-\[#F97316\]\b/g, 'bg-accent'],
  [/\btext-\[#F97316\]\b/g, 'text-accent'],
  [/\bborder-\[#F97316\]\/30\b/g, 'border-accent/30'],
  [/\bborder-\[#F97316\]\/50\b/g, 'border-accent/50'],
  [/\bborder-\[#F97316\]\b/g, 'border-accent'],
  [/\bfrom-\[#F97316\]\b/g, 'from-accent'],
  [/\bto-\[#F97316\]\b/g, 'to-accent'],
  // Neutral colors - must be careful with order
  // bg-black/80 and bg-black/95 are overlays - replace with bg-overlay/80 and bg-overlay/95
  [/\bbg-black\/80\b/g, 'bg-overlay/80'],
  [/\bbg-black\/95\b/g, 'bg-overlay/95'],
  [/\bbg-black\b/g, 'bg-background'],
  [/\bfrom-black\/80\b/g, 'from-background/80'],
  [/\bto-black\/80\b/g, 'to-background/80'],
  // text-white
  [/\btext-white\b/g, 'text-foreground'],
  // gray scale
  [/\bbg-gray-900\/80\b/g, 'bg-card/80'],
  [/\bbg-gray-900\/50\b/g, 'bg-card/50'],
  [/\bbg-gray-900\b/g, 'bg-card'],
  [/\bbg-gray-800\/50\b/g, 'bg-secondary/50'],
  [/\bbg-gray-800\b/g, 'bg-secondary'],
  [/\bbg-gray-700\/50\b/g, 'bg-code-bg/50'],
  [/\bbg-gray-700\b/g, 'bg-code-bg'],
  [/\bbg-gray-600\b/g, 'bg-muted'],
  [/\btext-gray-200\b/g, 'text-foreground'],
  [/\btext-gray-300\b/g, 'text-muted-foreground'],
  [/\btext-gray-400\b/g, 'text-muted-foreground'],
  [/\btext-gray-500\b/g, 'text-muted-foreground'],
  [/\btext-gray-600\b/g, 'text-muted-foreground'],
  // borders
  [/\bborder-white\/40\b/g, 'border-border'],
  [/\bborder-white\/20\b/g, 'border-border'],
  [/\bborder-white\/10\b/g, 'border-border'],
  [/\bborder-white\/5\b/g, 'border-border'],
  // bg-white opacity
  [/\bbg-white\/5\b/g, 'bg-secondary'],
  [/\bbg-white\/10\b/g, 'bg-secondary'],
  // prose-invert - remove it since we handle via CSS
  [/\bprose-invert\b/g, ''],
];

let changed = 0;
for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (not found): ${file}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    changed++;
    console.log(`UPDATED: ${file}`);
  } else {
    console.log(`NO CHANGE: ${file}`);
  }
}
console.log(`\nTotal files changed: ${changed}`);
