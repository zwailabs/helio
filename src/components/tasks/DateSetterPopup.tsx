import React, { useState } from 'react';
import { Calendar, Clock, RotateCcw, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, addWeeks } from "date-fns";

interface DateSetterPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
}

const DateSetterPopup = ({ open, onOpenChange, onDateSelect, selectedDate }: DateSetterPopupProps) => {
  const [dateInput, setDateInput] = useState('');
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(selectedDate);

  // Parse date input like "jan 17" and suggest dates
  const parseDateInput = (input: string): Date | null => {
    const months = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
      apr: 3, april: 3, may: 4, jun: 5, june: 5,
      jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
      oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
    };

    const pattern = /^([a-zA-Z]+)\s+(\d{1,2})$/;
    const match = input.toLowerCase().match(pattern);
    
    if (match) {
      const monthName = match[1];
      const day = parseInt(match[2]);
      
      const monthIndex = months[monthName as keyof typeof months];
      if (monthIndex !== undefined && day >= 1 && day <= 31) {
        const currentYear = new Date().getFullYear();
        const date = new Date(currentYear, monthIndex, day);
        
        // If the date has passed this year, suggest next year
        if (date < new Date()) {
          return new Date(currentYear + 1, monthIndex, day);
        }
        return date;
      }
    }
    return null;
  };

  const getSuggestedDate = (): string => {
    const parsed = parseDateInput(dateInput);
    if (parsed) {
      return format(parsed, "dd MMM yyyy");
    }
    return '';
  };

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'weekend' | 'nextWeek') => {
    const today = new Date();
    let newDate: Date;

    switch (type) {
      case 'today':
        newDate = today;
        break;
      case 'tomorrow':
        newDate = addDays(today, 1);
        break;
      case 'weekend':
        // Next Saturday
        const daysUntilSaturday = (6 - today.getDay()) % 7;
        newDate = addDays(today, daysUntilSaturday === 0 ? 7 : daysUntilSaturday);
        break;
      case 'nextWeek':
        // Next Monday
        const daysUntilNextMonday = ((7 - today.getDay()) % 7) + 1;
        newDate = addDays(today, daysUntilNextMonday === 1 ? 8 : daysUntilNextMonday);
        break;
      default:
        newDate = today;
    }

    setCalendarDate(newDate);
    onDateSelect(newDate);
  };

  const handleApplyDateInput = () => {
    const parsed = parseDateInput(dateInput);
    if (parsed) {
      setCalendarDate(parsed);
      onDateSelect(parsed);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setCalendarDate(date);
    onDateSelect(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[350px] h-[700px] bg-[#1F1F1F] border border-[#414141] rounded-[20px] p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold mb-4">Date Setter</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Division 1: Date Input */}
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Enter Date</h3>
            <div className="space-y-2">
              <Input
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="jan 17"
                className="bg-[#2e2e30] border border-[#414141] text-white placeholder-gray-400 rounded-lg h-10"
              />
              {getSuggestedDate() && (
                <div className="flex items-center justify-between bg-[#2e2e30] border border-[#414141] rounded-lg p-2">
                  <span className="text-gray-300 text-sm">Suggestion: {getSuggestedDate()}</span>
                  <Button
                    size="sm"
                    onClick={handleApplyDateInput}
                    className="bg-white text-black hover:bg-gray-200 rounded-md h-8 px-3"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Division 2: Quick Date Options */}
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Quick Select</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => handleQuickDate('today')}
                className="bg-[#2e2e30] border border-[#414141] text-gray-300 hover:text-white hover:bg-[#353537] rounded-lg h-10"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleQuickDate('tomorrow')}
                className="bg-[#2e2e30] border border-[#414141] text-gray-300 hover:text-white hover:bg-[#353537] rounded-lg h-10"
              >
                Tomorrow
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleQuickDate('weekend')}
                className="bg-[#2e2e30] border border-[#414141] text-gray-300 hover:text-white hover:bg-[#353537] rounded-lg h-10"
              >
                This Weekend
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleQuickDate('nextWeek')}
                className="bg-[#2e2e30] border border-[#414141] text-gray-300 hover:text-white hover:bg-[#353537] rounded-lg h-10"
              >
                Next Week
              </Button>
            </div>
          </div>

          {/* Division 3: Calendar */}
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Calendar</h3>
            <div className="bg-[#2e2e30] border border-[#414141] rounded-lg p-3">
              <CalendarComponent
                mode="single"
                selected={calendarDate}
                onSelect={handleCalendarSelect}
                className={cn("w-full pointer-events-auto")}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-white",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-[#414141] rounded",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-[#414141] rounded",
                  day_selected: "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black",
                  day_today: "bg-[#414141] text-white",
                  day_outside: "day-outside text-gray-500 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-gray-500 opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>

          {/* Division 4: Time and Repeat Buttons */}
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">Additional Options</h3>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 bg-[#2e2e30] border border-[#414141] text-gray-300 hover:text-white hover:bg-[#353537] rounded-lg h-10"
              >
                <Clock className="h-4 w-4 mr-2" />
                Time
              </Button>
              <Button
                variant="ghost"
                className="flex-1 bg-[#2e2e30] border border-[#414141] text-gray-300 hover:text-white hover:bg-[#353537] rounded-lg h-10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Repeat
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateSetterPopup;