import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  value?: Date | string;
  onChange: (dateString: string) => void;
  disabled?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  // Parse the value to a Date object
  const parseDate = (val: Date | string | undefined): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const currentDate = parseDate(value);

  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timezone, setTimezone] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTimezone(userTimezone);
  }, [userTimezone]);

  // Time state
  const [date, setDate] = useState<Date | undefined>(currentDate);
  const [time, setTime] = useState(
    currentDate ? format(currentDate, "HH:mm") : "09:00"
  );

  // Update local state when value changes from outside
  useEffect(() => {
    if (currentDate) {
      setDate(currentDate);
      setTime(format(currentDate, "HH:mm"));
    }
  }, [currentDate]);

  const formatDateTimeWithTimezone = (date: Date, tz: string): string => {
    // Format as readable string with timezone
    const dateStr = format(date, "MMMM d, yyyy");
    const timeStr = format(date, "h:mm a");

    // Get timezone abbreviation
    const tzShort = tz.split('/').pop()?.replace(/_/g, ' ') || tz;

    return `${dateStr} at ${timeStr} (${tzShort})`;
  };

  const updateDateTime = (selectedDate: Date | undefined, timeStr: string, tz: string) => {
    if (!selectedDate) return;

    // Parse time string (HH:mm)
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Combine date with time
    const newDate = new Date(selectedDate);
    newDate.setHours(hours || 0);
    newDate.setMinutes(minutes || 0);

    const formattedString = formatDateTimeWithTimezone(newDate, tz);

    onChange(formattedString);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate || !timezone) return;

    setDate(selectedDate);
    setOpen(false); // Close popover after selection
    updateDateTime(selectedDate, time, timezone);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!timezone) return;

    const newTime = e.target.value;
    setTime(newTime);

    if (date) {
      updateDateTime(date, newTime, timezone);
    }
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setTimezone(newTimezone);

    // Update with new timezone
    if (date) {
      updateDateTime(date, time, newTimezone);
    }
  };

  // Common timezones
  const commonTimezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Australia/Sydney",
  ];

  return (
    <div className="flex gap-4">
      {/* Date Picker */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="date-picker" className="text-sm font-medium">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-48 justify-between font-normal"
              disabled={disabled}
            >
              {date ? format(date, "MMM d, yyyy") : "Select date"}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
              timeZone={timezone}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="time-picker" className="text-sm font-medium">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={time}
          onChange={handleTimeChange}
          disabled={disabled}
          className="w-32 bg-background"
        />
      </div>

      {/* Timezone Selector */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="timezone-picker" className="text-sm font-medium">
          Timezone
        </Label>
        <select
          id="timezone-picker"
          value={timezone}
          onChange={handleTimezoneChange}
          disabled={disabled}
          className="h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value={userTimezone}>{userTimezone.split('/').pop()?.replace(/_/g, ' ')} (Local)</option>
          {commonTimezones
            .filter((tz) => tz !== userTimezone)
            .map((tz) => (
              <option key={tz} value={tz}>
                {tz.split('/').pop()?.replace(/_/g, ' ')}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default DateTimePicker;
