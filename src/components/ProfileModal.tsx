import React, { useState, useEffect, useRef } from 'react';
import { X, Check, User, Mail, Shield, Briefcase, Link as LinkIcon, Upload, Image, Trash2 } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (updatedUser: UserType) => void;
}

const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

export default function ProfileModal({ isOpen, onClose, user, onSave }: ProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setRole(user.role || '');
      setUsername(user.username || '');
      setAvatarUrl(user.avatarUrl || '');
      
      if (user.avatarUrl) {
        if (user.avatarUrl.startsWith('data:image/')) {
          setUploadedAvatar(user.avatarUrl);
          setCustomAvatar('');
          setShowCustomAvatarInput(false);
        } else {
          setCustomAvatar(user.avatarUrl);
          setShowCustomAvatarInput(true);
          setUploadedAvatar(null);
        }
      } else {
        setCustomAvatar('');
        setShowCustomAvatarInput(false);
        setUploadedAvatar(null);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file gambar (PNG, JPG, JPEG, GIF, WEBP)!');
      return;
    }
    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 3MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        setUploadedAvatar(base64Data);
        setAvatarUrl(base64Data);
        setShowCustomAvatarInput(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveUploaded = () => {
    setUploadedAvatar(null);
    setAvatarUrl(DEFAULT_AVATAR_URL);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !role.trim() || !username.trim()) {
      alert('Mohon isi semua kolom wajib!');
      return;
    }

    let finalAvatar = avatarUrl;
    if (showCustomAvatarInput && customAvatar.trim()) {
      finalAvatar = customAvatar.trim();
    } else if (uploadedAvatar) {
      finalAvatar = uploadedAvatar;
    }

    onSave({
      fullName: fullName.trim(),
      email: email.trim(),
      role: role.trim(),
      username: username.trim().toLowerCase(),
      avatarUrl: finalAvatar || DEFAULT_AVATAR_URL
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fadeIn">
      <div className="bg-white border border-table-border rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-table-border flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-primary text-sm lg:text-base">
              Edit Akun & Profil PIC
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-on-surface focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                Nama Lengkap (Full Name) *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant/60" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Hilmi Assidqi"
                  className="w-full h-10 pl-9 pr-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                Nama Pengguna (Username) *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant/60" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: hilmi27"
                  className="w-full h-10 pl-9 pr-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                Alamat Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hilmiassidqi27@gmail.com"
                  className="w-full h-10 pl-9 pr-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
              </div>
            </div>

            {/* Role/Jabatan */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                Jabatan / Peran (Role) *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant/60" />
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: Administrator, Lead Recruiter"
                  className="w-full h-10 pl-9 pr-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
              </div>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-4 pt-4 border-t border-table-border">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-semibold text-on-surface uppercase tracking-wider font-mono">
                Foto Profil (Avatar)
              </label>
              {uploadedAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveUploaded}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Foto Unggahan</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden ${
                isDragging
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                  : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-lowest'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                className="hidden"
              />

              {avatarUrl && (avatarUrl.startsWith('data:image/') || uploadedAvatar) ? (
                <div className="flex flex-col items-center space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="relative group">
                    <img
                      referrerPolicy="no-referrer"
                      src={avatarUrl}
                      alt="Pratinjau foto profil"
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-sm animate-scaleIn"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUploaded();
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow cursor-pointer"
                      title="Ganti Foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-primary">Foto Kustom Anda Terpilih</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-on-surface-variant hover:text-primary underline mt-0.5 cursor-pointer"
                    >
                      Klik untuk mengganti foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">
                      Seret & lepas foto Anda di sini, atau <span className="text-primary hover:underline">cari file</span>
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      Mendukung PNG, JPG, JPEG, atau WEBP (Maksimal 3MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Choice trigger for Custom URL */}
            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowCustomAvatarInput(!showCustomAvatarInput);
                  if (!showCustomAvatarInput) {
                    setUploadedAvatar(null);
                  }
                }}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showCustomAvatarInput ? 'Gunakan Foto Unggahan / Default' : 'Atau Gunakan Link Foto Kustom (URL)'}</span>
              </button>
            </div>

            {/* Custom URL Input field */}
            {showCustomAvatarInput && (
              <div className="space-y-1 animate-fadeIn pt-1">
                <input
                  type="url"
                  value={customAvatar}
                  onChange={(e) => {
                    setCustomAvatar(e.target.value);
                    setAvatarUrl(e.target.value);
                  }}
                  placeholder="Masukkan URL foto profil Anda (https://...)"
                  className="w-full h-10 px-3 bg-white border border-outline-variant rounded text-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
                <p className="text-[10px] text-on-surface-variant">
                  Gunakan link foto publik (Unsplash, Google Drive publik, dll.) untuk menampilkan foto profil Anda.
                </p>
              </div>
            )}
          </div>

          {/* Buttons footer inside form */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-table-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-container transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
