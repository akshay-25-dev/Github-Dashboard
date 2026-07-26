"use client";

import { useState, useEffect, useCallback, use } from "react";
import { fetchProfile, fetchContributions, fetchAISummary } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileHeader from "@/components/ProfileHeader";
import ContributionHeatmap from "@/components/ContributionHeatmap";
import StreakStats from "@/components/StreakStats";
import AchievementBadges from "@/components/AchievementBadges";
import LanguageDonutChart from "@/components/LanguageDonutChart";
import RepoGrid from "@/components/RepoGrid";
import AISummaryCard from "@/components/AISummaryCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import ErrorBanner from "@/components/ErrorBanner";
import Footer from "@/components/Footer";

export default function DashboardPage({ params }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;

  // Independent state for each section (progressive loading)
  const [profileData, setProfileData] = useState(null);
  const [contributionsData, setContributionsData] = useState(null);
  const [aiData, setAiData] = useState(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [contributionsLoading, setContributionsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);

  const [profileError, setProfileError] = useState(null);
  const [contributionsError, setContributionsError] = useState(null);
  const [aiError, setAiError] = useState(null);

  const [warning, setWarning] = useState(null);

  // Fetch profile (repos, languages, achievements)
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await fetchProfile(username);
      setProfileData(data);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      if (err.status === 404 || err.code === "USER_NOT_FOUND") {
        setProfileError({ type: "not-found" });
      } else if (err.status === 429) {
        setProfileError({ type: "rate-limit", message: err.message });
      } else {
        setProfileError({ type: "generic", message: err.message || "Failed to load profile." });
      }
    } finally {
      setProfileLoading(false);
    }
  }, [username]);

  // Fetch contributions
  const loadContributions = useCallback(async () => {
    setContributionsLoading(true);
    setContributionsError(null);
    try {
      const data = await fetchContributions(username);
      setContributionsData(data.contributions);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setContributionsError({ message: err.message || "Failed to load contributions." });
    } finally {
      setContributionsLoading(false);
    }
  }, [username]);

  // Fetch AI summary (depends on profile being loaded first)
  const loadAISummary = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await fetchAISummary(username);
      setAiData(data.aiSummary);
    } catch (err) {
      setAiError({ message: err.message || "Failed to load AI summary." });
    } finally {
      setAiLoading(false);
    }
  }, [username]);

  // Kick off all fetches
  useEffect(() => {
    // Profile and contributions load in parallel
    loadProfile();
    loadContributions();
  }, [loadProfile, loadContributions]);

  // AI summary fires after profile resolves (needs stats as input)
  useEffect(() => {
    if (profileData && !profileError) {
      loadAISummary();
    }
  }, [profileData, profileError, loadAISummary]);

  // If user not found, show full-page error
  if (profileError?.type === "not-found") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Sticky header */}
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-indigo)] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <span className="text-sm font-bold gradient-text hidden sm:block">DevDash</span>
            </a>
            <SearchBar variant="header" defaultValue={username} />
            <ThemeToggle />
          </div>
        </header>
        <ErrorBanner type="not-found" username={username} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-indigo)] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <span className="text-sm font-bold gradient-text hidden sm:block">DevDash</span>
          </a>
          <SearchBar variant="header" defaultValue={username} />
          <ThemeToggle />
        </div>
      </header>

      {/* Rate limit warning banner */}
      {warning && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <ErrorBanner type="rate-limit" message={warning} />
        </div>
      )}

      {/* Dashboard content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Section 1: Profile Header */}
        {profileLoading ? (
          <SkeletonCard type="profile" />
        ) : profileError ? (
          <ErrorBanner message={profileError.message} onRetry={loadProfile} />
        ) : (
          <ProfileHeader profile={profileData?.profile} />
        )}

        {/* Section 2: Contribution Heatmap */}
        {contributionsLoading ? (
          <SkeletonCard type="heatmap" />
        ) : contributionsError ? (
          <ErrorBanner message={contributionsError.message} onRetry={loadContributions} />
        ) : (
          <ContributionHeatmap contributions={contributionsData} />
        )}

        {/* Section 3: Streaks & Achievements (side by side on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {contributionsLoading ? (
              <SkeletonCard type="streaks" />
            ) : (
              <StreakStats contributions={contributionsData} />
            )}
          </div>
          <div>
            {profileLoading ? (
              <SkeletonCard type="default" />
            ) : (
              <AchievementBadges achievements={profileData?.achievements} />
            )}
          </div>
        </div>

        {/* Section 4: Languages */}
        {profileLoading ? (
          <SkeletonCard type="chart" />
        ) : (
          <LanguageDonutChart languages={profileData?.languages} />
        )}

        {/* Section 5: Repositories */}
        {profileLoading ? (
          <SkeletonCard type="repos" />
        ) : (
          <RepoGrid repos={profileData?.repos} />
        )}

        {/* Section 6: AI Summary */}
        {aiLoading ? (
          <SkeletonCard type="ai" />
        ) : aiError ? (
          <ErrorBanner message={aiError.message} onRetry={loadAISummary} />
        ) : (
          <AISummaryCard aiSummary={aiData} username={username} />
        )}
      </main>

      <Footer />
    </div>
  );
}
