import React from 'react';
import { CalendarEvent } from '../types';
import { useCountdown } from '../hooks/useCountdown';

interface MobileEventHeaderProps {
  event: CalendarEvent;
}

const MobileEventHeader: React.FC<MobileEventHeaderProps> = ({ event }) => {
  const timeLeft = useCountdown(event.time);

  return (
    <div className="w-full p-4 mb-4 frosted-glass rounded-2xl soft-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">NEXT EVENT</h2>
        <p className="text-lg text-white">{event.title}</p>
      </div>
      <div className="flex items-baseline space-x-1 text-[#9B59B6] mt-2 sm:mt-0">
        <span className="text-3xl font-semibold tracking-tighter">{timeLeft.hours}</span>
        <span className="text-lg opacity-75">h</span>
        <span className="text-3xl font-semibold tracking-tighter">{timeLeft.minutes}</span>
        <span className="text-lg opacity-75">m</span>
        <span className="text-3xl font-semibold tracking-tighter">{timeLeft.seconds}</span>
        <span className="text-lg opacity-75">s</span>
      </div>
    </div>
  );
};

export default MobileEventHeader;
