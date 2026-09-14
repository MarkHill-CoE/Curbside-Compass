import re

with open('src/components/NeighborhoodSimulation.tsx', 'r') as f:
    content = f.read()

# 1. Remove recharts imports
import_target = """import { Volume2, VolumeX, Sliders, RefreshCw, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';"""
import_replacement = """import { Volume2, VolumeX, Sliders, RefreshCw, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';"""
content = content.replace(import_target, import_replacement)

# 2. Remove history state
state_target = """  const [curbsidePct, setCurbsidePct] = useState<number>(0);
  const [occupancyHistory, setOccupancyHistory] = useState<{ time: string; occupancy: number }[]>([]);
  const lastHistoryUpdateRef = useRef<number>(0);"""
state_replacement = """  const [curbsidePct, setCurbsidePct] = useState<number>(0);"""
content = content.replace(state_target, state_replacement)

# 3. Remove state update in animate loop
animate_target = """      setCurbsideDemandCount(curbsideDemand);
      const newCurbsidePct = Math.round(gaugePercent);
      setCurbsidePct(newCurbsidePct);

      const _now = performance.now();
      if (_now - lastHistoryUpdateRef.current > 1000) {
        lastHistoryUpdateRef.current = _now;
        setOccupancyHistory(prev => {
          const newEntry = { time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), occupancy: newCurbsidePct };
          const nextHistory = [...prev, newEntry];
          if (nextHistory.length > 25) return nextHistory.slice(nextHistory.length - 25);
          return nextHistory;
        });
      }"""
animate_replacement = """      setCurbsideDemandCount(curbsideDemand);
      setCurbsidePct(Math.round(gaugePercent));"""
content = content.replace(animate_target, animate_replacement)

# 4. Remove chart from UI
ui_target = """          {/* Occupancy Dynamic Chart */}
          <div className="bg-[#193A5A]/90 backdrop-blur-md border border-[#0081BC]/40 p-1 sm:p-2 rounded-md sm:rounded-lg shadow-lg flex flex-col items-center w-full min-w-[120px] max-w-[160px] h-[70px] sm:h-[85px] transition-all">
            <span className="text-[7px] sm:text-[9px] font-bold text-gray-300 w-full text-left mb-0.5 sm:mb-1">Occupancy Trend</span>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={curbsidePct >= 100 ? '#E8552D' : '#009A44'} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={curbsidePct >= 100 ? '#E8552D' : '#009A44'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <YAxis domain={[0, 'dataMax + 20']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11283f', border: '1px solid #0081BC', fontSize: '10px', color: '#fff', padding: '4px' }} 
                  itemStyle={{ color: '#fff' }} 
                  labelStyle={{ display: 'none' }}
                  isAnimationActive={false}
                  formatter={(value: number) => [`${value}%`, 'Occupancy']}
                />
                <Area 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke={curbsidePct >= 100 ? '#E8552D' : '#009A44'} 
                  fillOpacity={1} 
                  fill="url(#colorOccupancy)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Curbside Dial Gauge - 33% reduced on mobile */}"""
ui_replacement = """          {/* Compact Curbside Dial Gauge - 33% reduced on mobile */}"""
content = content.replace(ui_target, ui_replacement)

with open('src/components/NeighborhoodSimulation.tsx', 'w') as f:
    f.write(content)
print("Removed chart")
