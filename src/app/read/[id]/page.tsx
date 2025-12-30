import ProtectedReader from "@/components/protected-reader";
import { createClient } from "../../../../supabase/server";
import { redirect, notFound } from "next/navigation";

// Demo content for fallback
const demoContent = `
# Welcome to Your Reading Session

## Introduction

This is a demo reading session. In a real scenario, you would see the actual content that you purchased access to.

The timer at the top shows how much time you have remaining in your reading session. When time runs out, you'll be prompted to either extend your session or leave a review.

## How It Works

1. **Pay for Access**: Purchase a timed reading session for the content you want to read
2. **Read Within Time**: You have a set amount of time to read the content
3. **Extend if Needed**: You can purchase additional time if you need more
4. **Leave a Review**: After your session, you can rate the content

## Content Protection

- This content is protected and cannot be copied
- Screenshots are discouraged
- The content is watermarked with your user information

## Thank You

Thank you for using our platform. Enjoy your reading!
`;

export default async function ReadPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Try to fetch real content from database
  const { data: dbContent } = await supabase
    .from('content')
    .select('*')
    .eq('id', params.id)
    .single();

  // Create a reading session record
  if (dbContent) {
    await supabase.from('reading_sessions').insert({
      reader_id: user.id,
      content_id: dbContent.id,
      duration_minutes: dbContent.session_duration_minutes,
      amount_paid_cents: dbContent.price_cents,
      status: 'active',
    });

    // Increment total reads
    await supabase
      .from('content')
      .update({ total_reads: (dbContent.total_reads || 0) + 1 })
      .eq('id', dbContent.id);
  }

  // Prepare content for reader
  const content = dbContent ? {
    id: dbContent.id,
    title: dbContent.title,
    author: 'Creator',
    sessionDuration: dbContent.session_duration_minutes,
    content: dbContent.content_body || demoContent,
    contentType: dbContent.content_type as 'text' | 'pdf',
    pdfUrl: dbContent.pdf_url,
    allowDownload: dbContent.allow_download || false,
    downloadPrice: dbContent.download_price_cents || 0,
  } : {
    id: params.id,
    title: 'Demo Content',
    author: 'Demo Author',
    sessionDuration: 30,
    content: demoContent,
    contentType: 'text' as const,
    pdfUrl: null,
    allowDownload: false,
    downloadPrice: 0,
  };

  return (
    <ProtectedReader 
      content={content} 
      user={{ 
        id: user.id, 
        email: user.email || '', 
        name: user.user_metadata?.full_name || undefined 
      }} 
    />
  );
}
