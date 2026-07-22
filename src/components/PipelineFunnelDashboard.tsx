import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Briefcase, 
  MapPin, 
  Calendar,
  ChevronRight,
  Info,
  Database,
  Award,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';
import { Candidate } from '../types';

interface PipelineFunnelDashboardProps {
  candidates: Candidate[];
}

interface ProjectRequest {
  id: string;
  code: string;
  name: string;
  location: string;
  targetHires: number;
  startDate: string;
  status: 'Active' | 'Complete' | 'Pending';
  applicants: number;
  stages: {
    admin: { pass: number; fail: number };
    skill: { pass: number; fail: number };
    psycho: { pass: number; fail: number };
    hr: { pass: number; fail: number };
    user: { pass: number; fail: number };
    mcu: { pass: number; fail: number };
    training: { pass: number; fail: number };
    induction: { pass: number; fail: number };
  };
  rejectionReasons: { reason: string; percentage: number; desc: string }[];
}

const HISTORICAL_PROJECTS: ProjectRequest[] = [
  {
    id: 'SG-WELD',
    code: '210302WFS02S',
    name: 'Welder Sangatta',
    location: 'Sangatta Site',
    targetHires: 20,
    startDate: '2026-05-10',
    status: 'Active',
    applicants: 142,
    stages: {
      admin: { pass: 142, fail: 42 },      // 100 pass admin
      skill: { pass: 100, fail: 40 },      // 60 pass skill
      psycho: { pass: 60, fail: 15 },      // 45 pass psycho
      hr: { pass: 45, fail: 10 },        // 35 pass hr
      user: { pass: 35, fail: 15 },       // 20 pass user
      mcu: { pass: 20, fail: 6 },         // 14 pass mcu
      training: { pass: 14, fail: 1 },     // 13 pass training
      induction: { pass: 13, fail: 1 }     // 12 onboarded
    },
    rejectionReasons: [
      { reason: 'Practical Test Failed', percentage: 40, desc: 'Gagal pengelasan 6G atau tes visual crack.' },
      { reason: 'Medical Check Failed', percentage: 25, desc: 'Hipertensi atau masalah kesehatan paru.' },
      { reason: 'HR Interview No Show', percentage: 20, desc: 'Kandidat tidak hadir wawancara.' },
      { reason: 'Document Discrepancy', percentage: 15, desc: 'Sertifikasi welder kedaluwarsa.' }
    ]
  },
  {
    id: 'MT-WELD',
    code: '210302WFS02T',
    name: 'Welder M. Teweh',
    location: 'Muara Teweh Site',
    targetHires: 15,
    startDate: '2026-05-15',
    status: 'Active',
    applicants: 98,
    stages: {
      admin: { pass: 98, fail: 18 },       
      skill: { pass: 80, fail: 30 },       
      psycho: { pass: 50, fail: 12 },      
      hr: { pass: 38, fail: 8 },         
      user: { pass: 30, fail: 10 },       
      mcu: { pass: 20, fail: 3 },         
      training: { pass: 17, fail: 1 },     
      induction: { pass: 16, fail: 1 }     
    },
    rejectionReasons: [
      { reason: 'Practical Test Failed', percentage: 45, desc: 'Hasil las FCAW/GMAW tidak rata.' },
      { reason: 'MCU High Risk', percentage: 20, desc: 'Kolesterol tinggi atau asma.' },
      { reason: 'Background Filter', percentage: 15, desc: 'Ketiadaan surat rekomendasi kerja.' },
      { reason: 'Salary Request', percentage: 20, desc: 'Ekspektasi di luar batas kontrak.' }
    ]
  },
  {
    id: 'RT-WELD',
    code: '210302WFS02R',
    name: 'Welder Rantau',
    location: 'Rantau Site',
    targetHires: 25,
    startDate: '2026-05-20',
    status: 'Active',
    applicants: 120,
    stages: {
      admin: { pass: 120, fail: 35 },      
      skill: { pass: 85, fail: 35 },       
      psycho: { pass: 50, fail: 10 },      
      hr: { pass: 40, fail: 15 },        
      user: { pass: 25, fail: 10 },       
      mcu: { pass: 15, fail: 3 },         
      training: { pass: 12, fail: 1 },     
      induction: { pass: 11, fail: 1 }     
    },
    rejectionReasons: [
      { reason: 'Practical Test Failed', percentage: 50, desc: 'Gagal sambungan pipa tumpul.' },
      { reason: 'Admin Filter', percentage: 25, desc: 'Domisili tidak sesuai syarat kontrak.' },
      { reason: 'MCU Non-Fit', percentage: 25, desc: 'Gangguan visual jarak dekat.' }
    ]
  },
  {
    id: 'SG-SCAF',
    code: '210302SFS01S',
    name: 'Scaffolder Sangatta',
    location: 'Sangatta Site',
    targetHires: 10,
    startDate: '2026-05-25',
    status: 'Complete',
    applicants: 84,
    stages: {
      admin: { pass: 84, fail: 24 },       
      skill: { pass: 60, fail: 20 },       
      psycho: { pass: 40, fail: 10 },      
      hr: { pass: 30, fail: 12 },        
      user: { pass: 18, fail: 6 },         
      mcu: { pass: 12, fail: 2 },         
      training: { pass: 10, fail: 1 },     
      induction: { pass: 9, fail: 1 }      
    },
    rejectionReasons: [
      { reason: 'Physical Test Failed', percentage: 60, desc: 'Takut ketinggian saat panjat struktur.' },
      { reason: 'SIO Expired', percentage: 25, desc: 'Sertifikasi scaffolding tidak valid.' },
      { reason: 'Safety Quiz Fail', percentage: 15, desc: 'Gagal memahami standar safety perancah.' }
    ]
  },
  {
    id: 'MT-SAFE',
    code: '210302SFY01M',
    name: 'Safety Officer Muara Teweh',
    location: 'Muara Teweh Site',
    targetHires: 5,
    startDate: '2026-06-01',
    status: 'Pending',
    applicants: 56,
    stages: {
      admin: { pass: 56, fail: 26 },       
      skill: { pass: 30, fail: 12 },       
      psycho: { pass: 18, fail: 4 },       
      hr: { pass: 14, fail: 4 },         
      user: { pass: 10, fail: 4 },         
      mcu: { pass: 6, fail: 1 },          
      training: { pass: 5, fail: 1 },      
      induction: { pass: 4, fail: 0 }      
    },
    rejectionReasons: [
      { reason: 'No HSE Certification', percentage: 40, desc: 'Tidak punya lisensi Ahli K3 Umum.' },
      { reason: 'Interview Quality', percentage: 30, desc: 'Kurang memahami standar mitigasi bahaya.' },
      { reason: 'Language Assessment', percentage: 15, desc: 'Bahasa inggris teknis tidak mencukupi.' },
      { reason: 'Experience Year', percentage: 15, desc: 'Kurang dari 2 tahun pengalaman migas.' }
    ]
  }
];

export default function PipelineFunnelDashboard({ candidates }: PipelineFunnelDashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [dataSourceMode, setDataSourceMode] = useState<'live' | 'expanded'>('expanded');

  // Stateful expanded projects (Skala Korporasi)
  const [expandedProjects, setExpandedProjects] = useState<ProjectRequest[]>(() => {
    const stored = localStorage.getItem('nexus_expanded_projects');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return HISTORICAL_PROJECTS;
  });

  // Custom overrides for Live projects (to persist name, targetHires, etc. edits)
  const [liveOverrides, setLiveOverrides] = useState<Record<string, Partial<ProjectRequest>>>(() => {
    const stored = localStorage.getItem('nexus_live_project_overrides');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Keep track of deleted live projects
  const [deletedLiveProjectIds, setDeletedLiveProjectIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('nexus_deleted_live_project_ids');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Custom added live projects
  const [customLiveProjects, setCustomLiveProjects] = useState<ProjectRequest[]>(() => {
    const stored = localStorage.getItem('nexus_custom_live_projects');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Modals for editing, deleting, and adding projects
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectRequest | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectRequest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add Project Modal
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    location: '',
    targetHires: 10,
    startDate: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Complete' | 'Pending',
    applicants: 100,
    passAdmin: 90,
    passSkill: 80,
    passPsycho: 70,
    passHr: 60,
    passUser: 50,
    passMcu: 40,
    passTraining: 35,
    passInduction: 30
  });
  const [showAdvancedStages, setShowAdvancedStages] = useState(false);

  const openAddModal = () => {
    setAddForm({
      name: '',
      code: '',
      location: '',
      targetHires: 10,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      applicants: 100,
      passAdmin: 90,
      passSkill: 80,
      passPsycho: 70,
      passHr: 60,
      passUser: 50,
      passMcu: 40,
      passTraining: 35,
      passInduction: 30
    });
    setShowAdvancedStages(false);
    setIsAddModalOpen(true);
  };

  const handleApplicantsChange = (val: number) => {
    setAddForm(prev => ({
      ...prev,
      applicants: val,
      passAdmin: Math.round(val * 0.9),
      passSkill: Math.round(val * 0.8),
      passPsycho: Math.round(val * 0.7),
      passHr: Math.round(val * 0.6),
      passUser: Math.round(val * 0.5),
      passMcu: Math.round(val * 0.4),
      passTraining: Math.round(val * 0.35),
      passInduction: Math.round(val * 0.3)
    }));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nexus_expanded_projects', JSON.stringify(expandedProjects));
  }, [expandedProjects]);

  useEffect(() => {
    localStorage.setItem('nexus_live_project_overrides', JSON.stringify(liveOverrides));
  }, [liveOverrides]);

  useEffect(() => {
    localStorage.setItem('nexus_deleted_live_project_ids', JSON.stringify(deletedLiveProjectIds));
  }, [deletedLiveProjectIds]);

  useEffect(() => {
    localStorage.setItem('nexus_custom_live_projects', JSON.stringify(customLiveProjects));
  }, [customLiveProjects]);

  const handleAddProject = (newProj: Omit<ProjectRequest, 'id' | 'stages' | 'rejectionReasons'> & { stages?: ProjectRequest['stages'] }) => {
    const id = `${newProj.name.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
    const fullProj: ProjectRequest = {
      ...newProj,
      id,
      stages: newProj.stages || {
        admin: { pass: newProj.applicants, fail: 0 },
        skill: { pass: newProj.applicants, fail: 0 },
        psycho: { pass: newProj.applicants, fail: 0 },
        hr: { pass: newProj.applicants, fail: 0 },
        user: { pass: newProj.applicants, fail: 0 },
        mcu: { pass: newProj.applicants, fail: 0 },
        training: { pass: newProj.applicants, fail: 0 },
        induction: { pass: newProj.applicants, fail: 0 }
      },
      rejectionReasons: [
        { reason: 'Kualifikasi Administrasi', percentage: 50, desc: 'Pengalaman atau dokumen tidak cocok.' },
        { reason: 'Wawancara Kompetensi', percentage: 30, desc: 'Lemah dalam penguasaan teknis praktis.' },
        { reason: 'Evaluasi Kesehatan', percentage: 20, desc: 'Gagal standar kesehatan lapangan.' }
      ]
    };

    if (dataSourceMode === 'expanded') {
      setExpandedProjects(prev => [fullProj, ...prev]);
    } else {
      setCustomLiveProjects(prev => [fullProj, ...prev]);
    }
    setSelectedProjectId(id);
    setIsAddModalOpen(false);
  };

  const handleEditProject = (project: ProjectRequest) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleSaveProjectEdit = (updatedProj: ProjectRequest) => {
    if (dataSourceMode === 'expanded') {
      setExpandedProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    } else {
      // Check if it's in customLiveProjects
      if (customLiveProjects.some(p => p.id === updatedProj.id)) {
        setCustomLiveProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
      } else {
        setLiveOverrides(prev => ({
          ...prev,
          [updatedProj.id]: {
            name: updatedProj.name,
            code: updatedProj.code,
            location: updatedProj.location,
            targetHires: updatedProj.targetHires,
            startDate: updatedProj.startDate,
            status: updatedProj.status,
          }
        }));
      }
    }
    setIsEditModalOpen(false);
    setProjectToEdit(null);
  };

  const handleDeleteProjectClick = (project: ProjectRequest) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    if (dataSourceMode === 'expanded') {
      setExpandedProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
    } else {
      if (customLiveProjects.some(p => p.id === projectToDelete.id)) {
        setCustomLiveProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      } else {
        setDeletedLiveProjectIds(prev => [...prev, projectToDelete.id]);
      }
    }
    
    if (selectedProjectId === projectToDelete.id) {
      setSelectedProjectId('all');
    }
    
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  // Convert live database candidates into project structure dynamically
  const liveProjects = useMemo(() => {
    const uniquePositions = Array.from(new Set(candidates.map(c => c.position)));
    
    return uniquePositions
      .map((pos) => {
        const posCandidates = candidates.filter(c => c.position === pos);
        const applicants = posCandidates.length;

        // Map candidates based on statuses
        const adminFail = posCandidates.filter(c => c.status === 'Ditolak' && c.hrResult === '-').length;
        const skillFail = posCandidates.filter(c => c.status === 'Ditolak' && c.hrResult === 'Tidak Lolos' && c.userResult === '-').length;
        const psychoFail = 0; 
        const hrFail = posCandidates.filter(c => c.hrResult === 'Tidak Lolos' || c.hrResult === 'No Show').length;
        const userFail = posCandidates.filter(c => c.userResult === 'Tidak Lolos' || c.userResult === 'No Show').length;
        const mcuFail = posCandidates.filter(c => c.status === 'Ditolak' && c.hrResult === 'Lolos' && c.userResult === 'Lolos').length;
        const trainingFail = 0;
        const inductionFail = 0;

        const passAdmin = applicants - adminFail;
        const passSkill = passAdmin - skillFail;
        const passPsycho = passSkill - psychoFail;
        const passHr = posCandidates.filter(c => ['User Interview', 'Medical Check', 'Lolos', 'Onboarding'].includes(c.status) || c.hrResult === 'Lolos').length;
        const passUser = posCandidates.filter(c => ['Medical Check', 'Lolos', 'Onboarding'].includes(c.status) || c.userResult === 'Lolos').length;
        const passMcu = posCandidates.filter(c => ['Lolos', 'Onboarding'].includes(c.status)).length;
        const passTraining = posCandidates.filter(c => c.status === 'Onboarding' || c.status === 'Lolos').length;
        const passInduction = posCandidates.filter(c => c.status === 'Onboarding').length;

        const id = pos.toUpperCase().replace(/\s+/g, '-');

        const baseProj: ProjectRequest = {
          id,
          code: `LIVE-${pos.substring(0, 3).toUpperCase()}`,
          name: `${pos} Pipeline`,
          location: 'Central Database',
          targetHires: 5,
          startDate: '2026-06-25',
          status: 'Active' as const,
          applicants,
          stages: {
            admin: { pass: applicants, fail: adminFail },
            skill: { pass: passAdmin, fail: skillFail },
            psycho: { pass: passPsycho, fail: psychoFail },
            hr: { pass: passHr, fail: hrFail },
            user: { pass: passUser, fail: userFail },
            mcu: { pass: passMcu, fail: mcuFail },
            training: { pass: passTraining, fail: trainingFail },
            induction: { pass: passInduction, fail: inductionFail }
          },
          rejectionReasons: [
            { reason: 'Kualifikasi Administrasi', percentage: 50, desc: 'Pengalaman atau dokumen tidak cocok.' },
            { reason: 'Wawancara Kompetensi', percentage: 30, desc: 'Lemah dalam penguasaan teknis praktis.' },
            { reason: 'Evaluasi Kesehatan', percentage: 20, desc: 'Gagal standar kesehatan lapangan.' }
          ]
        };

        if (liveOverrides[id]) {
          return {
            ...baseProj,
            ...liveOverrides[id]
          };
        }

        return baseProj;
      })
      .filter(p => !deletedLiveProjectIds.includes(p.id));
  }, [candidates, liveOverrides, deletedLiveProjectIds]);

  // Determine active dataset
  const activeProjects = useMemo(() => {
    if (dataSourceMode === 'expanded') {
      return expandedProjects;
    } else {
      return [...liveProjects, ...customLiveProjects];
    }
  }, [dataSourceMode, expandedProjects, liveProjects, customLiveProjects]);

  // Selected project model
  const currentProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return activeProjects.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, activeProjects]);

  // Aggregated calculations for "All Projects"
  const aggregatedStats = useMemo(() => {
    const initialStages = {
      admin: { pass: 0, fail: 0 },
      skill: { pass: 0, fail: 0 },
      psycho: { pass: 0, fail: 0 },
      hr: { pass: 0, fail: 0 },
      user: { pass: 0, fail: 0 },
      mcu: { pass: 0, fail: 0 },
      training: { pass: 0, fail: 0 },
      induction: { pass: 0, fail: 0 }
    };

    let totalApplicants = 0;
    let totalTargetHires = 0;

    activeProjects.forEach(p => {
      totalApplicants += p.applicants;
      totalTargetHires += p.targetHires;

      initialStages.admin.pass += p.stages.admin.pass;
      initialStages.admin.fail += p.stages.admin.fail;
      initialStages.skill.pass += p.stages.skill.pass;
      initialStages.skill.fail += p.stages.skill.fail;
      initialStages.psycho.pass += p.stages.psycho.pass;
      initialStages.psycho.fail += p.stages.psycho.fail;
      initialStages.hr.pass += p.stages.hr.pass;
      initialStages.hr.fail += p.stages.hr.fail;
      initialStages.user.pass += p.stages.user.pass;
      initialStages.user.fail += p.stages.user.fail;
      initialStages.mcu.pass += p.stages.mcu.pass;
      initialStages.mcu.fail += p.stages.mcu.fail;
      initialStages.training.pass += p.stages.training.pass;
      initialStages.training.fail += p.stages.training.fail;
      initialStages.induction.pass += p.stages.induction.pass;
      initialStages.induction.fail += p.stages.induction.fail;
    });

    return {
      applicants: totalApplicants,
      targetHires: totalTargetHires,
      stages: initialStages
    };
  }, [activeProjects]);

  // Values used in charts
  const displayApplicants = currentProject ? currentProject.applicants : aggregatedStats.applicants;
  const displayTargetHires = currentProject ? currentProject.targetHires : aggregatedStats.targetHires;
  const displayStages = currentProject ? currentProject.stages : aggregatedStats.stages;
  const displayOnboarded = displayStages.induction.pass;

  // Custom funnel rates
  const getRate = (pass: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((pass / total) * 100);
  };

  const funnelItems = [
    { name: 'Administration', pass: displayStages.admin.pass - displayStages.admin.fail, fail: displayStages.admin.fail, maxW: 'max-w-[480px]', pct: getRate(displayStages.admin.pass - displayStages.admin.fail, displayApplicants) },
    { name: 'Skill Test', pass: displayStages.skill.pass - displayStages.skill.fail, fail: displayStages.skill.fail, maxW: 'max-w-[440px]', pct: getRate(displayStages.skill.pass - displayStages.skill.fail, displayStages.admin.pass - displayStages.admin.fail) },
    { name: 'Psychotest', pass: displayStages.psycho.pass - displayStages.psycho.fail, fail: displayStages.psycho.fail, maxW: 'max-w-[400px]', pct: getRate(displayStages.psycho.pass - displayStages.psycho.fail, displayStages.skill.pass - displayStages.skill.fail) },
    { name: 'HR Interview', pass: displayStages.hr.pass - displayStages.hr.fail, fail: displayStages.hr.fail, maxW: 'max-w-[360px]', pct: getRate(displayStages.hr.pass - displayStages.hr.fail, displayStages.psycho.pass - displayStages.psycho.fail) },
    { name: 'User Interview', pass: displayStages.user.pass - displayStages.user.fail, fail: displayStages.user.fail, maxW: 'max-w-[320px]', pct: getRate(displayStages.user.pass - displayStages.user.fail, displayStages.hr.pass - displayStages.hr.fail) },
    { name: 'Medical Check-up', pass: displayStages.mcu.pass - displayStages.mcu.fail, fail: displayStages.mcu.fail, maxW: 'max-w-[280px]', pct: getRate(displayStages.mcu.pass - displayStages.mcu.fail, displayStages.user.pass - displayStages.user.fail) },
    { name: 'Training', pass: displayStages.training.pass - displayStages.training.fail, fail: displayStages.training.fail, maxW: 'max-w-[240px]', pct: getRate(displayStages.training.pass - displayStages.training.fail, displayStages.mcu.pass - displayStages.mcu.fail) },
    { name: 'Induction', pass: displayStages.induction.pass - displayStages.induction.fail, fail: displayStages.induction.fail, maxW: 'max-w-[200px]', pct: getRate(displayStages.induction.pass - displayStages.induction.fail, displayStages.training.pass - displayStages.training.fail) }
  ];

  // Rejection reason list
  const currentRejectionReasons = useMemo(() => {
    if (currentProject) return currentProject.rejectionReasons;
    
    // Aggregated top reasons
    return [
      { reason: 'Practical & Skill Assessment Failed', percentage: 42, desc: 'Penyebab gugur utama pada kompetensi operasional alat/welding.' },
      { reason: 'Medical Standard Mismatch', percentage: 22, desc: 'Ketidaksesuaian kualifikasi paru-paru industri & tensi kerja.' },
      { reason: 'Interview Engagement / No Show', percentage: 18, desc: 'Mangkir pemanggilan seleksi atau lemah komunikasi teknis.' },
      { reason: 'Credential Verification Filter', percentage: 18, desc: 'Sertifikasi SIO / Lisensi K3 kedaluwarsa atau tidak sah.' }
    ];
  }, [currentProject]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* SELECTION CONTROL PANEL */}
      <div className="bg-white border border-table-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Dasbor Analisis Corong Pipeline & Proyek Lapangan
          </h4>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Tarik data volume besar secara multi-proyek atau telusuri pencapaian pemenuhan per site.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Data Mode Select */}
          <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-table-border">
            <button
              onClick={() => {
                setDataSourceMode('expanded');
                setSelectedProjectId('all');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                dataSourceMode === 'expanded' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              💼 Skala Korporasi
            </button>
            <button
              onClick={() => {
                setDataSourceMode('live');
                setSelectedProjectId('all');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                dataSourceMode === 'live' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🔴 Live Firestore
            </button>
          </div>

          {/* Project Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white border border-outline-variant/65 rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface-variant focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">📊 Semua Proyek Teragregasi</option>
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 [{p.code}] {p.name}
              </option>
            ))}
          </select>

          {/* Add New Project/Location Button */}
          <button
            type="button"
            onClick={openAddModal}
            className="bg-primary hover:bg-primary-container text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Tambah Proyek Baru / Lokasi Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Proyek/Lokasi</span>
          </button>
        </div>
      </div>

      {/* REQUEST SUMMARY - MULTIPLE PROJECTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {activeProjects.map((proj) => {
          const hirePercentage = Math.min(Math.round((proj.stages.induction.pass / proj.targetHires) * 100), 100);
          const isSelected = selectedProjectId === proj.id;
          
          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/10 bg-primary/5' 
                  : 'border-table-border hover:border-primary/50'
              } group`}
            >
              {/* Action Buttons on Hover */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs border border-table-border z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(proj);
                  }}
                  className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Ubah Proyek"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProjectClick(proj);
                  }}
                  className="p-1 text-on-surface-variant hover:text-red-500 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Hapus Proyek"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="font-mono text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {proj.code}
                </span>
                <h5 className="font-bold text-xs text-on-surface mt-2 truncate">{proj.name}</h5>
                <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  {proj.location}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase font-mono text-on-surface-variant font-bold leading-none">Pendaftar</div>
                  <div className="text-sm font-black text-on-surface mt-1">{proj.applicants}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-[9px] uppercase font-mono text-on-surface-variant font-bold leading-none">Pemenuhan</div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-xs font-black text-primary">{hirePercentage}%</span>
                    <div className="w-8 bg-gray-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${hirePercentage}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: END-TO-END PIPELINE FUNNEL */}
        <div className="bg-white border border-table-border rounded-xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" />
              End-to-End Pipeline Funnel
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">
              Visualisasi rasio lolos (Pass Rate - hijau) dibanding gugur (Fail - merah) di setiap tahapan penyaringan.
            </p>
          </div>

          {/* VISUAL FUNNEL CHART */}
          <div className="space-y-3 py-2 flex flex-col justify-center">
            {funnelItems.map((item, index) => {
              const passPct = item.pct;
              const failPct = 100 - passPct;

              return (
                <div key={item.name} className={`w-full ${item.maxW} mx-auto flex flex-col space-y-0.5`}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-on-surface truncate">
                      STAGE 0{index + 1}: {item.name}
                    </span>
                    <span className="font-mono font-black text-primary">
                      {item.pass} Lolos ({passPct}%)
                    </span>
                  </div>
                  
                  {/* Color Segments */}
                  <div className="w-full bg-gray-100 h-4 rounded overflow-hidden flex shadow-inner">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-90 cursor-pointer" 
                      style={{ width: `${passPct}%` }}
                      title={`${item.pass} Lolos (${passPct}%)`}
                    />
                    {item.fail > 0 && (
                      <div 
                        className="bg-red-500 h-full transition-all duration-500 hover:opacity-90 cursor-pointer" 
                        style={{ width: `${failPct}%` }}
                        title={`${item.fail} Gugur (${failPct}%)`}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* SUCCESS STAGE IN FUNNEL */}
            <div className="w-full max-w-[160px] mx-auto pt-2 text-center">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-600 block">SUCCESS HIRED</span>
              <div className="bg-primary text-white font-black text-xs px-3 py-2 rounded-lg mt-1 shadow-md border border-primary/20 animate-pulse">
                {displayOnboarded} Pekerja (PKWT)
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between text-[10px] text-on-surface-variant font-medium">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" /> Lolos Tahap</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm inline-block" /> Gugur Tahap</span>
            <span className="flex items-center gap-1">Target Hires: <strong className="text-primary font-bold">{displayTargetHires}</strong></span>
          </div>
        </div>

        {/* RIGHT COLUMN: FUNNEL ANALYSIS STEP TILES */}
        <div className="bg-white border border-table-border rounded-xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between space-y-5">
          <div>
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-500" />
              Detail Tahapan Seleksi (Funnel Analysis)
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">
              Pecahan alur seleksi dari awal registrasi hingga kesepakatan PKWT.
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
            
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200/55 rounded-lg p-3.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">STEP 01</span>
                <h6 className="font-extrabold text-on-surface mt-1.5">Administrasi & Dokumen</h6>
                <div className="text-[10px] text-on-surface-variant font-semibold mt-1">
                  Masuk: <strong className="text-on-surface">{displayApplicants} Orang</strong>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  {displayStages.admin.pass - displayStages.admin.fail} Lolos
                </div>
                <div className="text-[10px] font-bold font-mono text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                  {displayStages.admin.fail} Gugur
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200/55 rounded-lg p-3.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">STEP 02</span>
                <h6 className="font-extrabold text-on-surface mt-1.5">Tes Keterampilan / Praktis</h6>
                <div className="text-[10px] text-on-surface-variant font-semibold mt-1">
                  Masuk: <strong className="text-on-surface">{displayStages.admin.pass - displayStages.admin.fail} Orang</strong>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  {displayStages.skill.pass - displayStages.skill.fail} Lolos
                </div>
                <div className="text-[10px] font-bold font-mono text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                  {displayStages.skill.fail} Gugur
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200/55 rounded-lg p-3.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">STEP 03</span>
                <h6 className="font-extrabold text-on-surface mt-1.5">Interview (HR & User)</h6>
                <div className="text-[10px] text-on-surface-variant font-semibold mt-1">
                  Masuk: <strong className="text-on-surface">{displayStages.psycho.pass - displayStages.psycho.fail} Orang</strong>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  {displayStages.user.pass - displayStages.user.fail} Lolos
                </div>
                <div className="text-[10px] font-bold font-mono text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                  {displayStages.user.fail + displayStages.hr.fail} Gugur
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 border border-slate-200/55 rounded-lg p-3.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">STEP 04</span>
                <h6 className="font-extrabold text-on-surface mt-1.5">Medical Check-up (MCU)</h6>
                <div className="text-[10px] text-on-surface-variant font-semibold mt-1">
                  Masuk: <strong className="text-on-surface">{displayStages.user.pass - displayStages.user.fail} Orang</strong>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  {displayStages.mcu.pass - displayStages.mcu.fail} Fit
                </div>
                <div className="text-[10px] font-bold font-mono text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                  {displayStages.mcu.fail} Unfit
                </div>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-on-surface-variant font-semibold">Tingkat Penyelesaian Konversi:</span>
            <span className="font-mono font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-xs">
              {getRate(displayOnboarded, displayApplicants)}% Sukses
            </span>
          </div>

        </div>

      </div>

      {/* FAILURE REASON & BENCHMARK ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FAILURE REASON ANALYSIS */}
        <div className="bg-white border border-table-border rounded-xl p-5 shadow-sm lg:col-span-4 space-y-4">
          <div>
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
              Analisis Penyebab Gugur
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              Penyebab kandidat terhenti di fase penyaringan ({selectedProjectId === 'all' ? 'Gabungan' : currentProject?.name}).
            </p>
          </div>

          <div className="space-y-3.5">
            {currentRejectionReasons.map((item) => (
              <div key={item.reason} className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold">
                  <span className="text-on-surface truncate">{item.reason}</span>
                  <span className="text-red-500 font-bold font-mono">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="text-[10px] text-on-surface-variant italic leading-tight">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PERFORMANCE BENCHMARKS TABLE */}
        <div className="bg-white border border-table-border rounded-xl p-5 shadow-sm lg:col-span-8 space-y-4">
          <div>
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-primary" />
              Tabel Kinerja & Benchmark Penerimaan Lapangan
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              Bandingkan konversi rekrutmen antar site proyek secara menyeluruh.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-table-border bg-slate-50 text-on-surface-variant font-bold">
                  <th className="py-2.5 px-3">KODE / LOKASI</th>
                  <th className="py-2.5 px-3">TGL MULAI</th>
                  <th className="py-2.5 px-3 text-center">PENDAFTAR</th>
                  <th className="py-2.5 px-3 text-center">GUGUR</th>
                  <th className="py-2.5 px-3 text-center">ONBOARD</th>
                  <th className="py-2.5 px-3 text-center">RASIO SUKSES</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                  <th className="py-2.5 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeProjects.map((proj) => {
                  const failed = proj.applicants - proj.stages.induction.pass;
                  const rate = getRate(proj.stages.induction.pass, proj.applicants);
                  
                  return (
                    <tr 
                      key={proj.id} 
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedProjectId === proj.id ? 'bg-primary/5 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-on-surface leading-tight">{proj.code}</div>
                        <div className="text-[10px] text-on-surface-variant">{proj.name} ({proj.location.split(' ')[0]})</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-on-surface-variant">{proj.startDate}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{proj.applicants}</td>
                      <td className="py-3 px-3 text-center font-mono text-red-500">{failed}</td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-emerald-600">{proj.stages.induction.pass}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold bg-slate-100 border border-slate-200/40 px-1.5 py-0.5 rounded text-[10px]">
                          {rate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          proj.status === 'Complete' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : proj.status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            proj.status === 'Complete' 
                              ? 'bg-green-500' 
                              : proj.status === 'Active'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`} />
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleEditProject(proj)}
                            className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Ubah Proyek"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProjectClick(proj)}
                            className="p-1 text-on-surface-variant hover:text-red-500 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Hapus Proyek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CUSTOM EDIT PROJECT MODAL */}
      {isEditModalOpen && projectToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-table-border overflow-hidden animate-scaleIn">
            <div className="bg-surface-container-low px-6 py-4 border-b border-table-border flex justify-between items-center">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                <span>Ubah Detail Proyek</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface font-sans text-lg font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const code = formData.get('code') as string;
              const location = formData.get('location') as string;
              const targetHires = Number(formData.get('targetHires'));
              const startDate = formData.get('startDate') as string;
              const status = formData.get('status') as 'Active' | 'Complete' | 'Pending';
              
              handleSaveProjectEdit({
                ...projectToEdit,
                name,
                code,
                location,
                targetHires,
                startDate,
                status
              });
            }} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Nama Proyek</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={projectToEdit.name}
                  required
                  className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Kode Proyek</label>
                  <input 
                    type="text" 
                    name="code" 
                    defaultValue={projectToEdit.code}
                    required
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Lokasi / Site</label>
                  <input 
                    type="text" 
                    name="location" 
                    defaultValue={projectToEdit.location}
                    required
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Target Hires</label>
                  <input 
                    type="number" 
                    name="targetHires" 
                    defaultValue={projectToEdit.targetHires}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    defaultValue={projectToEdit.startDate}
                    required
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Status Proyek</label>
                <select 
                  name="status" 
                  defaultValue={projectToEdit.status}
                  className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-bold focus:outline-none focus:border-primary bg-white text-on-surface-variant"
                >
                  <option value="Active">Active (Aktif)</option>
                  <option value="Complete">Complete (Selesai)</option>
                  <option value="Pending">Pending (Ditunda)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-table-border flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-on-surface-variant font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE PROJECT MODAL */}
      {isDeleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-table-border overflow-hidden animate-scaleIn">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-sm text-on-surface">Konfirmasi Hapus Proyek</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Apakah Anda yakin ingin menghapus proyek <span className="font-bold text-primary">[{projectToDelete.code}] {projectToDelete.name}</span> dari laporan dashboard ini?
                </p>
              </div>
              
              <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-lg text-[10px] text-orange-800 leading-normal">
                ⚠️ <span className="font-bold">Catatan:</span> Penghapusan ini hanya menyembunyikan/menghapus entri proyek dari dasbor visual laporan dan tidak memengaruhi data asli pelamar/kandidat di database.
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-on-surface-variant font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmDeleteProject}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ADD PROJECT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-table-border overflow-hidden my-8 animate-scaleIn">
            <div className="bg-surface-container-low px-6 py-4 border-b border-table-border flex justify-between items-center">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Tambah Proyek & Lokasi Baru</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface font-sans text-lg font-bold cursor-pointer animate-pulse"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const stages = {
                admin: { pass: addForm.passAdmin, fail: Math.max(0, addForm.applicants - addForm.passAdmin) },
                skill: { pass: addForm.passSkill, fail: Math.max(0, addForm.passAdmin - addForm.passSkill) },
                psycho: { pass: addForm.passPsycho, fail: Math.max(0, addForm.passSkill - addForm.passPsycho) },
                hr: { pass: addForm.passHr, fail: Math.max(0, addForm.passPsycho - addForm.passHr) },
                user: { pass: addForm.passUser, fail: Math.max(0, addForm.passHr - addForm.passUser) },
                mcu: { pass: addForm.passMcu, fail: Math.max(0, addForm.passUser - addForm.passMcu) },
                training: { pass: addForm.passTraining, fail: Math.max(0, addForm.passMcu - addForm.passTraining) },
                induction: { pass: addForm.passInduction, fail: Math.max(0, addForm.passTraining - addForm.passInduction) }
              };
              
              handleAddProject({
                name: addForm.name,
                code: addForm.code,
                location: addForm.location,
                targetHires: Number(addForm.targetHires),
                startDate: addForm.startDate,
                status: addForm.status,
                applicants: Number(addForm.applicants),
                stages
              });
            }} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-left">
              
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Nama Proyek / Posisi</label>
                <input 
                  type="text" 
                  value={addForm.name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Contoh: Operator Dump Truck Kendawangan"
                  className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Kode Proyek</label>
                  <input 
                    type="text" 
                    value={addForm.code}
                    onChange={(e) => setAddForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    placeholder="Contoh: KDW-OPT01"
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Lokasi / Site Baru</label>
                  <input 
                    type="text" 
                    value={addForm.location}
                    onChange={(e) => setAddForm(prev => ({ ...prev, location: e.target.value }))}
                    required
                    placeholder="Contoh: Kendawangan Site"
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Target Hires (Kebutuhan)</label>
                  <input 
                    type="number" 
                    value={addForm.targetHires}
                    onChange={(e) => setAddForm(prev => ({ ...prev, targetHires: Number(e.target.value) }))}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    value={addForm.startDate}
                    onChange={(e) => setAddForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Status Awal</label>
                  <select 
                    value={addForm.status}
                    onChange={(e) => setAddForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-bold focus:outline-none focus:border-primary bg-white text-on-surface-variant"
                  >
                    <option value="Active">Active (Aktif)</option>
                    <option value="Complete">Complete (Selesai)</option>
                    <option value="Pending">Pending (Ditunda)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase">Jumlah Pelamar Awal</label>
                  <input 
                    type="number" 
                    value={addForm.applicants}
                    onChange={(e) => handleApplicantsChange(Number(e.target.value))}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-outline-variant/70 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary bg-white text-on-surface font-mono"
                  />
                </div>
              </div>

              {/* ADVANCED PIPELINE STAGES ADJUSTMENT */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedStages(!showAdvancedStages)}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer focus:outline-none"
                >
                  <span>{showAdvancedStages ? '▼' : '►'} Sesuaikan Rincian Jumlah Pelamar per Tahapan (Opsional)</span>
                </button>

                {showAdvancedStages && (
                  <div className="mt-3 p-4 bg-slate-50 border border-table-border rounded-xl space-y-3 animate-fadeIn">
                    <p className="text-[10px] text-on-surface-variant leading-normal">
                      💡 Secara otomatis, sistem memperkirakan konversi corong pelamar rekrutmen. Anda dapat menyesuaikan jumlah pelamar yang <strong>Lolos (Pass)</strong> di setiap tahapan di bawah ini:
                    </p>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Administrasi</label>
                        <input 
                          type="number" 
                          value={addForm.passAdmin}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passAdmin: Math.min(addForm.applicants, Number(e.target.value)) }))}
                          max={addForm.applicants}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Tes Teknis</label>
                        <input 
                          type="number" 
                          value={addForm.passSkill}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passSkill: Math.min(addForm.passAdmin, Number(e.target.value)) }))}
                          max={addForm.passAdmin}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Psikotes</label>
                        <input 
                          type="number" 
                          value={addForm.passPsycho}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passPsycho: Math.min(addForm.passSkill, Number(e.target.value)) }))}
                          max={addForm.passSkill}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Wawancara HR</label>
                        <input 
                          type="number" 
                          value={addForm.passHr}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passHr: Math.min(addForm.passPsycho, Number(e.target.value)) }))}
                          max={addForm.passPsycho}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Wawancara User</label>
                        <input 
                          type="number" 
                          value={addForm.passUser}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passUser: Math.min(addForm.passHr, Number(e.target.value)) }))}
                          max={addForm.passHr}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Medical Check</label>
                        <input 
                          type="number" 
                          value={addForm.passMcu}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passMcu: Math.min(addForm.passUser, Number(e.target.value)) }))}
                          max={addForm.passUser}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Training</label>
                        <input 
                          type="number" 
                          value={addForm.passTraining}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passTraining: Math.min(addForm.passMcu, Number(e.target.value)) }))}
                          max={addForm.passMcu}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Lolos Onboard</label>
                        <input 
                          type="number" 
                          value={addForm.passInduction}
                          onChange={(e) => setAddForm(prev => ({ ...prev, passInduction: Math.min(addForm.passTraining, Number(e.target.value)) }))}
                          max={addForm.passTraining}
                          className="w-full px-2.5 py-1.5 border border-outline-variant/70 rounded-md text-xs font-semibold bg-white text-on-surface"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-table-border flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-on-surface-variant font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Tambah Proyek & Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
