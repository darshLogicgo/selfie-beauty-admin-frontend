// Helper to compute date ranges for common presets
// Returns dates in YYYY-MM-DD format

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function getDateRangeForPreset(preset: string, refDate?: Date) {
  const now = refDate ? new Date(refDate) : new Date();
  // Normalize local timezone boundary
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let start: Date | null = null;
  let end: Date | null = null;

  switch (preset) {
    case "today":
      start = new Date(today);
      end = new Date(today);
      break;
    case "yesterday":
      start = new Date(yesterday);
      end = new Date(yesterday);
      break;
    case "last7":
      end = new Date(yesterday);
      start = new Date(end);
      start.setDate(end.getDate() - 6);
      break;
    case "last28":
      end = new Date(yesterday);
      start = new Date(end);
      start.setDate(end.getDate() - 27);
      break;
    case "last30":
      end = new Date(yesterday);
      start = new Date(end);
      start.setDate(end.getDate() - 29);
      break;
    case "last90":
      end = new Date(yesterday);
      start = new Date(end);
      start.setDate(end.getDate() - 89);
      break;
    case "thisWeek": {
      // Week starts on Sunday
      const day = today.getDay();
      start = new Date(today);
      start.setDate(today.getDate() - day);
      end = new Date(today);
      break;
    }
    case "lastWeek": {
      // previous Sunday - Saturday
      const day = today.getDay();
      const thisSunday = new Date(today);
      thisSunday.setDate(today.getDate() - day);
      end = new Date(thisSunday);
      end.setDate(thisSunday.getDate() - 1); // Saturday of last week
      start = new Date(end);
      start.setDate(end.getDate() - 6);
      break;
    }
    case "thisMonth":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today);
      break;
    case "lastMonth": {
      const firstOfThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const lastOfLastMonth = new Date(firstOfThisMonth);
      lastOfLastMonth.setDate(lastOfLastMonth.getDate() - 1);
      start = new Date(
        lastOfLastMonth.getFullYear(),
        lastOfLastMonth.getMonth(),
        1
      );
      end = new Date(lastOfLastMonth);
      break;
    }
    case "quarterToDate": {
      const m = today.getMonth();
      const q = Math.floor(m / 3);
      start = new Date(today.getFullYear(), q * 3, 1);
      end = new Date(today);
      break;
    }
    case "thisYear":
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today);
      break;
    case "lastCalendarYear": {
      const y = today.getFullYear() - 1;
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
      break;
    }
    default:
      // Unknown preset => return empty strings
      return { startDate: "", endDate: "" };
  }

  return {
    startDate: start ? toYMD(start) : "",
    endDate: end ? toYMD(end) : "",
  };
}
