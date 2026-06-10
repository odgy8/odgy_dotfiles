import { createPoll } from "ags/time";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isoWeek(d: Date): number {
  const tmp = new Date(d.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const jan4 = new Date(tmp.getFullYear(), 0, 4);
  return 1 + Math.round(((tmp.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
}

function Clock() {
  const clock = createPoll("", 1000, () => {
    const d = new Date();
    const month = MONTHS[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const week = isoWeek(d);
    const monthNum = d.getMonth() + 1;
    return `${month} ${day}, ${year} · ${hh}:${mm} · <span size="small" alpha="70%">W${week} M${monthNum}</span>`;
  });

  return <label label={clock} useMarkup />;
}

export default Clock;
