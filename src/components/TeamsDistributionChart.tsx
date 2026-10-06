import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BarChart3, Building2, Layers, Users, Info } from 'lucide-react';

interface SegmentItem {
  name: string;
  shortName: string;
  teamsCount: number;
  teams: string[];
  color: string;
}

const DEFAULT_DEPARTMENT_DATA: SegmentItem[] = [
  {
    name: 'Apparel Engineering',
    shortName: 'AE',
    teamsCount: 2,
    teams: ['Nemesis', 'Think Tankers'],
    color: '#10B981', // Emerald
  },
  {
    name: 'Wet Process Engineering',
    shortName: 'WPE',
    teamsCount: 2,
    teams: ['TRIWEAR', 'TITAN'],
    color: '#06B6D4', // Cyan
  },
  {
    name: 'Yarn Engineering',
    shortName: 'YE',
    teamsCount: 2,
    teams: ['Sugar Gliders', 'Eco Warriors'],
    color: '#F59E0B', // Amber
  },
  {
    name: 'Fabric Engineering',
    shortName: 'FE',
    teamsCount: 1,
    teams: ['Grean Weavers'],
    color: '#8B5CF6', // Purple
  },
];

const DEFAULT_INSTITUTION_DATA: SegmentItem[] = [
  {
    name: 'Barishal Textile Engineering College (BTEC)',
    shortName: 'BTEC (Main)',
    teamsCount: 7,
    teams: [
      'Nemesis',
      'Think Tankers',
      'Grean Weavers',
      'TRIWEAR',
      'Sugar Gliders',
      'Eco Warriors',
      'TITAN',
    ],
    color: '#059669', // Emerald
  },
];

export const TeamsDistributionChart: React.FC = () => {
  const [segmentMode, setSegmentMode] = useState<'department' | 'institution'>('department');
  const [deptData, setDeptData] = useState<SegmentItem[]>(DEFAULT_DEPARTMENT_DATA);
  const [instData, setInstData] = useState<SegmentItem[]>(DEFAULT_INSTITUTION_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/registrations/department-stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            if (Array.isArray(json.byDepartment) && json.byDepartment.length > 0) {
              setDeptData(json.byDepartment);
            }
            if (Array.isArray(json.byInstitution) && json.byInstitution.length > 0) {
              setInstData(json.byInstitution);
            }
          }
        }
      } catch (_) {
        // Fallback to default stats if network fails
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentChartData = segmentMode === 'department' ? deptData : instData;
  const totalTeams = currentChartData.reduce((acc, curr) => acc + curr.teamsCount, 0);

  // Custom high-contrast tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: SegmentItem = payload[0].payload;
      return (
        <div className="bg-[#0A192F]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-white max-w-xs z-50">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            <p className="font-bold text-xs text-slate-100">{item.name}</p>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-black text-emerald-400">
              {item.teamsCount}
            </span>
            <span className="text-xs text-slate-400">
              {item.teamsCount === 1 ? 'Registered Team' : 'Registered Teams'}
            </span>
          </div>
          {item.teams && item.teams.length > 0 && (
            <div className="pt-2 border-t border-slate-700/50">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Participating Teams:
              </p>
              <div className="flex flex-wrap gap-1">
                {item.teams.map((t) => (
                  <span
                    key={t}
                    className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700/50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };
    return null;
  };

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto select-none">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 relative overflow-hidden transition-all">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Header with Title and Segment Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold tracking-wide uppercase mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registration Analytics</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] font-['Outfit'] tracking-tight">
              Team Distribution Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comparative analysis of registered teams across segments
            </p>
          </div>

          {/* Segment Selector Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100/90 border border-slate-200 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setSegmentMode('department')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                segmentMode === 'department'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Department</span>
            </button>
            <button
              type="button"
              onClick={() => setSegmentMode('institution')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                segmentMode === 'institution'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>By Institution</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Teams
              </span>
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#0A192F] font-['Outfit']">
              {totalTeams}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              100% Verified
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Departments
              </span>
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <p className="text-2xl font-black text-[#0A192F] font-['Outfit']">
              {deptData.length}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              AE • WPE • YE • FE
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Top Segment
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#0A192F] truncate">
              {segmentMode === 'department' ? 'AE / WPE / YE' : 'BTEC Campus'}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              Highest representation
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Institution
              </span>
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#0A192F] truncate">
              BTEC
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              Barishal Textile Eng.
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="h-[280px] sm:h-[320px] w-full min-w-0 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentChartData}
              margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey={segmentMode === 'department' ? 'name' : 'shortName'}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                interval={0}
                tick={({ x, y, payload }: any) => {
                  const val = payload.value;
                  // Abbreviate for compact mobile screens if department mode
                  const label =
                    segmentMode === 'department'
                      ? val.length > 15
                        ? val.replace('Engineering', 'Eng.').replace('Process', 'Proc.')
                        : val
                      : val;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={14}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize={11}
                        fontWeight={600}
                      >
                        {label}
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax: number) => Math.max(dataMax + 1, 4)]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
              <Bar
                dataKey="teamsCount"
                name="Teams Count"
                radius={[8, 8, 0, 0]}
                maxBarSize={segmentMode === 'department' ? 56 : 90}
              >
                {currentChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-300 hover:opacity-85"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Footnote */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            {currentChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-600 text-[11px]">
                  {item.shortName}: <strong className="text-slate-800">{item.teamsCount}</strong>
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Hover or tap bars for detailed team lists</span>
          </div>
        </div>
      </div>
    </section>
  );
};
