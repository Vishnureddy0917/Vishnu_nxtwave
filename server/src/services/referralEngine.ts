import crypto from 'crypto';
import { RegistrationRepository, ReferralEventRepository } from '../db/repository.js';
import { Registration, ReferralEvent } from '../db/schemas.js';

export class ReferralEngine {
  /**
   * Generates a collision-resistant, human-friendly 6-character referral code
   * Avoids easily confused characters: 0, O, 1, I, L
   */
  public static async generateUniqueCode(): Promise<string> {
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    let code = '';
    let attempts = 0;

    while (attempts < 20) {
      const bytes = crypto.randomBytes(4);
      let num = bytes.readUInt32BE(0);
      code = 'LL-';
      for (let i = 0; i < 5; i++) {
        code += chars[num % chars.length];
        num = Math.floor(num / chars.length);
      }

      // Check uniqueness in database
      const existing = await RegistrationRepository.findByReferralCode(code);
      if (!existing) {
        return code;
      }
      attempts++;
    }

    // Fallback with timestamp
    return `LL-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  }

  /**
   * Creates privacy-conscious display name (e.g. "Vikram Malhotra" -> "Vikram M.")
   */
  public static createDisplayName(fullName: string): string {
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0];
    }
    const first = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first} ${lastInitial}.`;
  }

  /**
   * Mask email for safe internal display (e.g. "student@gmail.com" -> "s***t@gmail.com")
   */
  public static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***@***';
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`;
  }

  /**
   * Validates and attributes a referral during registration
   */
  public static async processReferralAttribution(
    candidateEmail: string,
    referredByCode: string | null | undefined,
    newRegistrationId: string
  ): Promise<{
    isValid: boolean;
    referrer?: Registration;
    reason?: string;
    event?: ReferralEvent;
  }> {
    if (!referredByCode || !referredByCode.trim()) {
      return { isValid: false, reason: 'No referral code provided' };
    }

    const cleanCode = referredByCode.trim().toUpperCase();

    // 1. Find referrer by code
    const referrer = await RegistrationRepository.findByReferralCode(cleanCode);
    if (!referrer) {
      return { isValid: false, reason: 'Invalid or non-existent referral code' };
    }

    // 2. Reject self-referral (by email or ID)
    if (referrer.email.toLowerCase() === candidateEmail.toLowerCase().trim() || referrer.id === newRegistrationId) {
      return { isValid: false, reason: 'Self-referral is not permitted' };
    }

    // 3. Ensure this new registration has not already been attributed
    const existingEvents = await ReferralEventRepository.findMany({
      referredRegistrationId: newRegistrationId,
      status: 'verified',
    });

    if (existingEvents.length > 0) {
      return { isValid: false, reason: 'Registration has already received referral attribution' };
    }

    // 4. Create verified referral event
    const event = await ReferralEventRepository.create({
      referrerRegistrationId: referrer.id,
      referrerCode: referrer.referralCode,
      referredRegistrationId: newRegistrationId,
      referredEmailMasked: this.maskEmail(candidateEmail),
      status: 'verified',
      isDemo: referrer.isDemo || false,
    });

    return {
      isValid: true,
      referrer,
      event,
    };
  }

  /**
   * Calculates verified referral count for a student
   */
  public static async getVerifiedReferralCount(registrationId: string): Promise<number> {
    return ReferralEventRepository.count({
      referrerRegistrationId: registrationId,
      status: 'verified',
    });
  }

  /**
   * Generates public leaderboard respecting participant privacy
   */
  public static async getPublicLeaderboard(limit: number = 20): Promise<Array<{
    rank: number;
    displayName: string;
    college: string;
    verifiedReferrals: number;
    badge?: string;
  }>> {
    // Aggregate verified referral events by referrer
    const events = await ReferralEventRepository.findMany({ status: 'verified' });
    const countMap: Record<string, number> = {};

    for (const ev of events) {
      countMap[ev.referrerRegistrationId] = (countMap[ev.referrerRegistrationId] || 0) + 1;
    }

    // Sort referrer IDs by referral count descending
    const sortedReferrerIds = Object.keys(countMap).sort((a, b) => countMap[b] - countMap[a]);

    const leaderboard: Array<{
      rank: number;
      displayName: string;
      college: string;
      verifiedReferrals: number;
      badge?: string;
    }> = [];

    let currentRank = 1;

    for (const regId of sortedReferrerIds) {
      const reg = await RegistrationRepository.findById(regId);
      if (!reg || reg.status !== 'verified') continue;
      // Respect student opt-out preference
      if (reg.shareOnLeaderboard === false) continue;

      const referrals = countMap[regId];
      let badge: string | undefined;
      if (referrals >= 10) badge = 'Campus AI Champion';
      else if (referrals >= 5) badge = 'AI Vanguard';
      else if (referrals >= 2) badge = 'Community Builder';

      leaderboard.push({
        rank: currentRank++,
        displayName: reg.displayName || this.createDisplayName(reg.fullName),
        college: reg.college,
        verifiedReferrals: referrals,
        badge,
      });

      if (leaderboard.length >= limit) break;
    }

    return leaderboard;
  }
}
