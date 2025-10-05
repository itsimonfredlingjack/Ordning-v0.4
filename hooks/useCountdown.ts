import { useState, useEffect } from 'react';

const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  let timeLeft = { hours: '00', minutes: '00', seconds: '00' };

  if (difference > 0) {
    timeLeft = {
      hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
      minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
      seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0'),
    };
  }
  return timeLeft;
};

export const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs once on mount to confirm we are on the client
    // This avoids hydration mismatches with server-side rendering frameworks
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Set interval to update the countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    // Clear interval on cleanup
    return () => clearInterval(timer);
  }, [targetDate, isClient]);

  return timeLeft;
};
