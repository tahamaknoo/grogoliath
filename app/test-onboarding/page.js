"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import OnboardingWizard from "../components/OnboardingWizard";
import SuccessScreen from "../components/SuccessScreen";
import DeployOptions from "../components/DeployOptions";

export default function TestOnboarding() {
  const [session, setSession] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [completedData, setCompletedData] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleComplete = (result) => {
    if (result === null) {
      alert("Skipped to dashboard");
    } else {
      setCompletedData(result);
      setShowSuccess(true);
    }
  };

  const handleDeploy = () => {
    setShowDeploy(true);
  };

  const handleBackFromDeploy = () => {
    setShowDeploy(false);
  };

  const handleView = () => {
    if (completedData?.project?.id) {
      localStorage.setItem('viewProjectId', completedData.project.id);
    }
    window.location.href = '/?tab=projects';
  };

  const handleDownload = () => {
    alert("Download ZIP coming soon!");
  };

  const handleDashboard = () => {
    alert("Going to dashboard - will integrate in Step 7");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111111]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Sign in to test the onboarding wizard</p>
          <a
            href="/"
            className="px-8 py-4 bg-[#5b4cdb] text-white text-lg font-bold rounded-xl hover:bg-[#4a3dc4] transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (showDeploy && completedData) {
    return (
      <DeployOptions
        project={completedData.project}
        pages={completedData.pages}
        onBack={handleBackFromDeploy}
      />
    );
  }

  if (showSuccess && completedData) {
    return (
      <SuccessScreen
        project={completedData.project}
        pages={completedData.pages}
        onDeploy={handleDeploy}
        onView={handleView}
        onDownload={handleDownload}
        onDashboard={handleDashboard}
      />
    );
  }

  return (
    <OnboardingWizard
      session={session}
      onComplete={handleComplete}
    />
  );
}
