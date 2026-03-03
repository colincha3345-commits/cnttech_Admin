/**
 * POS 일괄 업로드 모달
 */
import React, { useState, useRef } from 'react';
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { Modal, Button, Spinner, Badge } from '@/components/ui';
import { usePreviewPOSBulkUpload, useExecutePOSBulkUpload, useToast } from '@/hooks';
import { parsePOSBulkUploadExcel, downloadPOSBulkUploadTemplate } from '@/utils/excel';
import { validateExcelFile } from '@/utils/fileValidation';
import type { POSBulkUploadRow, BulkUploadPreviewItem } from '@/types/store';

interface POSBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadStep = 'upload' | 'preview' | 'result';

export const POSBulkUploadModal: React.FC<POSBulkUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<UploadStep>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<POSBulkUploadRow[]>([]);
  const [previewItems, setPreviewItems] = useState<BulkUploadPreviewItem[]>([]);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; storeName: string; reason: string }>;
  } | null>(null);

  const previewMutation = usePreviewPOSBulkUpload();
  const executeMutation = useExecutePOSBulkUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증 (MIME + 확장자 + 크기 이중 체크)
    const validation = validateExcelFile(file);
    if (!validation.valid) {
      toast.error(validation.error ?? '잘못된 파일입니다.');
      return;
    }

    try {
      setFileName(file.name);
      const rows = await parsePOSBulkUploadExcel(file);

      if (rows.length === 0) {
        toast.error('파일에 데이터가 없습니다.');
        return;
      }

      setParsedRows(rows);

      // 미리보기 실행
      const preview = await previewMutation.mutateAsync(rows);
      setPreviewItems(preview);
      setStep('preview');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '파일 파싱에 실패했습니다.');
    }
  };

  const handleExecute = async () => {
    try {
      const result = await executeMutation.mutateAsync(parsedRows);
      setUploadResult(result);
      setStep('result');

      if (result.success > 0 && result.failed === 0) {
        toast.success(`${result.success}건의 POS 정보가 업데이트되었습니다.`);
      } else if (result.success > 0 && result.failed > 0) {
        toast.warning(`${result.success}건 성공, ${result.failed}건 실패`);
      } else {
        toast.error('모든 항목이 실패했습니다.');
      }
    } catch (error) {
      toast.error('업로드에 실패했습니다.');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFileName('');
    setParsedRows([]);
    setPreviewItems([]);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const matchedCount = previewItems.filter((item) => item.isMatched).length;
  const unmatchedCount = previewItems.filter((item) => !item.isMatched).length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="POS 일괄 업로드" size="lg">
      <div className="space-y-6">
        {/* 단계 1: 파일 업로드 */}
        {step === 'upload' && (
          <>
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <UploadOutlined className="text-4xl text-txt-muted mb-4" />
              <p className="text-txt-secondary mb-4">
                엑셀 파일을 선택하거나 드래그하여 업로드하세요
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <UploadOutlined className="mr-1" />
                파일 선택
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
              <div>
                <p className="text-sm font-medium">업로드 템플릿</p>
                <p className="text-xs text-txt-muted mt-1">
                  매장명, 사업자번호, POS벤더, POS코드, 시리얼번호 컬럼이 필요합니다.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadPOSBulkUploadTemplate}>
                <DownloadOutlined className="mr-1" />
                템플릿 다운로드
              </Button>
            </div>

            <div className="text-sm text-txt-muted">
              <p className="font-medium mb-2">유의사항:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>매장명과 사업자번호가 일치해야 매칭됩니다.</li>
                <li>사업자번호 형식: 123-45-67890 또는 1234567890</li>
                <li>POS벤더: okpos, unionpos, kcp, okcashbag, other</li>
              </ul>
            </div>
          </>
        )}

        {/* 단계 2: 미리보기 */}
        {step === 'preview' && (
          <>
            <div className="flex items-center gap-4 p-4 bg-bg-secondary rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-txt-muted">총 {previewItems.length}건</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <Badge variant="success">{matchedCount}건 매칭</Badge>
                </div>
                {unmatchedCount > 0 && (
                  <div className="text-center">
                    <Badge variant="critical">{unmatchedCount}건 미매칭</Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto">
              <table className="data-table w-full">
                <thead className="sticky top-0 bg-bg-secondary">
                  <tr>
                    <th className="w-12 text-center">#</th>
                    <th>매장명</th>
                    <th>사업자번호</th>
                    <th>POS벤더</th>
                    <th>POS코드</th>
                    <th className="w-16 text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {previewItems.map((item) => (
                    <tr
                      key={item.row}
                      className={!item.isMatched ? 'bg-critical/5' : ''}
                    >
                      <td className="text-center text-txt-muted">{item.row}</td>
                      <td>{item.storeName}</td>
                      <td className="font-mono text-sm">{item.businessNumber}</td>
                      <td>{item.data.posVendor}</td>
                      <td className="font-mono text-sm">{item.data.posCode}</td>
                      <td className="text-center">
                        {item.isMatched ? (
                          <CheckCircleOutlined className="text-success" />
                        ) : (
                          <span title={item.matchError}>
                            <CloseCircleOutlined className="text-critical" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {unmatchedCount > 0 && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                <ExclamationCircleOutlined className="text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-warning">
                    {unmatchedCount}건의 데이터가 매칭되지 않았습니다.
                  </p>
                  <p className="text-txt-muted mt-1">
                    미매칭된 항목은 업로드에서 제외됩니다.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* 단계 3: 결과 */}
        {step === 'result' && uploadResult && (
          <>
            <div className="text-center py-8">
              {uploadResult.failed === 0 ? (
                <CheckCircleOutlined className="text-5xl text-success mb-4" />
              ) : (
                <ExclamationCircleOutlined className="text-5xl text-warning mb-4" />
              )}
              <h3 className="text-lg font-medium mb-2">업로드 완료</h3>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <span className="text-success font-medium">{uploadResult.success}</span>
                  <span className="text-txt-muted"> 성공</span>
                </div>
                <div>
                  <span className="text-critical font-medium">{uploadResult.failed}</span>
                  <span className="text-txt-muted"> 실패</span>
                </div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="max-h-[200px] overflow-auto">
                <table className="data-table w-full">
                  <thead className="sticky top-0 bg-bg-secondary">
                    <tr>
                      <th className="w-12 text-center">#</th>
                      <th>매장명</th>
                      <th>실패 사유</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.errors.map((error, index) => (
                      <tr key={index} className="bg-critical/5">
                        <td className="text-center text-txt-muted">{error.row}</td>
                        <td>{error.storeName}</td>
                        <td className="text-critical">{error.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleReset}>
                다시 선택
              </Button>
              <Button
                onClick={handleExecute}
                disabled={matchedCount === 0 || executeMutation.isPending}
              >
                {executeMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  `${matchedCount}건 업로드`
                )}
              </Button>
            </>
          )}

          {step === 'result' && (
            <Button onClick={handleClose}>확인</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
