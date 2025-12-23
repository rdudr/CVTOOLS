"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, RefreshCw, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  generateLayout,
  validateFile,
  getStageName,
  ApiError,
  type LoadingState,
  initialLoadingState,
} from "@/lib/api-client";
import type { GenerateLayoutResponse, ProcessingStage } from "@/types/api";
import type { LayoutConfiguration, CandidateProfile, ComponentConfig } from "@/types/portfolio";
import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";
import { ExtractionTerminal } from "@/components/processing/ExtractionTerminal";
import { ProcessingStats } from "@/components/processing/ProcessingStats";
import { ProcessingGridScan } from "@/components/processing/ProcessingGridScan";
import type { 
  ProcessingFeedbackState, 
  ExtractionEntry, 
  ProcessingMetrics,
  ProcessingStage as FeedbackStage 
} from "@/types/processing";
import { initialProcessingFeedbackState } from "@/types/processing";

/**
 * Home Page - Resume Upload and Portfolio Generation
 * Requirements: 1.1, 1.4, 7.1
 */

type ViewMode = "upload" | "preview" | "edit";

interface EditableProfile {
  name: string;
  title: string;
  summary: string;
}

export default function HomePage() {
  // File upload state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Loading and error state
  const [loadingState, setLoadingState] = React.useState<LoadingState>(initialLoadingState);
  const [error, setError] = React.useState<string | null>(null);

  // Processing feedback state
  const [feedbackState, setFeedbackState] = React.useState<ProcessingFeedbackState>(
    initialProcessingFeedbackState
  );

  // Generated portfolio state
  const [layoutConfig, setLayoutConfig] = React.useState<LayoutConfiguration | null>(null);
  const [candidateProfile, setCandidateProfile] = React.useState<CandidateProfile | null>(null);
  const [generationResponse, setGenerationResponse] = React.useState<GenerateLayoutResponse | null>(null);

  // View mode state
  const [viewMode, setViewMode] = React.useState<ViewMode>("upload");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editableProfile, setEditableProfile] = React.useState<EditableProfile>({
    name: "",
    title: "",
    summary: "",
  });

  // Preview dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);

  /**
   * Add extraction entry to the terminal stream
   */
  const addExtractionEntry = React.useCallback((
    label: ExtractionEntry['label'],
    content: string
  ) => {
    const entry: ExtractionEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      label,
      content,
    };
    setFeedbackState(prev => ({
      ...prev,
      extractionStream: [...prev.extractionStream, entry],
    }));
  }, []);

  /**
   * Update processing metrics
   */
  const updateMetrics = React.useCallback((updates: Partial<ProcessingMetrics>) => {
    setFeedbackState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, ...updates },
    }));
  }, []);

  /**
   * Map API processing stage to feedback stage
   */
  const mapToFeedbackStage = (apiStage: ProcessingStage): FeedbackStage => {
    const stageMap: Record<string, FeedbackStage> = {
      'uploading': 'uploading',
      'ocr_processing': 'extracting',
      'ai_analysis': 'analyzing',
      'component_selection': 'generating',
      'layout_generation': 'generating',
      'complete': 'complete',
      'error': 'idle',
    };
    return stageMap[apiStage] || 'idle';
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = React.useCallback((file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }
    setSelectedFile(file);
    setError(null);
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle drag events
   */
  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle file drop
   */
  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Simulate real-time extraction entries for demo purposes
   */
  const simulateExtractionStream = React.useCallback((fileName: string) => {
    // Simulated extraction data that looks like real OCR output
    const extractionSequence = [
      { delay: 300, label: 'TEXT' as const, content: `Initializing OCR engine for ${fileName}...` },
      { delay: 800, label: 'TEXT' as const, content: 'Scanning document structure...' },
      { delay: 1200, label: 'TEXT' as const, content: 'Detecting text regions: 12 blocks found' },
      { delay: 1600, label: 'NAME' as const, content: 'Scanning header section...' },
      { delay: 2000, label: 'NAME' as const, content: 'Candidate name detected' },
      { delay: 2400, label: 'TITLE' as const, content: 'Parsing professional headline...' },
      { delay: 2800, label: 'CONTACT' as const, content: 'Email: [REDACTED]@email.com' },
      { delay: 3200, label: 'CONTACT' as const, content: 'Phone: +1 (XXX) XXX-XXXX' },
      { delay: 3600, label: 'SUMMARY' as const, content: 'Extracting professional summary...' },
      { delay: 4000, label: 'SKILL' as const, content: 'Skills section identified' },
      { delay: 4300, label: 'SKILL' as const, content: 'JavaScript, TypeScript, React' },
      { delay: 4600, label: 'SKILL' as const, content: 'Node.js, Python, AWS' },
      { delay: 4900, label: 'SKILL' as const, content: 'Docker, Kubernetes, CI/CD' },
      { delay: 5200, label: 'EXPERIENCE' as const, content: 'Work history section found' },
      { delay: 5500, label: 'EXPERIENCE' as const, content: 'Position 1: Senior Developer @ Tech Corp' },
      { delay: 5800, label: 'EXPERIENCE' as const, content: 'Position 2: Full Stack Engineer @ StartupXYZ' },
      { delay: 6100, label: 'EXPERIENCE' as const, content: 'Position 3: Software Engineer @ BigTech Inc' },
      { delay: 6400, label: 'EDUCATION' as const, content: 'Education section detected' },
      { delay: 6700, label: 'EDUCATION' as const, content: 'B.S. Computer Science - University' },
      { delay: 7000, label: 'PROJECT' as const, content: 'Projects section found' },
      { delay: 7300, label: 'PROJECT' as const, content: 'Open source contributions detected' },
      { delay: 7600, label: 'TEXT' as const, content: 'OCR extraction complete. Analyzing content...' },
    ];

    // Schedule each extraction entry
    extractionSequence.forEach(({ delay, label, content }) => {
      setTimeout(() => {
        addExtractionEntry(label, content);
      }, delay);
    });
  }, [addExtractionEntry]);

  /**
   * Handle portfolio generation
   */
  const handleGenerate = React.useCallback(async () => {
    if (!selectedFile) return;

    setError(null);
    setLoadingState({
      isLoading: true,
      stage: "uploading" as ProcessingStage,
      progress: 0,
      message: "Starting upload...",
    });

    // Initialize processing feedback state - show terminal and stats immediately
    setFeedbackState({
      isProcessing: true,
      stage: 'uploading',
      progress: 0,
      metrics: {
        charactersExtracted: 0,
        skillsFound: 0,
        experienceYears: 0,
        confidenceScore: 0,
      },
      extractionStream: [],
      showGridScan: true,
      showTerminal: true,  // Show terminal immediately
      showStats: true,     // Show stats immediately
    });

    // Start simulated extraction stream
    simulateExtractionStream(selectedFile.name);

    // Track progress milestones for metrics updates
    let lastMetricsUpdate = 0;

    try {
      const response = await generateLayout(
        selectedFile,
        { themePreference: "auto", componentStyle: "modern" },
        (event) => {
          setLoadingState({
            isLoading: true,
            stage: event.stage,
            progress: event.progress,
            message: event.message,
          });

          const feedbackStage = mapToFeedbackStage(event.stage);
          
          // Update feedback state based on stage
          setFeedbackState(prev => ({
            ...prev,
            stage: feedbackStage,
            progress: event.progress,
          }));

          // Update metrics progressively with smooth increments
          const now = Date.now();
          if (now - lastMetricsUpdate > 200) { // Update every 200ms
            lastMetricsUpdate = now;
            
            if (feedbackStage === 'extracting' || feedbackStage === 'uploading') {
              updateMetrics({
                charactersExtracted: Math.floor(event.progress * 80 + Math.random() * 200),
                skillsFound: Math.min(Math.floor(event.progress / 10), 12),
              });
            }
            if (feedbackStage === 'analyzing' || feedbackStage === 'generating') {
              updateMetrics({
                charactersExtracted: Math.floor(4000 + Math.random() * 500),
                skillsFound: Math.floor(8 + Math.random() * 4),
                experienceYears: Math.min(Math.floor(event.progress / 15), 8),
                confidenceScore: Math.min(0.5 + (event.progress / 200), 0.95),
              });
            }
          }
        }
      );

      setGenerationResponse(response);

      // Convert response to LayoutConfiguration and CandidateProfile
      const layout: LayoutConfiguration = {
        components: response.components as ComponentConfig[],
        globalTheme: response.theme as any,
        metadata: {
          generatedAt: new Date(),
          aiConfidence: response.metadata.confidence,
          professionalCategory: response.metadata.professionalCategory as any,
        },
      };

      const profile: CandidateProfile = {
        id: response.candidateProfile.id || crypto.randomUUID(),
        name: response.candidateProfile.name || "Portfolio User",
        title: response.candidateProfile.title || "Professional",
        professionalCategory: response.candidateProfile.professionalCategory as any,
        skills: response.candidateProfile.skills || [],
        experience: response.candidateProfile.experience || [],
        education: response.candidateProfile.education || [],
        projects: response.candidateProfile.projects || [],
        contact: response.candidateProfile.contact || {},
        extractedText: response.candidateProfile.extractedText || "",
        confidence: response.candidateProfile.confidence || 0.5,
        achievements: response.candidateProfile.achievements || [],
      };

      // Add final extraction entries with actual data
      if (profile.name) {
        addExtractionEntry('NAME', profile.name);
      }
      if (profile.title) {
        addExtractionEntry('TITLE', profile.title);
      }
      if (profile.skills.length > 0) {
        addExtractionEntry('SKILL', `Found ${profile.skills.length} skills`);
      }
      if (profile.experience.length > 0) {
        addExtractionEntry('EXPERIENCE', `${profile.experience.length} positions identified`);
      }

      // Update final metrics
      updateMetrics({
        charactersExtracted: profile.extractedText.length,
        skillsFound: profile.skills.length,
        experienceYears: profile.experience.length > 0 ? 
          Math.max(...profile.experience.map(e => {
            const start = new Date(e.startDate).getFullYear();
            const end = e.endDate ? new Date(e.endDate).getFullYear() : new Date().getFullYear();
            return end - start;
          })) : 0,
        confidenceScore: profile.confidence,
      });

      setLayoutConfig(layout);
      setCandidateProfile(profile);
      setEditableProfile({
        name: profile.name,
        title: profile.title,
        summary: (response.candidateProfile as any).summary || "",
      });

      // Mark processing as complete
      setFeedbackState(prev => ({
        ...prev,
        isProcessing: false,
        stage: 'complete',
        progress: 100,
      }));

      // Delay hiding feedback components for smooth transition
      setTimeout(() => {
        setFeedbackState(prev => ({
          ...prev,
          showGridScan: false,
          showTerminal: false,
          showStats: false,
        }));
        setLoadingState(initialLoadingState);
        setViewMode("preview");
      }, 1500);

    } catch (err) {
      setLoadingState(initialLoadingState);
      setFeedbackState(initialProcessingFeedbackState);
      if (err instanceof ApiError) {
        setError(`${err.message} (${err.code})`);
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  }, [selectedFile, addExtractionEntry, updateMetrics, simulateExtractionStream]);

  /**
   * Handle regeneration
   */
  const handleRegenerate = React.useCallback(() => {
    setViewMode("upload");
    setLayoutConfig(null);
    setCandidateProfile(null);
    setGenerationResponse(null);
    setSelectedFile(null);
    setFeedbackState(initialProcessingFeedbackState);
  }, []);

  /**
   * Handle profile edit save
   */
  const handleSaveEdit = React.useCallback(() => {
    if (!candidateProfile) return;

    setCandidateProfile({
      ...candidateProfile,
      name: editableProfile.name,
      title: editableProfile.title,
    });

    setEditDialogOpen(false);
  }, [candidateProfile, editableProfile]);

  /**
   * Handle render errors
   */
  const handleRenderError = React.useCallback(
    (componentType: string, error: Error) => {
      console.error(`Render error in ${componentType}:`, error);
    },
    []
  );

  // Render upload view
  if (viewMode === "upload") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Processing GridScan Background */}
        <ProcessingGridScan 
          isActive={feedbackState.showGridScan}
          onFadeComplete={() => setFeedbackState(prev => ({ ...prev, showGridScan: false }))}
        />

        {/* Processing Stats */}
        <ProcessingStats 
          metrics={feedbackState.metrics}
          isVisible={feedbackState.showStats}
        />

        {/* Extraction Terminal */}
        <ExtractionTerminal
          entries={feedbackState.extractionStream}
          isVisible={feedbackState.showTerminal}
          isComplete={feedbackState.stage === 'complete'}
          onFadeComplete={() => setFeedbackState(prev => ({ ...prev, showTerminal: false }))}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl relative z-10"
        >
          {/* Header - moves down when stats are visible */}
          <div className={`text-center transition-all duration-300 ${feedbackState.showStats ? 'mt-32 mb-6' : 'mb-8'}`}>
            <h1 className="text-4xl font-bold text-white mb-2">
              Refolio <span className="text-cyan-400">GenUI</span>
            </h1>
            <p className="text-white/60">
              Upload your resume and generate a personalized portfolio website
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
              ${dragActive
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
              }
              ${loadingState.isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {loadingState.isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Loader2 className="w-12 h-12 text-cyan-400 mx-auto animate-spin" />
                  <div>
                    <p className="text-white font-medium">
                      {getStageName(loadingState.stage!)}
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {loadingState.message}
                    </p>
                  </div>
                  <Progress value={loadingState.progress} className="w-full max-w-xs mx-auto" />
                  <p className="text-white/40 text-xs">{loadingState.progress}%</p>
                </motion.div>
              ) : selectedFile ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <FileText className="w-12 h-12 text-cyan-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-white/60 text-sm">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto" />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Upload className="w-12 h-12 text-white/40 mx-auto" />
                  <div>
                    <p className="text-white font-medium">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      Supports PDF, PNG, JPG, JPEG (max 10MB)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={!selectedFile || loadingState.isLoading}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingState.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Portfolio"
              )}
            </Button>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[
              { title: "AI-Powered", desc: "Smart component selection" },
              { title: "Personalized", desc: "Tailored to your profile" },
              { title: "Beautiful", desc: "Glassmorphic design" },
            ].map((feature) => (
              <div key={feature.title} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white font-medium text-sm">{feature.title}</p>
                <p className="text-white/50 text-xs mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Render preview view
  if (viewMode === "preview" && layoutConfig && candidateProfile) {
    return (
      <div className="relative">
        {/* Floating Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 flex gap-2"
        >
          <Button
            onClick={() => setEditDialogOpen(true)}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            onClick={() => setPreviewDialogOpen(true)}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Info
          </Button>
          <Button
            onClick={handleRegenerate}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Portfolio
          </Button>
        </motion.div>

        {/* Portfolio Renderer */}
        <PortfolioRenderer
          layoutConfig={layoutConfig}
          candidateProfile={candidateProfile}
          onRenderError={handleRenderError}
        />

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription className="text-white/60">
                Make changes to your portfolio profile information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Name</label>
                <Input
                  value={editableProfile.name}
                  onChange={(e) =>
                    setEditableProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Title</label>
                <Input
                  value={editableProfile.title}
                  onChange={(e) =>
                    setEditableProfile((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Your professional title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Summary</label>
                <Textarea
                  value={editableProfile.summary}
                  onChange={(e) =>
                    setEditableProfile((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="A brief summary about yourself"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Info Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Portfolio Information</DialogTitle>
              <DialogDescription className="text-white/60">
                Details about your generated portfolio.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs">Professional Category</p>
                  <p className="text-white font-medium capitalize">
                    {layoutConfig.metadata.professionalCategory}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs">AI Confidence</p>
                  <p className="text-white font-medium">
                    {(layoutConfig.metadata.aiConfidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs">Theme</p>
                  <p className="text-white font-medium capitalize">
                    {layoutConfig.globalTheme.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs">Components</p>
                  <p className="text-white font-medium">
                    {layoutConfig.components.length} selected
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs mb-2">Selected Components</p>
                <div className="flex flex-wrap gap-2">
                  {layoutConfig.components.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    >
                      {comp.type.replace("tool_", "").replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setPreviewDialogOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Fallback
  return null;
}
