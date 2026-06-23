import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Monthly revenue", value: "$48,290", delta: "▲ 12.4% vs last month" },
  { label: "Active users", value: "2,847", delta: "▲ 5.1% vs last month" },
  { label: "Subscriptions", value: "1,204", delta: "▲ 3.2% vs last month" },
  { label: "Churn rate", value: "1.8%", delta: "▼ 0.4% vs last month" },
];

const chartValues = [28, 34, 31, 42, 38, 49, 46, 58, 54, 63, 71, 82];
const months = [
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
];
const chartMax = Math.max(...chartValues);

const activity = [
  { who: "MC", text: "Mara Chen upgraded the workspace to Pro", time: "2 hours ago" },
  { who: "SY", text: "New subscription from Skyline Co — $99/mo", time: "4 hours ago" },
  { who: "DO", text: "Devin Okafor invited 2 new members", time: "5 hours ago" },
  { who: "PN", text: "Priya Nair updated billing details", time: "yesterday" },
  { who: "SI", text: "Sasha Idris changed a member role to Admin", time: "2 days ago" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-[18px]">
        {stats.map((s) => (
          <Card key={s.label} className="p-[18px]">
            <div className="text-[12.5px] font-medium text-muted-foreground">
              {s.label}
            </div>
            <div className="mb-1.5 mt-[7px] text-[27px] font-bold tracking-[-0.02em]">
              {s.value}
            </div>
            <div className="text-xs font-semibold text-good">{s.delta}</div>
          </Card>
        ))}
      </div>

      {/* Revenue + Activity */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-[18px]">
        {/* Revenue chart */}
        <Card className="p-5">
          <div className="mb-[18px] flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold">Revenue</div>
              <div className="text-[12.5px] text-muted-foreground">
                Monthly recurring revenue, last 12 months
              </div>
            </div>
            <div className="rounded-[7px] bg-good-soft px-2.5 py-1.5 text-xs font-semibold text-good">
              +12.4%
            </div>
          </div>
          <div className="flex h-[170px] items-end gap-2 pt-2">
            {chartValues.map((v, i) => {
              const isLast = i === chartValues.length - 1;
              return (
                <div
                  key={i}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className={cn(
                      "w-full rounded-t-[6px] rounded-b-[3px]",
                      isLast
                        ? "bg-primary"
                        : "border border-primary-border bg-primary-soft"
                    )}
                    style={{
                      height: `${(v / chartMax) * 100}%`,
                      minHeight: "4px",
                    }}
                  />
                  <span className="font-mono text-[10px] text-faint">
                    {months[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <div className="mb-3.5 text-[15px] font-semibold">Recent activity</div>
          <div className="flex flex-col gap-0.5">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-[11px] py-[9px]">
                <div className="flex size-[30px] flex-none items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
                  {a.who}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] leading-[1.45]">{a.text}</div>
                  <div className="mt-px text-[11.5px] text-faint">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
