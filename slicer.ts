import { EnergyLevel, FocusLog, MicroSprint, TaskCategory } from '@/types/sprint';

const HIGH_ENERGY_KEYWORDS = [
  'code', 'build', 'debug', 'algorithm', 'calculus', 'physics', 'essay',
  'write', 'design', 'architect', 'deploy', 'study', 'exam', 'math', 'api'
];

const LOW_ENERGY_KEYWORDS = [
  'clean', 'organize', 'email', 'reply', 'sort', 'rename', 'format',
  'submit', 'upload', 'review', 'flashcard', 'read', 'outline', 'list'
];

function detectEnergy(text: string): EnergyLevel {
  const lower = text.toLowerCase();
  if (HIGH_ENERGY_KEYWORDS.some((kw) => lower.includes(kw))) return 'high';
  if (LOW_ENERGY_KEYWORDS.some((kw) => lower.includes(kw))) return 'low';
  return 'medium';
}

function detectCategory(text: string): TaskCategory {
  const lower = text.toLowerCase();
  if (/(code|bug|app|deploy|git|api|build|script|hackathon|website)/.test(lower)) return 'build';
  if (/(study|exam|chapter|notes|homework|math|bio|chem|essay|quiz)/.test(lower)) return 'study';
  if (/(design|poster|video|pitch|slide|draw|music|edit)/.test(lower)) return 'creative';
  return 'life';
}

/**
 * Deterministic Brain-Dump Auto-Slicer:
 * Converts vague, overwhelming tasks into concrete 10–20 minute micro-sprints
 * so students overcome task paralysis immediately (works 100% offline).
 */
export function sliceBrainDumpToSprints(rawInput: string): MicroSprint[] {
  const lines = rawInput
    .split(/\n|;|\.(?=\s+[A-Z])/)
    .map((l) => l.replace(/^[-*•\d.)]+\s*/, '').trim())
    .filter((l) => l.length > 2);

  const results: MicroSprint[] = [];

  lines.forEach((line, lineIdx) => {
    const baseEnergy = detectEnergy(line);
    const category = detectCategory(line);
    const clauses = line
      .split(/\s+(?:and then|and|then|plus)\s+/i)
      .map((c) => c.trim())
      .filter(Boolean);

    if (clauses.length > 1) {
      clauses.forEach((clause, cIdx) => {
        results.push({
          id: `sprint-${Date.now()}-${lineIdx}-${cIdx}-${Math.random().toString(36).slice(2, 6)}`,
          parentTask: line,
          title: capitalizeFirst(clause),
          durationMinutes: 15,
          energyRequired: detectEnergy(clause),
          category: detectCategory(clause),
          completed: false,
        });
      });
    } else if (line.length > 36 || baseEnergy === 'high') {
      results.push(
        {
          id: `sprint-${Date.now()}-${lineIdx}-1-${Math.random().toString(36).slice(2, 6)}`,
          parentTask: line,
          title: `Warm-up & outline: ${truncate(line, 44)}`,
          durationMinutes: 10,
          energyRequired: 'low',
          category,
          completed: false,
        },
        {
          id: `sprint-${Date.now()}-${lineIdx}-2-${Math.random().toString(36).slice(2, 6)}`,
          parentTask: line,
          title: `Core deep sprint: ${truncate(line, 44)}`,
          durationMinutes: 20,
          energyRequired: baseEnergy,
          category,
          completed: false,
        },
        {
          id: `sprint-${Date.now()}-${lineIdx}-3-${Math.random().toString(36).slice(2, 6)}`,
          parentTask: line,
          title: `Polish & verify: ${truncate(line, 44)}`,
          durationMinutes: 10,
          energyRequired: 'low',
          category,
          completed: false,
        }
      );
    } else {
      results.push({
        id: `sprint-${Date.now()}-${lineIdx}-0-${Math.random().toString(36).slice(2, 6)}`,
        parentTask: line,
        title: capitalizeFirst(line),
        durationMinutes: 15,
        energyRequired: baseEnergy,
        category,
        completed: false,
      });
    }
  });

  return results;
}

/**
 * Splits a single sprint in half when a user feels stuck mid-session.
 */
export function splitSprintInHalf(sprint: MicroSprint): [MicroSprint, MicroSprint] {
  const halfDuration = Math.max(5, Math.floor(sprint.durationMinutes / 2));
  return [
    {
      ...sprint,
      id: `${sprint.id}-a`,
      title: `Part 1 (Tiny Start): ${sprint.title}`,
      durationMinutes: halfDuration,
      energyRequired: 'low',
    },
    {
      ...sprint,
      id: `${sprint.id}-b`,
      title: `Part 2 (Finish): ${sprint.title}`,
      durationMinutes: halfDuration,
    },
  ];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getJudgeDemoData(): { sprints: MicroSprint[]; logs: FocusLog[] } {
  const today = new Date();
  const fmt = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return {
    sprints: [
      {
        id: 'demo-1',
        parentTask: 'Ship Triple H Hackathon MVP',
        title: 'Test energy-matching filter & timer ring',
        durationMinutes: 15,
        energyRequired: 'low',
        category: 'build',
        completed: false,
      },
      {
        id: 'demo-2',
        parentTask: 'AP Calculus BC Problem Set',
        title: 'Solve 4 integration by parts problems',
        durationMinutes: 20,
        energyRequired: 'high',
        category: 'study',
        completed: false,
      },
      {
        id: 'demo-3',
        parentTask: 'Record 90-second Devpost Pitch',
        title: 'Write bullet hooks & record screen demo',
        durationMinutes: 15,
        energyRequired: 'medium',
        category: 'creative',
        completed: false,
      },
      {
        id: 'demo-4',
        parentTask: 'Clean up school inbox & club notes',
        title: 'Archive old emails & flag Friday deadlines',
        durationMinutes: 10,
        energyRequired: 'low',
        category: 'life',
        completed: false,
      },
      {
        id: 'demo-5',
        parentTask: 'Ship Triple H Hackathon MVP',
        title: 'Deploy production build to Vercel',
        durationMinutes: 15,
        energyRequired: 'medium',
        category: 'build',
        completed: true,
        completedAt: new Date().toISOString(),
      },
    ],
    logs: [
      { id: 'l-1', sprintTitle: 'Outline biology lab hypothesis', minutes: 15, energyMatched: true, dateISO: fmt(4) },
      { id: 'l-2', sprintTitle: 'Build Next.js component skeleton', minutes: 25, energyMatched: true, dateISO: fmt(3) },
      { id: 'l-3', sprintTitle: 'Review Spanish vocab deck', minutes: 15, energyMatched: true, dateISO: fmt(3) },
      { id: 'l-4', sprintTitle: 'Draft hackathon architecture', minutes: 20, energyMatched: true, dateISO: fmt(2) },
      { id: 'l-5', sprintTitle: 'Solve physics kinematics set', minutes: 25, energyMatched: false, dateISO: fmt(1) },
      { id: 'l-6', sprintTitle: 'Polish responsive UI states', minutes: 20, energyMatched: true, dateISO: fmt(1) },
      { id: 'l-7', sprintTitle: 'Deploy production build to Vercel', minutes: 15, energyMatched: true, dateISO: fmt(0) },
    ],
  };
}
