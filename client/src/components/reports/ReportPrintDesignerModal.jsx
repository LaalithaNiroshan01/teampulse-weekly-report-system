import React, { useState } from 'react';
import {
  Printer,
  X,
  Check,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock,
  ExternalLink,
  Settings2,
  Eye
} from 'lucide-react';

export const ReportPrintDesignerModal = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  // Customization state
  const [logoChoice, setLogoChoice] = useState('color'); // 'color' | 'mono' | 'text'
  const [density, setDensity] = useState('standard'); // 'standard' | 'compact'
  const [classification, setClassification] = useState('CONFIDENTIAL — INTERNAL USE ONLY');
  const [sections, setSections] = useState({
    completedTasks: true,
    plannedTasks: true,
    blockers: true,
    achievements: true,
    hoursBreakdown: true,
    notesAndLinks: true,
    managerFeedback: Boolean(report.latestReviewComment),
    signatures: true
  });

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const handlePrint = () => {
    const printContent = document.getElementById('printable-report-document');
    if (!printContent) return;

    setIsPreparingPrint(true);

    // Create an isolated invisible iframe for high-fidelity printing
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Weekly Report Print Canvas');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '1000px';
    iframe.style.height = '1414px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    // Grab all stylesheets and style tags from current document (Vite & Tailwind)
    const styleTags = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Weekly Report - Week ${report.weekNumber}, ${report.year}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
              width: 100% !important;
            }
            #printable-report-document {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              margin: 0 auto !important;
              padding: 8mm 5mm !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
            }
            .print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    const executePrint = () => {
      setIsPreparingPrint(false);
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print execution failed:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2500);
      }
    };

    // Ensure all images in iframe are loaded before triggering print preview
    const imgs = doc.querySelectorAll('img');
    let loadedCount = 0;
    const totalImgs = imgs.length;

    if (totalImgs === 0) {
      setTimeout(executePrint, 200);
    } else {
      let isExecuted = false;
      const onDone = () => {
        if (!isExecuted) {
          isExecuted = true;
          executePrint();
        }
      };

      imgs.forEach((img) => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === totalImgs) {
            setTimeout(onDone, 200);
          }
        } else {
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImgs) {
              setTimeout(onDone, 200);
            }
          };
        }
      });

      // Fallback timeout in case image events don't fire
      setTimeout(onDone, 600);
    }
  };

  // Format dates safely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const refCode = `TP-${report.year || new Date().getFullYear()}-W${String(
    report.weekNumber || 1
  ).padStart(2, '0')}-${(report._id || '000000').slice(-6).toUpperCase()}`;

  const totalCompletedHours =
    report.tasksCompleted?.reduce((sum, t) => sum + (Number(t.hoursSpent) || 0), 0) || 0;
  const totalPlannedHours =
    report.tasksPlannedNextWeek?.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0) || 0;

  const hoursObj = report.hoursBreakdown || {};
  const totalBreakdownHours =
    (Number(hoursObj.development) || 0) +
    (Number(hoursObj.codeReview) || 0) +
    (Number(hoursObj.meetings) || 0) +
    (Number(hoursObj.planning) || 0) +
    (Number(hoursObj.support) || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print-modal-container bg-slate-900/60 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="fixed inset-0 print-modal-backdrop" onClick={onClose} />

      {/* Main Modal Wrapper */}
      <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <div
          className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print-modal-inner"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Weekly Report Print Designer & Preview
                  </h2>
                  <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    A4 Executive Document
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {report.userId?.name} · Week {report.weekNumber}, {report.year} · Ref: {refCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPreparingPrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white transition cursor-pointer shadow-subtle"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isPreparingPrint ? 'Formatting A4 Document...' : 'Print / Save as PDF'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body: Split Controls & Live Document */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Left: Designer Controls Sidebar */}
            <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/80 p-5 overflow-y-auto no-print print-designer-sidebar shrink-0 text-xs space-y-6">
              {/* Logo Choice */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  Header Brand Logo
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setLogoChoice('color')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      logoChoice === 'color'
                        ? 'bg-white border-sky-500 ring-2 ring-sky-500/10 font-semibold text-slate-900'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src="/logo.png" alt="Color" className="h-5 w-auto object-contain" />
                      <span className="text-[11px]">Full Color (Default)</span>
                    </div>
                    {logoChoice === 'color' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoChoice('mono')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      logoChoice === 'mono'
                        ? 'bg-white border-sky-500 ring-2 ring-sky-500/10 font-semibold text-slate-900'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src="/logo2.png" alt="Mono" className="h-5 w-auto object-contain" />
                      <span className="text-[11px]">Monochrome Navy</span>
                    </div>
                    {logoChoice === 'mono' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoChoice('text')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      logoChoice === 'text'
                        ? 'bg-white border-sky-500 ring-2 ring-sky-500/10 font-semibold text-slate-900'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="font-bold text-slate-800 tracking-tight text-xs">
                      TeamPulse (Text Only)
                    </span>
                    {logoChoice === 'text' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                </div>
              </div>

              {/* Sections Toggle */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">
                  Sections to Include
                </label>
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                  {[
                    { key: 'completedTasks', label: '1. Completed Deliverables' },
                    { key: 'plannedTasks', label: '2. Next Week Planned Tasks' },
                    { key: 'blockers', label: '3. Blockers & Impediments' },
                    { key: 'achievements', label: '4. Highlights & Achievements' },
                    { key: 'hoursBreakdown', label: '5. Workload / Hours Allocation' },
                    { key: 'notesAndLinks', label: '6. Notes & Reference Links' },
                    { key: 'managerFeedback', label: 'Manager Review Feedback' },
                    { key: 'signatures', label: 'Signatures & Sign-off Block' }
                  ].map((s) => (
                    <label
                      key={s.key}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="text-slate-700 text-xs">{s.label}</span>
                      <input
                        type="checkbox"
                        checked={sections[s.key]}
                        onChange={() => toggleSection(s.key)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Density & Layout */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">
                  Document Spacing Density
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDensity('standard')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                      density === 'standard'
                        ? 'bg-white border-slate-900 text-slate-900 font-bold shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setDensity('compact')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                      density === 'compact'
                        ? 'bg-white border-slate-900 text-slate-900 font-bold shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    Compact (A4 fit)
                  </button>
                </div>
              </div>

              {/* Classification Footer */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1.5">
                  Footer Classification Label
                </label>
                <input
                  type="text"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-slate-900"
                  placeholder="CONFIDENTIAL"
                />
              </div>

              {/* Print Tip */}
              <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-100 text-[11px] text-sky-900 leading-relaxed">
                <p className="font-semibold mb-0.5 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  PDF Export Tip:
                </p>
                In the print preview window, choose <strong>"Save as PDF"</strong> as your destination to export this clean document directly.
              </div>

              {/* Sidebar Action Button */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPreparingPrint}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white transition cursor-pointer shadow-subtle"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>{isPreparingPrint ? 'Formatting A4 Document...' : 'Print A4 Document Now'}</span>
              </button>
            </div>

            {/* Right: Live A4 Document Preview */}
            <div className="flex-1 bg-slate-200/90 p-3 sm:p-6 lg:p-8 overflow-y-auto flex justify-center">
              {/* The Printed Document Canvas */}
              <div
                id="printable-report-document"
                className={`w-full max-w-[820px] bg-white text-slate-900 shadow-xl border border-slate-300 rounded-sm font-sans ${
                  density === 'compact' ? 'p-6 sm:p-8 text-[11px]' : 'p-8 sm:p-12 text-xs'
                }`}
                style={{ minHeight: '1050px' }}
              >
                {/* 1. Header with Brand & Document Title */}
                <div className="pb-5 border-b-2 border-slate-900 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {logoChoice === 'color' && (
                      <img
                        src="/logo.png"
                        alt="TeamPulse"
                        className="h-9 w-auto object-contain"
                      />
                    )}
                    {logoChoice === 'mono' && (
                      <img
                        src="/logo2.png"
                        alt="TeamPulse"
                        className="h-9 w-auto object-contain"
                      />
                    )}
                    {logoChoice === 'text' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                          TeamPulse
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Engineering
                        </span>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                      Weekly Performance, Deliverables & Status Report
                    </p>
                  </div>

                  <div className="text-right">
                    <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 leading-tight">
                      WEEKLY STATUS REPORT
                    </h1>
                    <div className="flex items-center justify-end gap-1.5 mt-1 text-[11px] font-semibold text-slate-700">
                      <span>WEEK {report.weekNumber}</span>
                      <span>·</span>
                      <span>{report.year}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      REF: {refCode}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Issued: {todayStr}
                    </p>
                  </div>
                </div>

                {/* 2. Formal Metadata Grid */}
                <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/90 p-3.5 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Team Member
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">{report.userId?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {report.userId?.title || report.userId?.department || 'Software Engineer'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Reporting Cycle
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      Week {report.weekNumber}, {report.year}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatDate(report.weekStartDate)} – {formatDate(report.weekEndDate)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Project / Category
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5 truncate">
                      {report.projectId?.name || 'General Operations'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {report.projectId?.code || 'GEN-01'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Report Status
                    </span>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        report.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : report.status === 'submitted'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : report.status === 'needs_correction'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {report.status?.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {totalCompletedHours}h logged
                    </p>
                  </div>
                </div>

                {/* Manager Feedback Banner (if enabled and present) */}
                {sections.managerFeedback && report.latestReviewComment && (
                  <div className="mb-5 p-3 rounded-lg border border-slate-300 bg-slate-50 print-avoid-break">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Manager Review Assessment & Notes:
                    </p>
                    <p className="text-xs italic text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                      "{report.latestReviewComment}"
                    </p>
                  </div>
                )}

                {/* 3. Section: Tasks Completed */}
                {sections.completedTasks && (
                  <div className="mb-6 print-avoid-break">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-300">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                        1. Tasks Completed & Verified Deliverables
                      </h2>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {report.tasksCompleted?.length || 0} tasks · {totalCompletedHours} hours
                      </span>
                    </div>

                    {report.tasksCompleted?.length > 0 ? (
                      <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100/90 text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                            <th className="py-1.5 px-2 border-r border-slate-200 w-8 text-center">#</th>
                            <th className="py-1.5 px-3 border-r border-slate-200">Task Description</th>
                            <th className="py-1.5 px-3 border-r border-slate-200">Verified Output / Deliverable</th>
                            <th className="py-1.5 px-2 border-r border-slate-200 w-16 text-center">Hours</th>
                            <th className="py-1.5 px-2 w-20 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          {report.tasksCompleted.map((task, idx) => (
                            <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                              <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                                {task.taskName}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                                {task.deliverable || <span className="text-slate-400 italic">Documented</span>}
                              </td>
                              <td className="py-2 px-2 border-r border-slate-200 text-center font-semibold text-slate-800">
                                {task.hoursSpent ? `${task.hoursSpent}h` : '—'}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  Done
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 text-xs font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan="3" className="py-1.5 px-3 text-right">
                              Total Completed Hours:
                            </td>
                            <td className="py-1.5 px-2 text-center font-mono">
                              {totalCompletedHours} hrs
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No completed tasks recorded.</p>
                    )}
                  </div>
                )}

                {/* 4. Section: Planned Tasks Next Week */}
                {sections.plannedTasks && (
                  <div className="mb-6 print-avoid-break">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-300">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-700" />
                        2. Planned Objectives for Next Week
                      </h2>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {report.tasksPlannedNextWeek?.length || 0} planned · ~{totalPlannedHours} est. hours
                      </span>
                    </div>

                    {report.tasksPlannedNextWeek?.length > 0 ? (
                      <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100/90 text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                            <th className="py-1.5 px-2 border-r border-slate-200 w-8 text-center">#</th>
                            <th className="py-1.5 px-3 border-r border-slate-200">Objective / Target Task</th>
                            <th className="py-1.5 px-3 border-r border-slate-200">Expected Deliverable</th>
                            <th className="py-1.5 px-2 border-r border-slate-200 w-16 text-center">Est. Hrs</th>
                            <th className="py-1.5 px-2 w-20 text-center">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          {report.tasksPlannedNextWeek.map((task, idx) => (
                            <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                              <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                                {task.taskName}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                                {task.deliverable || <span className="text-slate-400 italic">Target output</span>}
                              </td>
                              <td className="py-2 px-2 border-r border-slate-200 text-center font-semibold text-slate-800">
                                {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    task.priority === 'high'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : task.priority === 'low'
                                      ? 'bg-slate-50 text-slate-600 border-slate-200'
                                      : 'bg-sky-50 text-sky-700 border-sky-200'
                                  }`}
                                >
                                  {task.priority || 'medium'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No planned tasks recorded.</p>
                    )}
                  </div>
                )}

                {/* 5. Section: Blockers & Achievements (Side by Side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 print-avoid-break">
                  {/* Blockers */}
                  {sections.blockers && (
                    <div className="p-3 bg-white rounded border border-slate-300">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-700" />
                        3. Blockers & Impediments
                      </h2>
                      {report.blockers?.length > 0 ? (
                        <div className="space-y-2">
                          {report.blockers.map((b, i) => (
                            <div key={i} className="text-[11px] p-2 bg-slate-50 rounded border border-slate-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-900">{b.description}</span>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    b.severity === 'high'
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  {b.severity || 'medium'}
                                </span>
                              </div>
                              {b.impact && (
                                <p className="text-[10px] text-slate-600">
                                  <strong>Impact:</strong> {b.impact}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No active blockers reported. (All clear)</p>
                      )}
                    </div>
                  )}

                  {/* Achievements */}
                  {sections.achievements && (
                    <div className="p-3 bg-white rounded border border-slate-300">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-700" />
                        4. Highlights & Achievements
                      </h2>
                      {report.achievements?.length > 0 ? (
                        <div className="space-y-2">
                          {report.achievements.map((a, i) => (
                            <div key={i} className="text-[11px] p-2 bg-slate-50 rounded border border-slate-200">
                              <p className="font-semibold text-slate-900">{a.title}</p>
                              {a.description && (
                                <p className="text-[10px] text-slate-600 mt-0.5">{a.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Standard milestone progress achieved.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. Section: Hours Breakdown */}
                {sections.hoursBreakdown && (
                  <div className="mb-6 print-avoid-break">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-300">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                        5. Workload & Time Allocation Breakdown
                      </h2>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Total Logged: {totalBreakdownHours || totalCompletedHours} hours
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Dev / Coding</span>
                        <span className="text-sm font-bold text-slate-900">{hoursObj.development || 0}h</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Code Review</span>
                        <span className="text-sm font-bold text-slate-900">{hoursObj.codeReview || 0}h</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Meetings</span>
                        <span className="text-sm font-bold text-slate-900">{hoursObj.meetings || 0}h</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Architecture</span>
                        <span className="text-sm font-bold text-slate-900">{hoursObj.planning || 0}h</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Support & Bugs</span>
                        <span className="text-sm font-bold text-slate-900">{hoursObj.support || 0}h</span>
                      </div>
                      <div className="p-2 bg-slate-100 rounded border border-slate-300 font-bold">
                        <span className="text-[9px] font-bold text-slate-600 uppercase block">Total Hours</span>
                        <span className="text-sm font-black text-slate-900">
                          {totalBreakdownHours || totalCompletedHours}h
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Section: Notes & Links */}
                {sections.notesAndLinks && (report.notes || report.links?.length > 0) && (
                  <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-300 print-avoid-break">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200">
                      6. Additional Notes & Deliverable References
                    </h2>
                    {report.notes && (
                      <p className="text-[11px] text-slate-800 whitespace-pre-line mb-2 leading-relaxed">
                        {report.notes}
                      </p>
                    )}
                    {report.links?.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {report.links.map((l, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-slate-200 text-slate-700 font-mono"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            {l.title || l.url}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 8. Formal Authorization & Sign-off Block */}
                {sections.signatures && (
                  <div className="mt-8 pt-4 border-t-2 border-slate-300 print-avoid-break">
                    <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                      7. Formal Authorization & Verification
                    </h2>
                    <div className="grid grid-cols-2 gap-8">
                      {/* Prepared by */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-800">
                          Report Prepared & Submitted By:
                        </p>
                        <div className="border-b border-slate-400 h-10 flex items-end pb-1 font-serif text-slate-600 italic">
                          {report.userId?.name}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Signature</span>
                          <span>Date: {formatDate(report.createdAt || report.weekEndDate)}</span>
                        </div>
                      </div>

                      {/* Approved by */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-800">
                          Reviewed & Approved By:
                        </p>
                        <div className="border-b border-slate-400 h-10 flex items-end pb-1 font-serif text-slate-600 italic">
                          {report.status === 'approved' ? (
                            <span className="font-bold text-emerald-800 not-italic uppercase tracking-wider text-[11px]">
                              ✓ APPROVED · {report.reviewedBy?.name || 'Manager Reviewer'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] not-italic">
                              Pending Manager Signature
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Authorized Signature</span>
                          <span>
                            Date: {report.status === 'approved' ? formatDate(report.updatedAt) : '____/____/________'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Footer */}
                <div className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 tracking-wider">
                  <span>{classification}</span>
                  <span>TeamPulse Weekly Performance Workspace</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPrintDesignerModal;
