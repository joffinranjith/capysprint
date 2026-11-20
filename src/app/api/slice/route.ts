import { NextRequest, NextResponse } from 'next/server';
import { sliceBrainDumpToSprints } from '@/lib/slicer';
import { EnergyLevel, MicroSprint, TaskCategory } from '@/types/sprint';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = typeof body.rawText === 'string' ? body.rawText.trim() : '';
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';

    if (!rawText) {
      return NextResponse.json({ error: 'Task text is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        source: 'instant-engine',
        sprints: sliceBrainDumpToSprints(rawText),
      });
    }

    const response = await fetch('https://api.anakin.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Break the user tasks into 10-20 minute micro-sprints. Return ONLY valid JSON array of objects with keys: parentTask, title, durationMinutes (10|15|20), energyRequired ("low"|"medium"|"high"), category ("study"|"build"|"life"|"creative").',
          },
          { role: 'user', content: rawText },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        source: 'instant-fallback',
        sprints: sliceBrainDumpToSprints(rawText),
      });
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({
        source: 'instant-fallback',
        sprints: sliceBrainDumpToSprints(rawText),
      });
    }

    const parsed = JSON.parse(jsonMatch[0]) as Array<Partial<MicroSprint>>;
    const normalized: MicroSprint[] = parsed.map((item, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      parentTask: item.parentTask || rawText.slice(0, 40),
      title: item.title || 'Focused micro-sprint',
      durationMinutes: [10, 15, 20].includes(Number(item.durationMinutes))
        ? Number(item.durationMinutes)
        : 15,
      energyRequired: (['low', 'medium', 'high'].includes(String(item.energyRequired))
        ? item.energyRequired
        : 'medium') as EnergyLevel,
      category: (['study', 'build', 'life', 'creative'].includes(String(item.category))
        ? item.category
        : 'study') as TaskCategory,
      completed: false,
    }));

    return NextResponse.json({ source: 'anakin-ai', sprints: normalized });
  } catch {
    return NextResponse.json(
      { error: 'Failed to slice tasks' },
      { status: 500 }
    );
  }
}
