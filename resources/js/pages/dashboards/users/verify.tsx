import { useRef, useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import web from '@/routes/web';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp, Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ยืนยันตัวตน',
        href: web.dashboard.users.verify().url,
    },
];

type VerificationStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'none';
const validStatuses: VerificationStatus[] = [
    'pending',
    'processing',
    'completed',
    'rejected',
    'none',
];
type PersonType = 'individual' | 'corporate';

export default function Page(request: any) {
    const csrfToken = request?.csrf;
    const latestVerification = request?.auth?.user?.latest_verification ?? null;

    const rawStatus = latestVerification?.status_text;

    const status: VerificationStatus =
      validStatuses.includes(rawStatus)
        ? rawStatus
        : 'none';

    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // เพิ่มสถานะบุคคลธรรมดา/นิติบุคคล
    const [personType, setPersonType] = useState<PersonType>(
        (() => {
            if (latestVerification?.data?.person_type === 'corporate') return 'corporate';
            return 'individual';
        })()
    );

    // Ref for file input
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Utility: This will check allowed file types and duplicates by file name+size
    const filterAndMergeFiles = useCallback((existing: File[], incoming: FileList | File[]) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        // File deduplication: treat as duplicate if name+size is the same
        const existingSignatures = new Set(existing.map(f => `${f.name}__${f.size}`));
        const newFiles: File[] = [];
        const duplicated: string[] = [];

        // Allow both FileList and File[] as input
        for (let i = 0; i < (incoming instanceof FileList ? incoming.length : incoming.length); i++) {
            const file = incoming instanceof FileList ? incoming.item(i) : incoming[i];
            if (!file) continue;
            if (!allowedTypes.includes(file.type)) {
                toast.error(`ไฟล์ "${file.name}" ไม่รองรับ โปรดอัปโหลดเฉพาะรูปภาพหรือไฟล์เอกสาร (PDF/DOC/DOCX)`);
                continue;
            }

            const sig = `${file.name}__${file.size}`;
            if (!existingSignatures.has(sig)) {
                newFiles.push(file);
                existingSignatures.add(sig);
            } else {
                duplicated.push(file.name);
            }
        }

        if (duplicated.length > 0) {
            toast.info(`ไฟล์ ${duplicated.join(', ')} เพิ่มเข้ามาใหม่ซ้ำกับที่เลือกแล้ว จึงไม่ถูกเพิ่มซ้ำ`);
        }

        return [...existing, ...newFiles];
    }, []);

    // Change handler for selecting files via the hidden input (not drop)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const targetFiles = event.target.files;
        if (!targetFiles) return;

        const updatedFiles = filterAndMergeFiles(files, targetFiles);
        setFiles(updatedFiles);

        // Reset value so input can fire even with same file re-selected
        event.target.value = '';
    };

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
        // Also reset the input value because after all files are removed user should be able to select same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Added handlers for drag and drop
    const dropzoneRef = useRef<HTMLLabelElement | null>(null);

    // DRAG
    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        // Support drag 'n drop from desktop/finder etc
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            setFiles(prev => filterAndMergeFiles(prev, event.dataTransfer.files));
            // Clear drag data
            event.dataTransfer.clearData();
        }
    }, [filterAndMergeFiles]);

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        // Optional: highlight dropzone on drag-over
        if (dropzoneRef.current) {
            dropzoneRef.current.classList.add('border-primary', 'text-primary');
        }
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        // Remove highlight
        if (dropzoneRef.current) {
            dropzoneRef.current.classList.remove('border-primary', 'text-primary');
        }
    };

    const handlePersonTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPersonType(event.target.value as PersonType);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (files.length === 0) {
            toast.error('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // เพิ่มชนิดบุคคลในการยืนยัน
            formData.append('person_type', personType);

            files.forEach((file) => {
                formData.append('files[]', file);
            });

            const res = await fetch('/api/users/verify', {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': csrfToken,
                },
                body: formData,
            });

            const response = await res.json();

            if (res.ok && (response.code === 201 || response.success)) {
                toast.success('ส่งคำขอยืนยันตัวตนเรียบร้อยแล้ว');
                setFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                toast.error(response.message || 'เกิดข้อผิดพลาดในการส่งคำขอยืนยันตัวตน');
            }
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการส่งคำขอยืนยันตัวตน');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl lg:p-4">
                <Card className="max-w-3xl mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">
                            ยืนยันตัวตนของคุณ
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            เพื่อความปลอดภัยและป้องกันการใช้งานในทางที่ผิด โปรดอัปโหลดเอกสารยืนยันตัวตนของคุณ
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* เพิ่มตัวเลือกประเภทยืนยันตัวตน */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">ประเภทผู้ขอยืนยันตัวตน</h3>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="person_type"
                                        value="individual"
                                        checked={personType === 'individual'}
                                        onChange={handlePersonTypeChange}
                                    />
                                    <span>บุคคลธรรมดา</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="person_type"
                                        value="corporate"
                                        checked={personType === 'corporate'}
                                        onChange={handlePersonTypeChange}
                                    />
                                    <span>นิติบุคคล</span>
                                </label>
                            </div>
                        </div>

                        {/* คำเตือนกรณีส่งซ้ำ */}
                        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 flex items-start gap-2 mb-2">
                            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                            </svg>
                            <span>
                                หากคุณส่งคำขอยืนยันตัวตนซ้ำ <b>แอดมินจะเห็นเฉพาะคำขอล่าสุดเท่านั้น</b> คำขอก่อนหน้าจะถูกแทนที่ กรุณาตรวจสอบข้อมูลและไฟล์ก่อนส่งทุกครั้ง
                            </span>
                        </div>

                        {/* เปลี่ยนรายละเอียดแนะนำตาม personType */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">แนะนำเอกสารที่ควรอัปโหลด</h3>
                            {personType === 'individual' ? (
                                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                    <li>บุคคลธรรมดา: กรุณาอัปโหลด <span className='font-semibold text-foreground'>รูปถ่ายบัตรประชาชน (ด้านหน้า) ที่ชัดเจน เห็นข้อมูลครบถ้วน</span> เท่านั้น</li>
                                    <li>รองรับไฟล์ประเภท: JPEG, PNG, GIF, WEBP ขนาดไม่เกิน 5 MB ต่อไฟล์</li>
                                </ul>
                            ) : (
                                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                    <li>นิติบุคคล: กรุณาอัปโหลด <span className='font-semibold text-foreground'>รูปถ่ายบัตรประชาชนผู้ขอ และเอกสารบริษัท (หนังสือรับรองบริษัท/หนังสือบริคณฑ์สนธิ หรือเอกสารอื่นที่เกี่ยวข้อง เช่น pdf)</span></li>
                                    <li>ตัวอย่างไฟล์เพิ่มเติม: หนังสือรับรองบริษัท, สําเนาบัตรประชาชนกรรมการ, เอกสารภาษี หรือตามความเหมาะสม</li>
                                    <li>รองรับไฟล์ประเภท: JPEG, PNG, GIF, WEBP, PDF, DOC, DOCX ขนาดไม่เกิน 5 MB ต่อไฟล์</li>
                                </ul>
                            )}
                        </div>

                        {status !== 'none' && (
                            <Alert variant={status === 'rejected' ? 'destructive' : 'default'}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>
                                    {status === 'pending' && 'สถานะคำขอ: รอดำเนินการ'}
                                    {status === 'processing' && 'สถานะคำขอ: กำลังตรวจสอบ'}
                                    {status === 'completed' && 'สถานะคำขอ: ผ่านการยืนยันแล้ว'}
                                    {status === 'rejected' && 'สถานะคำขอ: ไม่ผ่านการยืนยัน'}
                                </AlertTitle>
                                <AlertDescription>
                                    {(status === 'pending' || status === 'processing') &&
                                        'ระบบกำลังตรวจสอบข้อมูลของคุณ กรุณารอการแจ้งเตือนผลการยืนยันตัวตน'}
                                    {status === 'completed' &&
                                        'คุณผ่านการยืนยันตัวตนแล้ว สามารถใช้งานระบบได้อย่างเต็มรูปแบบ'}
                                    {status === 'rejected' &&
                                        (latestVerification?.rejected_reason
                                            ? `เหตุผล: ${latestVerification.rejected_reason}`
                                            : 'คำขอถูกปฏิเสธ กรุณาอัปโหลดเอกสารใหม่ให้ชัดเจนมากขึ้น')}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    เลือกไฟล์เอกสารยืนยันตัวตน
                                </label>
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="verification-files"
                                        ref={dropzoneRef}
                                        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/40 px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                    >
                                        <FileUp className="h-4 w-4" />
                                        <span>คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</span>
                                    </label>
                                    <input
                                        id="verification-files"
                                        type="file"
                                        className="hidden"
                                        multiple
                                        ref={fileInputRef}
                                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                                        onChange={handleFileChange}
                                    />
                                    {files.length > 0 && (
                                        <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs">
                                            <div className="font-medium mb-1">
                                                ไฟล์ที่เลือก ({files.length}):
                                            </div>
                                            <ul className="space-y-0.5">
                                                {files.map((file, index) => (
                                                    <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-2">
                                                        <span>
                                                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="text-red-500 text-xs hover:underline ml-2 cursor-pointer"
                                                            onClick={() => removeFile(index)}
                                                            aria-label={`ลบไฟล์ ${file.name}`}
                                                        >
                                                            <Trash className='size-4' />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || files.length === 0}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            กำลังส่งคำขอ...
                                        </>
                                    ) : (
                                        'ส่งคำขอยืนยันตัวตน'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
