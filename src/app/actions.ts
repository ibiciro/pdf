"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// ============== CONTENT MANAGEMENT ACTIONS ==============

export interface ContentFormData {
  title: string;
  description: string;
  content_type: 'text' | 'pdf';
  content_body?: string;
  pdf_url?: string;
  price_cents: number;
  session_duration_minutes: number;
  allow_download: boolean;
  download_price_cents?: number;
  status: 'draft' | 'published';
}

export const createContentAction = async (data: ContentFormData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: content, error } = await supabase
    .from('content')
    .insert({
      creator_id: user.id,
      title: data.title,
      description: data.description,
      content_type: data.content_type,
      content_body: data.content_body || null,
      pdf_url: data.pdf_url || null,
      price_cents: data.price_cents,
      session_duration_minutes: data.session_duration_minutes,
      allow_download: data.allow_download,
      download_price_cents: data.download_price_cents || null,
      status: data.status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating content:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/browse');
  
  return { success: true, content };
};

export const updateContentAction = async (contentId: string, data: Partial<ContentFormData>) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: existingContent } = await supabase
    .from('content')
    .select('creator_id')
    .eq('id', contentId)
    .single();

  if (!existingContent || existingContent.creator_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { data: content, error } = await supabase
    .from('content')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating content:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/browse');
  revalidatePath(`/content/${contentId}`);
  
  return { success: true, content };
};

export const deleteContentAction = async (contentId: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: existingContent } = await supabase
    .from('content')
    .select('creator_id')
    .eq('id', contentId)
    .single();

  if (!existingContent || existingContent.creator_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', contentId);

  if (error) {
    console.error('Error deleting content:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/browse');
  
  return { success: true };
};

export const getCreatorContentAction = async () => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", content: [] };
  }

  const { data: content, error } = await supabase
    .from('content')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content:', error);
    return { error: error.message, content: [] };
  }
  
  return { content: content || [] };
};

export const getCreatorAnalyticsAction = async () => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get total content stats
  const { data: contentStats } = await supabase
    .from('content')
    .select('total_reads, total_earnings_cents')
    .eq('creator_id', user.id);

  const totalReads = contentStats?.reduce((acc, c) => acc + (c.total_reads || 0), 0) || 0;
  const totalEarnings = contentStats?.reduce((acc, c) => acc + (c.total_earnings_cents || 0), 0) || 0;
  const totalContent = contentStats?.length || 0;

  // Get active readers (unique readers in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('reader_id, content_id')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .in('content_id', contentStats?.map(() => '') || []);

  const uniqueReaders = new Set(sessions?.map(s => s.reader_id) || []).size;

  // Get average rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, content_id')
    .in('content_id', contentStats?.map(() => '') || []);

  const avgRating = reviews?.length 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return {
    totalEarnings,
    totalReads,
    totalContent,
    activeReaders: uniqueReaders,
    avgRating: Math.round(avgRating * 10) / 10,
  };
};

export const getBrowseContentAction = async (category?: string, search?: string) => {
  const supabase = await createClient();

  let query = supabase
    .from('content')
    .select(`
      *,
      users!content_creator_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: content, error } = await query;

  if (error) {
    console.error('Error fetching browse content:', error);
    return { content: [] };
  }

  return { content: content || [] };
};

export const getContentByIdAction = async (contentId: string) => {
  const supabase = await createClient();

  const { data: content, error } = await supabase
    .from('content')
    .select(`
      *,
      users!content_creator_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('id', contentId)
    .single();

  if (error) {
    console.error('Error fetching content:', error);
    return { content: null };
  }

  // Get review stats
  const { data: reviewData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('content_id', contentId);

  const reviewCount = reviewData?.length || 0;
  const avgRating = reviewCount > 0 
    ? reviewData!.reduce((acc, r) => acc + r.rating, 0) / reviewCount 
    : 0;

  // Get like count
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', contentId);

  return { 
    content: {
      ...content,
      reviewCount,
      avgRating: Math.round(avgRating * 10) / 10,
      likeCount: likeCount || 0,
    }
  };
};

// ============== AUTH ACTIONS ==============

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
      }
    },
  });

  console.log("After signUp", error);


  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: fullName,
          full_name: fullName,
          email: email,
          user_id: user.id,
          token_identifier: user.id,
          created_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      }
    } catch (err) {
      console.error('Error in user profile creation:', err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};