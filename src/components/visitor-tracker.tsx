'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '../../supabase/client';

function generateVisitorId(): string {
  // Generate or retrieve visitor ID from localStorage
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
}

function generateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const supabase = createClient();
        const visitorId = generateVisitorId();
        const sessionId = generateSessionId();
        const deviceType = getDeviceType();
        
        await supabase.from('website_visitors').insert({
          visitor_id: visitorId,
          page_path: pathname,
          user_id: null, // Will be set if user is logged in via RLS
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
          device_type: deviceType,
          session_id: sessionId,
        });
      } catch (error) {
        // Silent fail - don't affect user experience
        console.debug('Visitor tracking error:', error);
      }
    };

    trackVisit();
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
