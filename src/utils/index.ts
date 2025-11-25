
export function createPageUrl(pageName: string): string {
    // Convert camelCase to kebab-case: ProductLines -> product-lines
    const kebabCase = pageName
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert hyphen between lowercase and uppercase
        .toLowerCase()
        .replace(/ /g, '-'); // Replace spaces with hyphens
    return '/' + kebabCase;
}