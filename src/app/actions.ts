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

  const insertData: any = {
    creator_id: user.id,
    title: data.title,
    description: data.description,
    content_type: data.content_type,
    content_body: data.content_body || null,
    pdf_url: data.pdf_url || null,
    price_cents: data.price_cents,
    session_duration_minutes: data.session_duration_minutes,
    status: data.status,
  };

  // Add optional fields if they exist
  if (data.allow_download !== undefined) {
    insertData.allow_download = data.allow_download;
  }
  if (data.download_price_cents !== undefined) {
    insertData.download_price_cents = data.download_price_cents;
  }

  const { data: content, error } = await supabase
    .from('content')
    .insert(insertData)
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
    .select('*')
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
    .select('*')
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

// ============== USER PROFILE ACTIONS ==============

export interface UserProfileData {
  fullName?: string;
  bio?: string;
  website?: string;
  role?: 'reader' | 'creator' | 'admin';
}

export const updateUserProfileAction = async (data: UserProfileData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.role !== undefined) updateData.role = data.role;

  // Update user table
  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    console.error('Error updating user profile:', error);
    return { error: error.message };
  }

  // Also update auth metadata
  if (data.fullName) {
    await supabase.auth.updateUser({
      data: { full_name: data.fullName }
    });
  }

  revalidatePath('/dashboard/settings');
  
  return { success: true };
};

export const getUserProfileAction = async () => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", profile: null };
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return { error: error.message, profile: null };
  }

  return { profile };
};

// ============== PAYMENT ACTIONS ==============

export interface PaymentData {
  contentId: string;
  amount: number;
  currency: string;
  gateway: string;
  type: 'purchase' | 'download';
}

export const createPaymentIntentAction = async (data: PaymentData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get enabled gateway settings
  const { data: gatewaySettings } = await supabase
    .from('payment_gateway_settings')
    .select('*')
    .eq('gateway_id', data.gateway)
    .eq('is_enabled', true)
    .single();

  if (!gatewaySettings) {
    return { error: "Payment gateway not available" };
  }

  // Verify content exists
  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('id', data.contentId)
    .single();

  if (!content) {
    return { error: "Content not found" };
  }

  // Create transaction record
  const { data: transaction, error } = await supabase
    .from('payment_transactions')
    .insert({
      user_id: user.id,
      content_id: data.contentId,
      gateway_id: data.gateway,
      amount_cents: data.amount,
      currency: data.currency,
      transaction_type: data.type,
      status: 'pending',
      metadata: {
        content_title: content.title,
        session_duration: content.session_duration_minutes,
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return { error: error.message };
  }

  return { 
    success: true, 
    transactionId: transaction.id,
    gateway: data.gateway,
  };
};

export const confirmPaymentAction = async (transactionId: string, externalId?: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Update transaction status
  const { data: transaction, error } = await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      external_id: externalId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error confirming payment:', error);
    return { error: error.message };
  }

  // If this is for content purchase, create reading session
  if (transaction.transaction_type === 'purchase' && transaction.content_id) {
    const { data: content } = await supabase
      .from('content')
      .select('session_duration_minutes, creator_id')
      .eq('id', transaction.content_id)
      .single();

    if (content) {
      // Create reading session
      await supabase.from('reading_sessions').insert({
        reader_id: user.id,
        content_id: transaction.content_id,
        duration_minutes: content.session_duration_minutes,
        amount_paid_cents: transaction.amount_cents,
        status: 'active',
      });

      // Update creator earnings
      await supabase.rpc('increment_earnings', {
        content_id: transaction.content_id,
        amount: transaction.amount_cents,
      });
    }
  }

  revalidatePath('/dashboard');
  
  return { success: true, transaction };
};

// ============== DOWNLOAD ACTIONS ==============

export interface DownloadRecordData {
  contentId: string;
  deviceFingerprint: string;
  encryptionKeyHash: string;
}

export const createDownloadRecordAction = async (data: DownloadRecordData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if user has already downloaded this content
  const { data: existingRecord } = await supabase
    .from('download_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('content_id', data.contentId)
    .single();

  if (existingRecord) {
    // Update existing record
    if (existingRecord.download_count >= existingRecord.max_downloads) {
      return { error: "Maximum downloads reached" };
    }

    // Check if device matches
    if (existingRecord.device_fingerprint !== data.deviceFingerprint) {
      return { error: "Download bound to different device" };
    }

    const { error } = await supabase
      .from('download_records')
      .update({
        download_count: existingRecord.download_count + 1,
        last_download_at: new Date().toISOString(),
      })
      .eq('id', existingRecord.id);

    if (error) {
      return { error: error.message };
    }

    return { success: true, downloadsRemaining: existingRecord.max_downloads - existingRecord.download_count - 1 };
  }

  // Create new download record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  const { data: record, error } = await supabase
    .from('download_records')
    .insert({
      user_id: user.id,
      content_id: data.contentId,
      device_fingerprint: data.deviceFingerprint,
      encryption_key_hash: data.encryptionKeyHash,
      download_count: 1,
      max_downloads: 3,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating download record:', error);
    return { error: error.message };
  }

  return { success: true, downloadsRemaining: 2 };
};

export const verifyDeviceForDownloadAction = async (contentId: string, deviceFingerprint: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", canDownload: false };
  }

  const { data: record } = await supabase
    .from('download_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('content_id', contentId)
    .single();

  if (!record) {
    return { canDownload: true, isNewDownload: true };
  }

  // Check device fingerprint
  if (record.device_fingerprint !== deviceFingerprint) {
    return { 
      error: "This content can only be downloaded on the original device", 
      canDownload: false 
    };
  }

  // Check download limit
  if (record.download_count >= record.max_downloads) {
    return { 
      error: "Maximum downloads reached", 
      canDownload: false 
    };
  }

  // Check expiry
  if (record.expires_at && new Date(record.expires_at) < new Date()) {
    return { 
      error: "Download has expired", 
      canDownload: false 
    };
  }

  return { 
    canDownload: true, 
    downloadsRemaining: record.max_downloads - record.download_count 
  };
};

// ============== DEVICE FINGERPRINT ACTIONS ==============

export const registerDeviceFingerprintAction = async (fingerprint: string, deviceName?: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from('device_fingerprints')
    .upsert({
      user_id: user.id,
      fingerprint,
      device_name: deviceName || 'Unknown Device',
      last_seen: new Date().toISOString(),
    }, {
      onConflict: 'user_id,fingerprint',
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering device:', error);
    return { error: error.message };
  }

  return { success: true, device: data };
};

export const getUserDevicesAction = async () => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", devices: [] };
  }

  const { data: devices, error } = await supabase
    .from('device_fingerprints')
    .select('*')
    .eq('user_id', user.id)
    .order('last_seen', { ascending: false });

  if (error) {
    console.error('Error fetching devices:', error);
    return { error: error.message, devices: [] };
  }

  return { devices: devices || [] };
};

// ============== ADMIN ACTIONS ==============

export const updatePaymentGatewayAction = async (
  gatewayId: string, 
  settings: { isEnabled?: boolean; publicKey?: string }
) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // For demo, allow first user to act as admin
  const { data: allUsers } = await supabase
    .from('users')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1);
  
  const isFirstUser = allUsers?.[0]?.id === user.id;

  if (!adminUser && !isFirstUser) {
    return { error: "Unauthorized" };
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (settings.isEnabled !== undefined) {
    updateData.is_enabled = settings.isEnabled;
  }
  if (settings.publicKey !== undefined) {
    updateData.public_key = settings.publicKey;
  }

  const { error } = await supabase
    .from('payment_gateway_settings')
    .update(updateData)
    .eq('gateway_id', gatewayId);

  if (error) {
    console.error('Error updating gateway:', error);
    return { error: error.message };
  }

  revalidatePath('/admin');
  
  return { success: true };
};

export const getAdminStatsAction = async () => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify admin status
  const { data: allUsers } = await supabase
    .from('users')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1);
  
  const isFirstUser = allUsers?.[0]?.id === user.id;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!adminUser && !isFirstUser) {
    return { error: "Unauthorized" };
  }

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalContent },
    { count: totalSessions },
    { data: transactions }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase.from('reading_sessions').select('*', { count: 'exact', head: true }),
    supabase.from('payment_transactions').select('amount_cents').eq('status', 'completed'),
  ]);

  const totalRevenue = transactions?.reduce((acc, t) => acc + t.amount_cents, 0) || 0;

  return {
    stats: {
      totalUsers: totalUsers || 0,
      totalContent: totalContent || 0,
      totalSessions: totalSessions || 0,
      totalRevenue,
    }
  };
};

// ============== LIKE ACTIONS ==============

export const toggleLikeAction = async (contentId: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", isLiked: false };
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_id', contentId)
    .single();

  if (existingLike) {
    // Unlike
    await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
    
    return { success: true, isLiked: false };
  } else {
    // Like
    await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        content_id: contentId,
      });
    
    return { success: true, isLiked: true };
  }
};

export const checkLikeStatusAction = async (contentId: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isLiked: false };
  }

  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_id', contentId)
    .single();

  return { isLiked: !!existingLike };
};

export const getLikeCountAction = async (contentId: string) => {
  const supabase = await createClient();
  
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', contentId);

  return { count: count || 0 };
};

// ============== REVIEW ACTIONS ==============

export interface ReviewData {
  contentId: string;
  rating: number;
  comment?: string;
  qualityRating?: 'facts' | 'works' | 'elite' | 'expert' | 'doesnt_work';
}

export const submitReviewAction = async (data: ReviewData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if user has read this content
  const { data: session } = await supabase
    .from('reading_sessions')
    .select('id')
    .eq('reader_id', user.id)
    .eq('content_id', data.contentId)
    .single();

  // For now, allow reviews without reading (can be changed)
  // if (!session) {
  //   return { error: "You must read the content before reviewing" };
  // }

  // Check for existing review
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('reader_id', user.id)
    .eq('content_id', data.contentId)
    .single();

  if (existingReview) {
    // Update existing review
    const { error } = await supabase
      .from('reviews')
      .update({
        rating: data.rating,
        comment: data.comment,
        quality_rating: data.qualityRating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingReview.id);

    if (error) {
      return { error: error.message };
    }
    return { success: true, updated: true };
  }

  // Create new review
  const { error } = await supabase
    .from('reviews')
    .insert({
      reader_id: user.id,
      content_id: data.contentId,
      rating: data.rating,
      comment: data.comment,
      quality_rating: data.qualityRating,
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true, updated: false };
};

export const getContentReviewsAction = async (contentId: string) => {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      quality_rating,
      created_at,
      reader_id,
      users!reviews_reader_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq('content_id', contentId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    // If join fails, try without it
    const { data: simpleReviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    return { reviews: simpleReviews || [] };
  }

  return { reviews: reviews || [] };
};

export const getUserReviewAction = async (contentId: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { review: null };
  }

  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('reader_id', user.id)
    .eq('content_id', contentId)
    .single();

  return { review };
};

// ============== QUALITY RATING ACTIONS ==============

export const submitQualityRatingAction = async (contentId: string, rating: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check for existing quality rating
  const { data: existing } = await supabase
    .from('quality_ratings')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_id', contentId)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('quality_ratings')
      .update({
        rating_type: rating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Create new
    const { error } = await supabase
      .from('quality_ratings')
      .insert({
        user_id: user.id,
        content_id: contentId,
        rating_type: rating,
      });

    if (error) {
      return { error: error.message };
    }
  }

  return { success: true };
};

export const getQualityRatingsAction = async (contentId: string) => {
  const supabase = await createClient();

  const { data: ratings } = await supabase
    .from('quality_ratings')
    .select('rating_type')
    .eq('content_id', contentId);

  const counts = {
    facts: 0,
    works: 0,
    elite: 0,
    expert: 0,
    doesnt_work: 0,
  };

  ratings?.forEach(r => {
    if (r.rating_type in counts) {
      counts[r.rating_type as keyof typeof counts]++;
    }
  });

  return { counts };
};

// ============== READING SESSION ACTIONS ==============

export const createReadingSessionAction = async (contentId: string, amountPaidCents: number) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get content details
  const { data: content } = await supabase
    .from('content')
    .select('session_duration_minutes, creator_id')
    .eq('id', contentId)
    .single();

  if (!content) {
    return { error: "Content not found" };
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + content.session_duration_minutes);

  const { data: session, error } = await supabase
    .from('reading_sessions')
    .insert({
      content_id: contentId,
      reader_id: user.id,
      duration_minutes: content.session_duration_minutes,
      expires_at: expiresAt.toISOString(),
      amount_paid_cents: amountPaidCents,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Update content reads
  await supabase
    .from('content')
    .update({ 
      total_reads: supabase.rpc('increment', { row_id: contentId, table_name: 'content', column_name: 'total_reads' })
    })
    .eq('id', contentId);

  return { success: true, session };
};

export const getActiveSessionAction = async (contentId: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { session: null };
  }

  const { data: session } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('content_id', contentId)
    .eq('reader_id', user.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return { session };
};

export const extendSessionAction = async (sessionId: string, additionalMinutes: number, costCents: number) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: session } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('reader_id', user.id)
    .single();

  if (!session) {
    return { error: "Session not found" };
  }

  if (session.extended_count >= 3) {
    return { error: "Maximum extensions reached" };
  }

  const newExpiry = new Date(session.expires_at);
  newExpiry.setMinutes(newExpiry.getMinutes() + additionalMinutes);

  const { error } = await supabase
    .from('reading_sessions')
    .update({
      expires_at: newExpiry.toISOString(),
      extended_count: session.extended_count + 1,
      amount_paid_cents: session.amount_paid_cents + costCents,
    })
    .eq('id', sessionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true, newExpiry: newExpiry.toISOString() };
};

// ============== USER PURCHASE HISTORY ==============

export const getUserPurchasesAction = async () => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", purchases: [] };
  }

  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select(`
      id,
      content_id,
      amount_paid_cents,
      status,
      created_at,
      expires_at,
      content (
        id,
        title,
        thumbnail_url,
        content_type,
        creator_name
      )
    `)
    .eq('reader_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return { purchases: sessions || [] };
};

// ============== ADMIN GATEWAY SECRETS (Secure Storage) ==============

export const saveGatewaySecretAction = async (gatewayId: string, secretKey: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify admin status
  const { data: allUsers } = await supabase
    .from('users')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1);
  
  const isFirstUser = allUsers?.[0]?.id === user.id;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!adminUser && !isFirstUser) {
    return { error: "Unauthorized" };
  }

  // Store the secret (in production, use a proper secrets manager)
  // For now, store encrypted in platform_settings
  const { error } = await supabase
    .from('payment_gateway_settings')
    .update({
      webhook_secret: secretKey, // In production, encrypt this
      updated_at: new Date().toISOString(),
    })
    .eq('gateway_id', gatewayId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
};