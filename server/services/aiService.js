/**
 * TeamPulse AI Assistant Service
 * Dual-engine architecture:
 * 1. Live LLM Generation via Google Gemini (gemini-1.5-flash) or OpenAI (gpt-4o-mini)
 * 2. Smart Dynamic Heuristic Engine with comprehensive entity recognition (members, projects, risks, hours)
 * Strictly complies with assignment privacy rules: draft reports are excluded from context.
 */

/**
 * Calls Google Gemini REST API using native fetch
 */
async function callGeminiApi(prompt, systemInstruction, apiKey) {
  const key = (apiKey || '').trim();
  if (!key.startsWith('AIzaSy')) {
    throw new Error('Invalid Gemini API Key format. Google AI Studio keys must start with "AIzaSy...". Please generate a free key at https://aistudio.google.com/app/apikey');
  }

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let lastError = null;

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Gemini (${model}) responded with ${res.status}: ${errData?.error?.message || res.statusText}`);
      }

      const data = await res.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error(`Gemini (${model}) returned an empty response.`);
      }

      return {
        text: candidateText,
        modelName: model === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' : 'Gemini 1.5 Flash'
      };
    } catch (err) {
      lastError = err;
      if (!err.message.includes('404')) {
        break;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error('Gemini API call failed.');
}

/**
 * Calls OpenAI Chat Completions REST API using native fetch
 */
async function callOpenAiApi(prompt, systemInstruction, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1200
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API responded with ${res.status}: ${errData?.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const candidateText = data?.choices?.[0]?.message?.content;
    if (!candidateText) {
      throw new Error('OpenAI returned an empty response.');
    }

    return candidateText;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Clean up text output to ensure no raw markdown symbols clutter the UI
 */
function cleanFormatting(text) {
  if (!text) return '';
  return text
    .replace(/###\s*/g, '')
    .replace(/##\s*/g, '')
    .replace(/#\s*/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

/**
 * Smart Dynamic Heuristic Engine:
 * Analyzes query intent across team members, projects, deadlines/risks,
 * blockers, workload, compliance, and greetings.
 */
function generateSmartLocalSummary(reports, query = '', allUsers = [], allProjects = [], weekNumber, year) {
  const qLower = query.toLowerCase().trim();

  // 1. Greetings & Meta Info
  if (/^(hi|hello|hey|greetings|who are you|help|what can you do)/i.test(qLower)) {
    return `Hello! I am your TeamPulse AI Assistant for Week ${weekNumber || ''}, ${year || ''}.\n\n` +
      `Here are some questions I can answer:\n` +
      `• "What did [team member name] work on this week?"\n` +
      `• "Are there any blockers for [project name]?"\n` +
      `• "Give me an executive summary of this week's progress."\n` +
      `• "Which tasks are at risk of missing deadlines?"\n` +
      `• "How was the workload distributed across projects?"\n` +
      `• "What were the key achievements this week?"\n` +
      `• "Who has submitted reports so far?"\n\n` +
      `Feel free to ask any specific question about your team!`;
  }

  // 2. Question about a specific team member (e.g. David, Sarah, Elena, Marcus)
  for (const user of allUsers) {
    const firstName = user.name.split(' ')[0].toLowerCase();
    const fullName = user.name.toLowerCase();

    if (qLower.includes(firstName) || qLower.includes(fullName)) {
      const userReport = reports.find(
        (r) => r.userId && (r.userId._id?.toString() === user._id?.toString() || r.userId.name?.toLowerCase() === fullName)
      );

      if (!userReport) {
        return `Weekly Status for ${user.name}\n\n` +
          `${user.name} (${user.title || user.role}) has not submitted a weekly report for Week ${weekNumber}, ${year} yet (Status: Not Started or In-Progress Draft).\n\n` +
          `Tip: Once their report is submitted, I can provide a breakdown of their completed tasks, hours logged, and blockers.`;
      }

      const projName = userReport.projectId?.name || 'General';
      const tasks = (userReport.tasksCompleted || []).filter((t) => t.status === 'Done');
      const inProg = (userReport.tasksCompleted || []).filter((t) => t.status === 'In Progress');
      const userBlockers = (userReport.blockers || []).filter((b) => !b.isResolved);
      const userAchieve = userReport.achievements || [];
      const totalLoggedHours = Object.values(userReport.hoursBreakdown || {}).reduce((acc, h) => acc + (h || 0), 0);

      let response = `Weekly Summary: ${user.name}\n\n`;
      response += `Project: ${projName}\n`;
      response += `Submission Status: ${userReport.status} (Version ${userReport.version || 1})\n`;
      response += `Total Logged Hours: ${totalLoggedHours}h\n\n`;

      response += `Completed Tasks:\n`;
      if (tasks.length > 0) {
        tasks.forEach((t) => {
          response += `• ${t.taskName} (${t.timeSpent || t.plannedTime || 0}h, Priority: ${t.priority || 'Medium'})\n`;
        });
      } else {
        response += `• No completed tasks logged.\n`;
      }

      if (inProg.length > 0) {
        response += `\nIn-Progress Tasks:\n`;
        inProg.forEach((t) => {
          response += `• ${t.taskName} (Priority: ${t.priority || 'Medium'})\n`;
        });
      }

      if (userBlockers.length > 0) {
        response += `\nOpen Blockers:\n`;
        userBlockers.forEach((b) => {
          response += `• ${b.description} (Impact: ${b.impact || 'Medium'}${b.isKeyIssue ? ', Key Issue' : ''})\n`;
        });
      } else {
        response += `\nBlockers:\n• No active blockers reported.\n`;
      }

      if (userAchieve.length > 0) {
        response += `\nKey Achievements:\n`;
        userAchieve.forEach((a) => {
          response += `• ${a.description}\n`;
        });
      }

      return response;
    }
  }

  // 3. Question about a specific project (e.g. Client A, R&D, Internal Tooling, Marketing Analytics)
  for (const proj of allProjects) {
    const projNameLower = proj.name.toLowerCase();
    const parts = projNameLower.split(' - ').map((s) => s.trim());
    const isMatch =
      qLower.includes(projNameLower) ||
      (proj.code && qLower.includes(proj.code.toLowerCase())) ||
      parts.some((p) => p.length >= 3 && qLower.includes(p));

    if (isMatch) {
      const projReports = reports.filter(
        (r) =>
          r.projectId &&
          (r.projectId._id?.toString() === proj._id?.toString() ||
            r.projectId.name?.toLowerCase() === projNameLower ||
            parts.some((p) => r.projectId.name?.toLowerCase().includes(p)))
      );

      if (projReports.length === 0) {
        return `Project Status: ${proj.name}\n\n` +
          `No submitted reports associated with ${proj.name} for Week ${weekNumber}, ${year}.\n` +
          `Active project status in workspace: ${proj.status || 'Active'}.`;
      }

      const membersOnProj = projReports.map((r) => r.userId?.name).filter(Boolean);
      const projTasks = [];
      const projBlockers = [];

      projReports.forEach((r) => {
        (r.tasksCompleted || []).forEach((t) => {
          projTasks.push({ member: r.userId?.name, task: t.taskName, status: t.status, hours: t.timeSpent || 0 });
        });
        (r.blockers || []).forEach((b) => {
          if (!b.isResolved) projBlockers.push({ member: r.userId?.name, text: b.description, impact: b.impact });
        });
      });

      let response = `Project Analysis: ${proj.name}\n\n`;
      response += `Assigned Members Reporting: ${membersOnProj.join(', ')}\n\n`;

      response += `Tasks Logged:\n`;
      if (projTasks.length > 0) {
        projTasks.slice(0, 5).forEach((t) => {
          response += `• ${t.member}: ${t.task} (${t.status}, ${t.hours}h)\n`;
        });
      } else {
        response += `• No tasks logged.\n`;
      }

      response += `\nProject Blockers:\n`;
      if (projBlockers.length > 0) {
        projBlockers.forEach((b) => {
          response += `• ${b.member}: ${b.text} (Impact: ${b.impact || 'High'})\n`;
        });
      } else {
        response += `• No open blockers reported for this project.\n`;
      }

      return response;
    }
  }

  // 4. Questions about deadlines, risks, or delays
  if (qLower.includes('risk') || qLower.includes('deadline') || qLower.includes('delay') || qLower.includes('behind')) {
    const highPriorityTasks = [];
    const keyBlockers = [];

    reports.forEach((r) => {
      (r.tasksCompleted || []).forEach((t) => {
        if ((t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Done') {
          highPriorityTasks.push({ member: r.userId?.name, task: t.taskName, priority: t.priority });
        }
      });
      (r.blockers || []).forEach((b) => {
        if (!b.isResolved) {
          keyBlockers.push({ member: r.userId?.name, text: b.description, impact: b.impact || 'High' });
        }
      });
    });

    let response = `Deadline & Risk Assessment\n\n`;
    if (highPriorityTasks.length === 0 && keyBlockers.length === 0) {
      response += `All critical milestones are currently on track! No urgent incomplete tasks or critical impediments were reported for Week ${weekNumber}.\n`;
    } else {
      if (keyBlockers.length > 0) {
        response += `Active Blockers Threatening Delivery:\n`;
        keyBlockers.forEach((b) => {
          response += `• ${b.member}: ${b.text} (Impact: ${b.impact})\n`;
        });
        response += `\n`;
      }
      if (highPriorityTasks.length > 0) {
        response += `High/Urgent Tasks In-Progress:\n`;
        highPriorityTasks.forEach((t) => {
          response += `• ${t.member}: ${t.task} [${t.priority}]\n`;
        });
        response += `\n`;
      }
      response += `Recommendation: Discuss these items during sprint standup to reallocate resources or clear external dependencies.`;
    }
    return response;
  }

  // 5. Questions about blockers
  if (qLower.includes('blocker') || qLower.includes('issue') || qLower.includes('problem') || qLower.includes('obstacle')) {
    const allBlockers = [];
    reports.forEach((r) => {
      (r.blockers || []).forEach((b) => {
        if (b.description && !b.isResolved) {
          allBlockers.push({ member: r.userId?.name, text: b.description, isKey: b.isKeyIssue, impact: b.impact });
        }
      });
    });

    if (allBlockers.length === 0) {
      return `Team Blocker Analysis\n\nNo open blockers were reported for Week ${weekNumber}! The team is operating without impediments.`;
    }

    const keyIssues = allBlockers.filter((b) => b.isKey);
    let response = `Team Blocker Analysis\n\n` +
      `There are ${allBlockers.length} active blocker(s) flagged across the team for Week ${weekNumber}:\n\n`;

    if (keyIssues.length > 0) {
      response += `Key Issues Flagged:\n` +
        keyIssues.map((k) => `• ${k.member}: ${k.text} (Impact: ${k.impact || 'High'})`).join('\n') + `\n\n`;
    }

    response += `Other Blockers:\n` +
      allBlockers.filter((b) => !b.isKey).map((b) => `• ${b.member}: ${b.text}`).join('\n') +
      `\n\nRecommendation: Address key issues immediately to maintain sprint velocity.`;

    return response;
  }

  // 6. Questions about workload, hours, distribution
  if (qLower.includes('workload') || qLower.includes('hours') || qLower.includes('time') || qLower.includes('distribution')) {
    let totalHours = 0;
    const hoursByType = { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 };
    const projectTasks = {};

    reports.forEach((r) => {
      const projName = r.projectId?.name || 'General';
      (r.tasksCompleted || []).forEach(() => {
        projectTasks[projName] = (projectTasks[projName] || 0) + 1;
      });
      if (r.hoursBreakdown) {
        Object.keys(hoursByType).forEach((k) => {
          hoursByType[k] += r.hoursBreakdown[k] || 0;
          totalHours += r.hoursBreakdown[k] || 0;
        });
      }
    });

    const projLines = Object.entries(projectTasks).map(([p, count]) => `• ${p}: ${count} task(s)`).join('\n');
    return `Workload & Time Allocation\n\n` +
      `Total logged team hours: ${totalHours} hours across ${reports.length} submitted reports.\n\n` +
      `Task Distribution by Project:\n${projLines || '• No tasks logged'}\n\n` +
      `Time by Task Type:\n` +
      `• Development: ${hoursByType.development}h (${totalHours > 0 ? Math.round((hoursByType.development / totalHours) * 100) : 0}%)\n` +
      `• Testing: ${hoursByType.testing}h\n` +
      `• Meetings: ${hoursByType.meetings}h\n` +
      `• Documentation: ${hoursByType.documentation}h\n` +
      `• Other: ${hoursByType.other}h`;
  }

  // 7. Questions about achievements & highlights
  if (qLower.includes('achievement') || qLower.includes('highlight') || qLower.includes('win') || qLower.includes('done')) {
    const achievements = [];
    reports.forEach((r) => {
      (r.achievements || []).forEach((a) => {
        if (a.description) {
          achievements.push({ member: r.userId?.name, text: a.description, isKey: a.isKeyAchievement });
        }
      });
    });

    return `Team Highlights & Achievements\n\n` +
      (achievements.length > 0
        ? achievements.map((a) => `• ${a.isKey ? '⭐ ' : ''}${a.member}: ${a.text}`).join('\n')
        : '• Steady progress across active sprints; no specific key achievements logged.');
  }

  // 8. Questions about submission compliance
  if (qLower.includes('submit') || qLower.includes('compliance') || qLower.includes('who') || qLower.includes('roster')) {
    const submittedMemberIds = new Set(reports.map((r) => r.userId?._id?.toString()));
    const submittedNames = reports.map((r) => r.userId?.name).filter(Boolean);
    const missingMembers = allUsers
      .filter((u) => u.role === 'member' && !submittedMemberIds.has(u._id?.toString()))
      .map((u) => u.name);

    return `Weekly Submission Compliance\n\n` +
      `Submitted Reports (${submittedNames.length}):\n` +
      (submittedNames.map((n) => `• ${n}: Submitted`).join('\n') || '• None yet') + `\n\n` +
      `Pending Members (${missingMembers.length}):\n` +
      (missingMembers.map((n) => `• ${n}: Not Submitted / In-Progress Draft`).join('\n') || '• All active members have submitted on time!');
  }

  // 9. Default: Executive Summary
  const completedTasks = [];
  const blockers = [];
  const achievements = [];
  let totalHours = 0;
  const projectTasks = {};

  reports.forEach((r) => {
    const memberName = r.userId?.name || 'Member';
    const projName = r.projectId?.name || 'General';

    (r.tasksCompleted || []).forEach((t) => {
      if (t.status === 'Done') {
        completedTasks.push(`${memberName} - "${t.taskName}"`);
      }
      projectTasks[projName] = (projectTasks[projName] || 0) + 1;
    });

    (r.blockers || []).forEach((b) => {
      if (b.description && !b.isResolved) blockers.push({ member: memberName, text: b.description });
    });

    (r.achievements || []).forEach((a) => {
      if (a.description) achievements.push({ member: memberName, text: a.description });
    });

    if (r.hoursBreakdown) {
      Object.values(r.hoursBreakdown).forEach((h) => {
        totalHours += h || 0;
      });
    }
  });

  return `Weekly Executive Summary\n\n` +
    `Overview:\n${reports.length} report(s) submitted across team members, completing ${completedTasks.length} tasks with ${totalHours} total hours logged for Week ${weekNumber}.\n\n` +
    `Key Achievements:\n` +
    (achievements.slice(0, 3).map((a) => `• ${a.member}: ${a.text}`).join('\n') || '• Steady progress across active sprints.') + `\n\n` +
    `Current Blockers:\n` +
    (blockers.length > 0
      ? blockers.slice(0, 3).map((b) => `• ${b.member}: ${b.text}`).join('\n')
      : '• No critical blockers reported this week.') + `\n\n` +
    `Workload Distribution:\n` +
    Object.entries(projectTasks).map(([p, count]) => `• ${p}: ${count} tasks completed/in-progress`).join('\n') + `\n\n` +
    `Tip: Ask specific questions like "What did David work on?" or "Are there any blockers for Client A?".`;
}

/**
 * Main AI Assistant Orchestrator
 */
async function processAiQuery({ reports, query, weekNumber, year, allUsers = [], allProjects = [] }) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  // Prepare structured context for LLM
  const contextSummary = reports.map((r) => ({
    member: r.userId?.name,
    email: r.userId?.email,
    title: r.userId?.title,
    project: r.projectId?.name || 'General',
    status: r.status,
    tasks: (r.tasksCompleted || []).map((t) => ({
      name: t.taskName,
      status: t.status,
      priority: t.priority,
      hours: t.timeSpent || t.plannedTime || 0
    })),
    blockers: (r.blockers || []).map((b) => ({
      description: b.description,
      isResolved: b.isResolved,
      impact: b.impact,
      isKeyIssue: b.isKeyIssue
    })),
    achievements: (r.achievements || []).map((a) => ({
      description: a.description,
      isKey: a.isKeyAchievement
    })),
    hours: r.hoursBreakdown
  }));

  const systemInstruction = `You are TeamPulse AI Assistant, an enterprise weekly report intelligence assistant.
You are embedded in TeamPulse, a Weekly Report Generator & Team Dashboard platform.
You analyze team progress, tasks completed, blockers, workload distribution, and achievements for Week ${weekNumber}, ${year}.

CRITICAL RULES:
1. Ground every answer STRICTLY in the provided weekly reports context below. Never invent team members or tasks.
2. If a user asks about a team member or project that did not submit a report or does not exist in the context, clearly and politely inform them.
3. Be professional, concise, and structured.
4. DO NOT output raw markdown headers (e.g. ###, ##) or asterisks (**word**). Use clean bullet points (•) and clear labels (e.g. Overview:, Key Achievements:, Current Blockers:, Workload Distribution:).
5. Highlight critical blockers or urgent items proactively.

WEEKLY REPORTS CONTEXT (WEEK ${weekNumber}, ${year}):
${JSON.stringify(contextSummary, null, 2)}

ACTIVE TEAM ROSTER:
${JSON.stringify(allUsers.map((u) => ({ name: u.name, role: u.role, title: u.title })), null, 2)}

ACTIVE PROJECTS:
${JSON.stringify(allProjects.map((p) => ({ name: p.name, code: p.code })), null, 2)}`;

  // 1. Try Gemini if configured
  if (geminiKey) {
    try {
      const geminiReply = await callGeminiApi(query, systemInstruction, geminiKey);
      return {
        reply: cleanFormatting(geminiReply.text || geminiReply),
        engine: 'gemini',
        modelName: geminiReply.modelName || 'Gemini 1.5 Flash'
      };
    } catch (err) {
      console.warn('[TeamPulse AI] Gemini API call failed, falling back to smart heuristic:', err.message);
    }
  }

  // 2. Try OpenAI if configured
  if (openAiKey) {
    try {
      const openAiReply = await callOpenAiApi(query, systemInstruction, openAiKey);
      return {
        reply: cleanFormatting(openAiReply),
        engine: 'openai',
        modelName: 'GPT-4o Mini'
      };
    } catch (err) {
      console.warn('[TeamPulse AI] OpenAI API call failed, falling back to smart heuristic:', err.message);
    }
  }

  // 3. Smart Heuristic Engine fallback (guaranteed to succeed offline or without external keys)
  const localReply = generateSmartLocalSummary(reports, query, allUsers, allProjects, weekNumber, year);
  return {
    reply: localReply,
    engine: 'smart_heuristic',
    modelName: 'TeamPulse Intelligence Engine'
  };
}

module.exports = {
  processAiQuery,
  generateSmartLocalSummary
};
