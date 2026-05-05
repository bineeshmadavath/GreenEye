import { MapPin, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const barData = [
  { name: 'Jan', value: 7 },
  { name: 'Feb', value: 5 },
  { name: 'Mar', value: 8 },
  { name: 'Apr', value: 2 },
  { name: 'May', value: 7 },
  { name: 'Jun', value: 9 },
  { name: 'Jul', value: 6 },
  { name: 'Aug', value: 4 },
  { name: 'Sep', value: 8 },
  { name: 'Oct', value: 6 },
  { name: 'Nov', value: 8 },
  { name: 'Dec', value: 3 },
];

const pieData = [
  { name: 'Total Events', value: 75, color: '#f1f5f9' },
  { name: 'Events Participated', value: 25, color: '#10b981' },
];

export default function MyActivities() {
  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="p-4 flex flex-col gap-6 max-w-md mx-auto">
        
        {/* Recent Activity */}
        <div>
          <h2 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Recent Activity</h2>
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 flex items-start gap-4 border-b border-slate-100">
              <div className="mt-1">
                <MapPin className="text-emerald-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-800">Ernakulam</h3>
                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-md mt-1 mb-2">
                  Not Resolved
                </span>
                <p className="text-xs text-slate-500">29-04-2025 | 02:30 PM</p>
              </div>
            </div>
            <button className="w-full py-3.5 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium">
              <MessageSquare size={16} className="text-emerald-500" />
              Resend Request
            </button>
          </div>
        </div>

        {/* Issues Reported Chart */}
        <div>
          <h2 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Issues reported - Last Month</h2>
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  angle={-45}
                  textAnchor="end"
                  height={40}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events Participated Chart */}
        <div>
          <h2 className="text-[13px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Events Participated</h2>
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 h-64 flex flex-col">
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-slate-500 font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
