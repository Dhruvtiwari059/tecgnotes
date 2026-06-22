'use client';

import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, Lock, Users, BookOpen, FileText, KeyRound, Trash2, Plus, X, LogIn, Upload, FolderOpen, Loader as Loader2, Eye, File, Code as Code2, Briefcase, Type, Pencil, Save } from 'lucide-react';

interface FeedbackRow {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  added_by: string | null;
  created_at: string;
}

interface ContentFile {
  id: string;
  section: string;
  subject_name: string | null;
  subject_id: string | null;
  file_name: string;
  file_url: string | null;
  file_type: string | null;
  content_type: string;
  text_content: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  unit_number: number | null;
  pyq_year: string | null;
  answer_pdf_url: string | null;
  is_notes_pdf: boolean;
  is_questions_pdf: boolean;
  company: string | null;
  category: string | null;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
}

const SECTION_LABELS: Record<string, { en: string; hi: string; icon: React.ReactNode }> = {
  notes: { en: 'Notes', hi: 'नोट्स', icon: <FileText className="w-4 h-4" /> },
  pyq: { en: 'PYQ', hi: 'PYQ', icon: <BookOpen className="w-4 h-4" /> },
  dsa: { en: 'DSA', hi: 'DSA', icon: <Code2 className="w-4 h-4" /> },
  placement: { en: 'Placement', hi: 'प्लेसमेंट', icon: <Briefcase className="w-4 h-4" /> },
};

export function AdminPanel() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackRow[]>([]);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');

  // Content management state
  const [contentSection, setContentSection] = useState<string>('notes');
  const [contentFiles, setContentFiles] = useState<ContentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [unitNumber, setUnitNumber] = useState('');
  const [pyqYear, setPyqYear] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('');
  const [isNotesPdf, setIsNotesPdf] = useState(false);
  const [isQuestionsPdf, setIsQuestionsPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const answerFileRef = useRef<HTMLInputElement>(null);
  const [answerPdfUrl, setAnswerPdfUrl] = useState<string | null>(null);
  const [uploadingAnswer, setUploadingAnswer] = useState(false);

  // Text content state
  const [contentType, setContentType] = useState<string>('file');
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<ContentFile | null>(null);
  const [editSubjectId, setEditSubjectId] = useState<string>('');
  const [editPyqYear, setEditPyqYear] = useState('');
  const [editUnitNumber, setEditUnitNumber] = useState('');
  const [editAnswerPdfUrl, setEditAnswerPdfUrl] = useState<string | null>(null);
  const [editUploadingAnswer, setEditUploadingAnswer] = useState(false);
  const editAnswerRef = useRef<HTMLInputElement>(null);
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [editFileUrl, setEditFileUrl] = useState<string | null>(null);
  const [editUploadingFile, setEditUploadingFile] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUser(session.user);
      const { data } = await supabase.from('admin_users').select('email').eq('email', session.user.email).maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    async function loadData() {
      const [fb, admins] = await Promise.all([
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_users').select('*').order('created_at', { ascending: false }),
      ]);
      setFeedbackList(fb.data || []);
      setAdminList(admins.data || []);
    }
    loadData();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'content') return;
    loadContentFiles(contentSection);
    loadSubjects();
  }, [isAdmin, activeTab, contentSection]);

  const loadSubjects = async () => {
    const { data } = await supabase
      .from('subjects')
      .select('id, name, code')
      .order('name');
    setSubjects(data || []);
  };

  const loadContentFiles = async (section: string) => {
    const { data } = await supabase
      .from('content_files')
      .select('*')
      .eq('section', section)
      .order('uploaded_at', { ascending: false });
    setContentFiles(data || []);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin' } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    const { error } = await supabase.from('admin_users').insert({
      email: newAdminEmail.trim(),
      added_by: user.email,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Admin added successfully', 'एडमिन सफलतापूर्वक जोड़ा गया'));
      setNewAdminEmail('');
      const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
      setAdminList(data || []);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Admin removed', 'एडमिन हटा दिया गया'));
      setAdminList(adminList.filter(a => a.id !== id));
    }
  };

  const uploadFileToStorage = async (file: File, section: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${section}/${fileName}`;

    const { error } = await supabase.storage
      .from('notes-files')
      .upload(filePath, file);

    if (error) {
      toast.error(error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('notes-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Determine file type with fallback
    const mimeType = file.type || '';
    const isPdf = mimeType === 'application/pdf';
    const isImage = mimeType.startsWith('image/');
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    let fileType = 'file'; // default fallback
    if (isPdf || fileExt === 'pdf') {
      fileType = 'pdf';
    } else if (isImage || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
      fileType = 'image';
    }

    const fileUrl = await uploadFileToStorage(file, contentSection);
    if (!fileUrl) {
      setUploading(false);
      return;
    }

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    const insertData: any = {
      section: contentSection,
      content_type: 'file',
      file_name: file.name,
      file_url: fileUrl,
      file_type: fileType,
      uploaded_by: user.email,
    };

    if (contentSection === 'notes') {
      insertData.subject_name = selectedSubject?.name || subjectName || null;
      insertData.subject_id = selectedSubjectId || null;
      insertData.unit_number = unitNumber ? parseInt(unitNumber) : null;
    } else if (contentSection === 'pyq') {
      insertData.subject_name = selectedSubject?.name || subjectName || null;
      insertData.subject_id = selectedSubjectId || null;
      insertData.pyq_year = pyqYear || null;
      insertData.answer_pdf_url = answerPdfUrl;
    } else if (contentSection === 'dsa') {
      insertData.subject_name = subjectName || null;
      insertData.is_notes_pdf = isNotesPdf;
      insertData.is_questions_pdf = isQuestionsPdf;
    } else if (contentSection === 'placement') {
      insertData.company = company || null;
      insertData.category = category || null;
      insertData.subject_name = subjectName || null;
    }

    const { error } = await supabase.from('content_files').insert(insertData);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('File uploaded successfully', 'फाइल सफलतापूर्वक अपलोड की गई'));
      loadContentFiles(contentSection);
      resetForm();
    }

    setUploading(false);
  };

  const resetForm = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSubjectName('');
    setSelectedSubjectId('');
    setUnitNumber('');
    setPyqYear('');
    setCompany('');
    setCategory('');
    setIsNotesPdf(false);
    setIsQuestionsPdf(false);
    setAnswerPdfUrl(null);
    setTextContent('');
    setTextTitle('');
  };

  const handleTextSave = async () => {
    if (!textContent.trim()) {
      toast.error(t('Content cannot be empty', 'कंटेंट खाली नहीं हो सकता'));
      return;
    }

    setSaving(true);

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    const insertData: any = {
      section: contentSection,
      content_type: 'text',
      file_type: 'text', // Explicit type for text content
      file_name: textTitle || selectedSubject?.name || subjectName || 'Text Content',
      text_content: textContent,
      uploaded_by: user.email,
    };

    if (contentSection === 'notes') {
      insertData.subject_name = selectedSubject?.name || subjectName || null;
      insertData.subject_id = selectedSubjectId || null;
      insertData.unit_number = unitNumber ? parseInt(unitNumber) : null;
    } else if (contentSection === 'pyq') {
      insertData.subject_name = selectedSubject?.name || subjectName || null;
      insertData.subject_id = selectedSubjectId || null;
      insertData.pyq_year = pyqYear || null;
    } else if (contentSection === 'dsa') {
      insertData.subject_name = subjectName || null;
    } else if (contentSection === 'placement') {
      insertData.company = company || null;
      insertData.category = category || null;
      insertData.subject_name = subjectName || null;
    }

    const { error } = await supabase.from('content_files').insert(insertData);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Content saved successfully', 'कंटेंट सफलतापूर्वक सेव किया गया'));
      loadContentFiles(contentSection);
      resetForm();
    }

    setSaving(false);
  };

  const handleAnswerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAnswer(true);
    const url = await uploadFileToStorage(file, contentSection);
    if (url) {
      setAnswerPdfUrl(url);
      toast.success(t('Answer PDF uploaded', 'उत्तर PDF अपलोड की गई'));
    }
    setUploadingAnswer(false);
  };

  const handleDeleteFile = async (file: ContentFile) => {
    if (file.file_url) {
      const filePath = file.file_url.split('/notes-files/')[1];
      if (filePath) {
        await supabase.storage.from('notes-files').remove([filePath]);
      }
    }

    const { error } = await supabase.from('content_files').delete().eq('id', file.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Content deleted', 'कंटेंट हटा दिया गया'));
      setContentFiles(contentFiles.filter(f => f.id !== file.id));
    }
  };

  // Edit handlers
  const openEditDialog = (file: ContentFile) => {
    setEditingFile(file);
    setEditSubjectId(file.subject_id || '');
    setEditPyqYear(file.pyq_year || '');
    setEditUnitNumber(file.unit_number?.toString() || '');
    setEditAnswerPdfUrl(file.answer_pdf_url);
    setEditFileUrl(file.file_url);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingFile(null);
    setEditSubjectId('');
    setEditPyqYear('');
    setEditUnitNumber('');
    setEditAnswerPdfUrl(null);
    setEditFileUrl(null);
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingFile) return;

    setEditUploadingFile(true);
    const url = await uploadFileToStorage(file, editingFile.section);
    if (url) {
      setEditFileUrl(url);
      toast.success(t('File replaced', 'फाइल बदल दी गई'));
    }
    setEditUploadingFile(false);
  };

  const handleEditAnswerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingFile) return;

    setEditUploadingAnswer(true);
    const url = await uploadFileToStorage(file, editingFile.section);
    if (url) {
      setEditAnswerPdfUrl(url);
      toast.success(t('Answer PDF uploaded', 'उत्तर PDF अपलोड की गई'));
    }
    setEditUploadingAnswer(false);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    setEditSaving(true);
    const selectedSubject = subjects.find(s => s.id === editSubjectId);

    const updateData: any = {
      subject_id: editSubjectId || null,
      subject_name: selectedSubject?.name || editingFile.subject_name,
      pyq_year: editPyqYear || null,
      unit_number: editUnitNumber ? parseInt(editUnitNumber) : null,
      answer_pdf_url: editAnswerPdfUrl,
      file_url: editFileUrl,
    };

    const { error } = await supabase
      .from('content_files')
      .update(updateData)
      .eq('id', editingFile.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Content updated successfully', 'कंटेंट सफलतापूर्वक अपडेट किया गया'));
      loadContentFiles(contentSection);
      closeEditDialog();
    }

    setEditSaving(false);
  };

  if (loading) {
    return (
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-10 w-48 bg-gray-800 mb-4" />
          <Skeleton className="h-64 bg-gray-800" />
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('Admin Login Required', 'एडमिन लॉगिन आवश्यक')}</h2>
          <p className="text-gray-400 mb-6">{t('Sign in with Google to access the admin panel.', 'एडमिन पैनल तक पहुँचने के लिए Google से साइन इन करें।')}</p>
          <Button onClick={handleLogin} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
            <LogIn className="w-4 h-4 mr-2" />
            {t('Sign in with Google', 'Google से साइन इन करें')}
          </Button>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('Access Denied', 'पहुँच अस्वीकृत')}</h2>
          <p className="text-gray-400">{t('Your email is not in the admin whitelist.', 'आपका ईमेल एडमिन व्हाइटलिस्ट में नहीं है।')}</p>
          <p className="text-gray-500 text-sm mt-2">{user.email}</p>
          <Button onClick={handleLogout} variant="outline" className="mt-6 border-white/10 text-gray-300 hover:bg-white/5">
            {t('Sign Out', 'साइन आउट')}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#F97316]" />
              {t('Admin Panel', 'एडमिन पैनल')}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
            {t('Sign Out', 'साइन आउट')}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 border border-white/10 mb-6">
            <TabsTrigger value="content" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-[#1E3A8A]">
              <FolderOpen className="w-4 h-4 mr-1" />
              {t('Content', 'कंटेंट')}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-[#1E3A8A]">
              <FileText className="w-4 h-4 mr-1" />
              {t('Feedback', 'फीडबैक')}
            </TabsTrigger>
            <TabsTrigger value="admins" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-[#1E3A8A]">
              <Users className="w-4 h-4 mr-1" />
              {t('Admins', 'एडमिन')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Upload Form */}
              <Card className="bg-gray-900 border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  {contentType === 'file' ? <Upload className="w-5 h-5 text-[#F97316]" /> : <Type className="w-5 h-5 text-[#F97316]" />}
                  {contentType === 'file' ? t('Upload File', 'फाइल अपलोड करें') : t('Add Text Content', 'टेक्स्ट कंटेंट जोड़ें')}
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300 text-sm">{t('Section', 'सेक्शन')}</Label>
                    <Select value={contentSection} onValueChange={setContentSection}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        {Object.entries(SECTION_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
                            <div className="flex items-center gap-2">
                              {label.icon}
                              {t(label.en, label.hi)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm">{t('Content Type', 'कंटेंट प्रकार')}</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={contentType === 'file' ? 'default' : 'outline'}
                        size="sm"
                        className={contentType === 'file' ? 'bg-[#F97316] text-white' : 'border-white/10 text-gray-300'}
                        onClick={() => setContentType('file')}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {t('File', 'फाइल')}
                      </Button>
                      <Button
                        variant={contentType === 'text' ? 'default' : 'outline'}
                        size="sm"
                        className={contentType === 'text' ? 'bg-[#F97316] text-white' : 'border-white/10 text-gray-300'}
                        onClick={() => setContentType('text')}
                      >
                        <Type className="w-4 h-4 mr-1" />
                        {t('Text', 'टेक्स्ट')}
                      </Button>
                    </div>
                  </div>

                  {(contentSection === 'notes' || contentSection === 'pyq') && subjects.length > 0 && (
                    <div>
                      <Label className="text-gray-300 text-sm">{t('Subject (Select from list)', 'विषय (सूची से चुनें)')}</Label>
                      <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                          <SelectValue placeholder={t('Select a subject...', 'विषय चुनें...')} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 max-h-60">
                          {subjects.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id} className="text-white hover:bg-white/10">
                              {sub.name} {sub.code && `(${sub.code})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {contentSection === 'notes' && (
                    <>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Subject Name (or type manually)', 'विषय का नाम (या मैन्युअल टाइप करें)')}</Label>
                        <Input
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder={t('e.g., Data Structures', 'जैसे: डेटा स्ट्रक्चर')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                          disabled={!!selectedSubjectId}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Unit Number', 'यूनिट नंबर')}</Label>
                        <Input
                          type="number"
                          value={unitNumber}
                          onChange={(e) => setUnitNumber(e.target.value)}
                          placeholder="1, 2, 3..."
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                        />
                      </div>
                    </>
                  )}

                  {contentSection === 'pyq' && (
                    <>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Subject Name (or type manually)', 'विषय का नाम (या मैन्युअल टाइप करें)')}</Label>
                        <Input
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder={t('e.g., Operating Systems', 'जैसे: ऑपरेटिंग सिस्टम')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                          disabled={!!selectedSubjectId}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Year', 'वर्ष')}</Label>
                        <Input
                          value={pyqYear}
                          onChange={(e) => setPyqYear(e.target.value)}
                          placeholder="2023, 2024..."
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                        />
                      </div>
                      {contentType === 'file' && (
                        <div>
                          <Label className="text-gray-300 text-sm">{t('Answer PDF (Optional)', 'उत्तर PDF (वैकल्पिक)')}</Label>
                          {answerPdfUrl ? (
                            <div className="flex items-center gap-2 mt-1 bg-green-500/10 border border-green-500/30 rounded px-3 py-2">
                              <File className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm flex-1 truncate">{t('Answer uploaded', 'उत्तर अपलोड किया')}</span>
                              <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-6 w-6 p-0" onClick={() => setAnswerPdfUrl(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full border-white/10 text-gray-300 hover:bg-white/5 mt-1"
                              onClick={() => answerFileRef.current?.click()}
                              disabled={uploadingAnswer}
                            >
                              {uploadingAnswer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                              {t('Upload Answer PDF', 'उत्तर PDF अपलोड करें')}
                            </Button>
                          )}
                          <input
                            ref={answerFileRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleAnswerUpload}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {contentSection === 'dsa' && (
                    <>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Topic Name', 'विषय का नाम')}</Label>
                        <Input
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder={t('e.g., Arrays, Trees', 'जैसे: ऐरे, ट्री')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                        />
                      </div>
                      {contentType === 'file' && (
                        <div>
                          <Label className="text-gray-300 text-sm">{t('File Type', 'फाइल प्रकार')}</Label>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant={isNotesPdf ? 'default' : 'outline'}
                              size="sm"
                              className={isNotesPdf ? 'bg-[#F97316] text-white' : 'border-white/10 text-gray-300'}
                              onClick={() => { setIsNotesPdf(true); setIsQuestionsPdf(false); }}
                            >
                              {t('Notes', 'नोट्स')}
                            </Button>
                            <Button
                              variant={isQuestionsPdf ? 'default' : 'outline'}
                              size="sm"
                              className={isQuestionsPdf ? 'bg-[#F97316] text-white' : 'border-white/10 text-gray-300'}
                              onClick={() => { setIsNotesPdf(false); setIsQuestionsPdf(true); }}
                            >
                              {t('Questions', 'प्रश्न')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {contentSection === 'placement' && (
                    <>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Company', 'कंपनी')}</Label>
                        <Input
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder={t('e.g., Google, Amazon', 'जैसे: Google, Amazon')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Category', 'श्रेणी')}</Label>
                        <Input
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder={t('e.g., Aptitude, Technical', 'जैसे: एप्टीट्यूड, टेक्निकल')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Title', 'शीर्षक')}</Label>
                        <Input
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder={t('e.g., Coding Patterns', 'जैसे: कोडिंग पैटर्न')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                        />
                      </div>
                    </>
                  )}

                  {contentType === 'file' && (
                    <div className="pt-4 border-t border-white/10">
                      <Label className="text-gray-300 text-sm">{t('Select File', 'फाइल चुनें')}</Label>
                      <Button
                        variant="outline"
                        className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 mt-2 h-20"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm">{t('Click to upload PDF or Image', 'PDF या इमेज अपलोड करें')}</span>
                          </div>
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  )}

                  {contentType === 'text' && (
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Title (Optional)', 'शीर्षक (वैकल्पिक)')}</Label>
                        <Input
                          value={textTitle}
                          onChange={(e) => setTextTitle(e.target.value)}
                          placeholder={t('e.g., Quick Notes, Summary', 'जैसे: क्विक नोट्स, सारांश')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">{t('Content', 'कंटेंट')}</Label>
                        <Textarea
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          placeholder={t('Write your notes, explanations, or any text content here...', 'यहां अपने नोट्स, व्याख्या, या कोई भी टेक्स्ट कंटेंट लिखें...')}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1 min-h-[200px] resize-y"
                        />
                        <p className="text-gray-500 text-xs mt-1">{t('Tip: You can use basic formatting like headings (#), bold (**text**), lists (- item), and code (`code`)', 'सुझाव: आप हेडिंग (#), बोल्ड (**टेक्स्ट**), सूचियां (- आइटम), और कोड (`कोड`) जैसे बेसिक फॉर्मेटिंग का उपयोग कर सकते हैं')}</p>
                      </div>
                      <Button
                        className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                        onClick={handleTextSave}
                        disabled={saving || !textContent.trim()}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {t('Save Content', 'कंटेंट सेव करें')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Files List */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    {SECTION_LABELS[contentSection]?.icon}
                    {t('Uploaded Content', 'अपलोड किया गया कंटेंट')}
                  </h3>

                  {contentFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <File className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">{t('No content uploaded yet.', 'अभी कोई कंटेंट नहीं अपलोड किया गया।')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {contentFiles.map((file) => (
                        <Card key={file.id} className="bg-gray-800 border-white/5 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-1">
                                {file.content_type === 'text' ? (
                                  <Type className="w-5 h-5 text-green-400" />
                                ) : (
                                  <File className={`w-5 h-5 ${file.file_type === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium truncate">{file.file_name}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {file.content_type === 'text' && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Text', 'टेक्स्ट')}</span>
                                  )}
                                  {file.subject_name && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">{file.subject_name}</span>
                                  )}
                                  {file.unit_number && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">Unit {file.unit_number}</span>
                                  )}
                                  {file.pyq_year && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-[#F97316]/10 text-[#F97316]">{file.pyq_year}</span>
                                  )}
                                  {file.company && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-[#F97316]/10 text-[#F97316]">{file.company}</span>
                                  )}
                                  {file.category && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400">{file.category}</span>
                                  )}
                                  {file.is_notes_pdf && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Notes', 'नोट्स')}</span>
                                  )}
                                  {file.is_questions_pdf && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">{t('Questions', 'प्रश्न')}</span>
                                  )}
                                  {file.answer_pdf_url && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">{t('Has Answer', 'उत्तर है')}</span>
                                  )}
                                </div>
                                {file.content_type === 'text' && file.text_content && (
                                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{file.text_content.substring(0, 150)}...</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {file.file_url && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white"
                                  onClick={() => window.open(file.file_url!, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                onClick={() => openEditDialog(file)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => handleDeleteFile(file)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-4">
              {feedbackList.length === 0 ? (
                <p className="text-gray-500 text-center py-12">{t('No feedback yet.', 'अभी कोई फीडबैक नहीं।')}</p>
              ) : (
                feedbackList.map((fb) => (
                  <Card key={fb.id} className="bg-gray-900 border-white/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold">{fb.name}</p>
                        <p className="text-gray-400 text-sm">{fb.email}</p>
                        <p className="text-gray-300 mt-2">{fb.message}</p>
                      </div>
                      <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="admins">
            <Card className="bg-gray-900 border-white/10 p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#F97316]" />
                {t('Add Admin', 'एडमिन जोड़ें')}
              </h3>
              <div className="flex gap-3">
                <Input
                  placeholder={t('Enter email address', 'ईमेल पता दर्ज करें')}
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 flex-1"
                />
                <Button onClick={handleAddAdmin} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('Add', 'जोड़ें')}
                </Button>
              </div>
            </Card>

            <div className="space-y-3">
              {adminList.map((admin) => (
                <Card key={admin.id} className="bg-gray-900 border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{admin.email}</p>
                    <p className="text-gray-500 text-xs">{t('Added by', 'जोड़ा गया')}: {admin.added_by || 'system'} | {new Date(admin.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDeleteAdmin(admin.id)}
                    disabled={admin.email === user.email}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#F97316]" />
                {t('Edit Content', 'कंटेंट एडिट करें')}
              </DialogTitle>
            </DialogHeader>

            {editingFile && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400 text-sm">{t('File', 'फाइल')}: <span className="text-white">{editingFile.file_name}</span></p>
                  <p className="text-gray-400 text-sm">{t('Type', 'प्रकार')}: <span className="text-white">{editingFile.content_type}</span></p>
                </div>

                {(editingFile.section === 'notes' || editingFile.section === 'pyq') && subjects.length > 0 && (
                  <div>
                    <Label className="text-gray-300 text-sm">{t('Subject', 'विषय')}</Label>
                    <Select value={editSubjectId} onValueChange={setEditSubjectId}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                        <SelectValue placeholder={t('Select a subject...', 'विषय चुनें...')} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 max-h-60">
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id} className="text-white hover:bg-white/10">
                            {sub.name} {sub.code && `(${sub.code})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {editingFile.section === 'notes' && (
                  <div>
                    <Label className="text-gray-300 text-sm">{t('Unit Number', 'यूनिट नंबर')}</Label>
                    <Input
                      type="number"
                      value={editUnitNumber}
                      onChange={(e) => setEditUnitNumber(e.target.value)}
                      placeholder="1, 2, 3..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                    />
                  </div>
                )}

                {editingFile.section === 'pyq' && (
                  <>
                    <div>
                      <Label className="text-gray-300 text-sm">{t('Year', 'वर्ष')}</Label>
                      <Input
                        value={editPyqYear}
                        onChange={(e) => setEditPyqYear(e.target.value)}
                        placeholder="2023, 2024..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">{t('Question Paper PDF', 'प्रश्न पत्र PDF')}</Label>
                      {editFileUrl ? (
                        <div className="flex items-center gap-2 mt-1 bg-blue-500/10 border border-blue-500/30 rounded px-3 py-2">
                          <File className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 text-sm flex-1 truncate">{t('File attached', 'फाइल अटैच की गई')}</span>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-6" onClick={() => window.open(editFileUrl, '_blank')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : null}
                      <Button
                        variant="outline"
                        className="w-full border-white/10 text-gray-300 hover:bg-white/5 mt-2"
                        onClick={() => editFileRef.current?.click()}
                        disabled={editUploadingFile}
                      >
                        {editUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        {editFileUrl ? t('Replace File', 'फाइल बदलें') : t('Upload File', 'फाइल अपलोड करें')}
                      </Button>
                      <input
                        ref={editFileRef}
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handleEditFileUpload}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">{t('Answer PDF', 'उत्तर PDF')}</Label>
                      {editAnswerPdfUrl ? (
                        <div className="flex items-center gap-2 mt-1 bg-green-500/10 border border-green-500/30 rounded px-3 py-2">
                          <File className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm flex-1 truncate">{t('Answer uploaded', 'उत्तर अपलोड किया')}</span>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-6" onClick={() => window.open(editAnswerPdfUrl, '_blank')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-6 w-6 p-0" onClick={() => setEditAnswerPdfUrl(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full border-white/10 text-gray-300 hover:bg-white/5 mt-1"
                          onClick={() => editAnswerRef.current?.click()}
                          disabled={editUploadingAnswer}
                        >
                          {editUploadingAnswer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          {t('Upload Answer PDF', 'उत्तर PDF अपलोड करें')}
                        </Button>
                      )}
                      <input
                        ref={editAnswerRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleEditAnswerUpload}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" className="border-white/10 text-gray-300" onClick={closeEditDialog}>
                {t('Cancel', 'रद्द करें')}
              </Button>
              <Button
                className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                onClick={handleSaveEdit}
                disabled={editSaving}
              >
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {t('Save Changes', 'बदलाव सेव करें')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
