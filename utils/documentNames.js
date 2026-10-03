const normalizedName = (name = '') => name.trim().toLocaleLowerCase();

export const getAvailableDocumentName = (
  originalName = 'document',
  existingNames = []
) => {
  const name = originalName.trim() || 'document';
  const occupiedNames = new Set(
    existingNames
      .filter(Boolean)
      .map((existingName) => normalizedName(existingName))
  );

  if (!occupiedNames.has(normalizedName(name))) {
    return name;
  }

  const lastDot = name.lastIndexOf('.');
  const baseName = lastDot > 0 ? name.slice(0, lastDot) : name;
  const extension = lastDot > 0 ? name.slice(lastDot) : '';

  let number = 1;
  let candidate = `${baseName} (${number})${extension}`;

  while (occupiedNames.has(normalizedName(candidate))) {
    number += 1;
    candidate = `${baseName} (${number})${extension}`;
  }

  return candidate;
};
