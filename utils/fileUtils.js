export const getFileType = (name = '', mimeType = '') => {
  const ext = name.split('.').pop().toLowerCase();
  if (mimeType.includes('pdf') || ext === 'pdf') return 'PDF';
  if (['doc', 'docx'].includes(ext)) return 'Word';
  if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Excel';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)
    || mimeType.includes('zip')
    || mimeType.includes('rar')
    || mimeType.includes('7z')
    || mimeType.includes('compressed')) return 'Nén';
  if (ext === 'txt') return 'Text';
  return 'File';
};
export const filePresentation = (type) => ({
  PDF: ['file-pdf', '#E95151'], Word: ['file-word', '#3578C8'],
  PowerPoint: ['file-powerpoint', '#EC7545'], Excel: ['file-excel', '#2E9D70'],
  'Nén': ['file-archive', '#9B6BDB'],
  Text: ['file-alt', '#697586'], File: ['file', '#697586']
}[type] || ['file', '#697586']);
export const formatBytes = (bytes) => {
  if (!bytes) return "Không rõ dung lượng";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
