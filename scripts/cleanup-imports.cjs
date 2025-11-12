#!/usr/bin/env node

/**
 * Intelligent Import Cleanup Utility
 * Analyzes and removes unused imports to optimize bundle size
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ImportCleanupAnalyzer {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.unusedImports = new Map();
    this.circularDependencies = new Set();
    this.duplicateImports = new Map();
    this.report = {
      filesAnalyzed: 0,
      unusedImportsFound: 0,
      circularDependenciesFound: 0,
      duplicateImportsFound: 0,
      potentialSavings: 0
    };
  }

  async analyzeProject() {
    console.log('🔍 Starting intelligent import analysis...\n');
    
    try {
      // Get all JavaScript/TypeScript files
      const files = await this.getAllFiles(this.srcDir);
      const jsFiles = files.filter(file => 
        /\.(js|jsx|ts|tsx)$/.test(file) && 
        !file.includes('node_modules') &&
        !file.includes('.test.') &&
        !file.includes('.spec.')
      );

      console.log(`📁 Found ${jsFiles.length} files to analyze\n`);

      // Analyze each file
      for (const file of jsFiles) {
        await this.analyzeFile(file);
        this.report.filesAnalyzed++;
      }

      // Generate comprehensive report
      this.generateReport();
      
      // Suggest optimizations
      this.suggestOptimizations();

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }

  async getAllFiles(dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...await this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
    
    return files;
  }

  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(this.srcDir, filePath);
      
      // Extract imports
      const imports = this.extractImports(content);
      
      // Check for unused imports
      const unusedInFile = this.findUnusedImports(content, imports);
      if (unusedInFile.length > 0) {
        this.unusedImports.set(relativePath, unusedInFile);
        this.report.unusedImportsFound += unusedInFile.length;
      }

      // Check for duplicate imports
      const duplicates = this.findDuplicateImports(imports);
      if (duplicates.length > 0) {
        this.duplicateImports.set(relativePath, duplicates);
        this.report.duplicateImportsFound += duplicates.length;
      }

      // Check for circular dependencies (basic check)
      this.checkCircularDependencies(filePath, imports);

    } catch (error) {
      console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
    }
  }

  extractImports(content) {
    const imports = [];
    
    // Match various import patterns
    const importPatterns = [
      // import { named } from 'module'
      /import\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/g,
      // import defaultImport from 'module'
      /import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
      // import * as namespace from 'module'
      /import\s+\*\s+as\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
      // import 'module' (side effect)
      /import\s+['"`]([^'"`]+)['"`]/g,
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[2]) {
          // Named or default imports
          const namedImports = match[1] ? match[1].split(',').map(s => s.trim()) : [];
          imports.push({
            type: 'named',
            names: namedImports,
            module: match[2],
            fullMatch: match[0]
          });
        } else {
          // Side effect import
          imports.push({
            type: 'sideEffect',
            module: match[1],
            fullMatch: match[0]
          });
        }
      }
    }

    return imports;
  }

  findUnusedImports(content, imports) {
    const unused = [];
    
    for (const importItem of imports) {
      if (importItem.type === 'sideEffect') {
        // Side effect imports are usually intentional
        continue;
      }

      for (const name of importItem.names) {
        const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
        
        // Check if the import is used in the file
        const usagePatterns = [
          new RegExp(`\\b${cleanName}\\b`, 'g'),
          new RegExp(`<${cleanName}[\\s>]`, 'g'), // JSX usage
          new RegExp(`${cleanName}\\(`, 'g'), // Function call
          new RegExp(`${cleanName}\\.`, 'g'), // Property access
        ];

        const isUsed = usagePatterns.some(pattern => {
          const matches = content.match(pattern);
          return matches && matches.length > 1; // More than just the import declaration
        });

        if (!isUsed) {
          unused.push({
            name: cleanName,
            module: importItem.module,
            fullImport: importItem.fullMatch
          });
        }
      }
    }

    return unused;
  }

  findDuplicateImports(imports) {
    const moduleMap = new Map();
    const duplicates = [];

    for (const importItem of imports) {
      const module = importItem.module;
      
      if (moduleMap.has(module)) {
        duplicates.push({
          module,
          imports: [moduleMap.get(module), importItem]
        });
      } else {
        moduleMap.set(module, importItem);
      }
    }

    return duplicates;
  }

  checkCircularDependencies(filePath, imports) {
    // Basic circular dependency detection
    // This is a simplified version - a full implementation would need dependency graph analysis
    
    for (const importItem of imports) {
      if (importItem.module.startsWith('./') || importItem.module.startsWith('../')) {
        const importedFile = path.resolve(path.dirname(filePath), importItem.module);
        
        // Check if the imported file imports back to this file
        // This is a simplified check and would need more sophisticated analysis for real projects
        if (this.circularDependencies.has(`${importedFile}->${filePath}`)) {
          this.circularDependencies.add(`${filePath}->${importedFile}`);
          this.report.circularDependenciesFound++;
        }
      }
    }
  }

  generateReport() {
    console.log('📊 IMPORT ANALYSIS REPORT');
    console.log('========================\n');
    
    console.log(`📁 Files analyzed: ${this.report.filesAnalyzed}`);
    console.log(`🗑️  Unused imports found: ${this.report.unusedImportsFound}`);
    console.log(`🔄 Duplicate imports found: ${this.report.duplicateImportsFound}`);
    console.log(`⚠️  Circular dependencies found: ${this.report.circularDependenciesFound}\n`);

    // Detailed unused imports
    if (this.unusedImports.size > 0) {
      console.log('🗑️  UNUSED IMPORTS:');
      console.log('------------------');
      
      for (const [file, unused] of this.unusedImports) {
        console.log(`\n📄 ${file}:`);
        for (const item of unused) {
          console.log(`   ❌ ${item.name} from '${item.module}'`);
        }
      }
      console.log();
    }

    // Detailed duplicate imports
    if (this.duplicateImports.size > 0) {
      console.log('🔄 DUPLICATE IMPORTS:');
      console.log('--------------------');
      
      for (const [file, duplicates] of this.duplicateImports) {
        console.log(`\n📄 ${file}:`);
        for (const duplicate of duplicates) {
          console.log(`   ⚠️  Multiple imports from '${duplicate.module}'`);
        }
      }
      console.log();
    }

    // Circular dependencies
    if (this.circularDependencies.size > 0) {
      console.log('⚠️  CIRCULAR DEPENDENCIES:');
      console.log('-------------------------');
      
      for (const circular of this.circularDependencies) {
        console.log(`   🔄 ${circular}`);
      }
      console.log();
    }
  }

  suggestOptimizations() {
    console.log('💡 OPTIMIZATION SUGGESTIONS:');
    console.log('============================\n');

    if (this.report.unusedImportsFound > 0) {
      console.log('1. 🗑️  Remove unused imports:');
      console.log('   - Reduces bundle size');
      console.log('   - Improves build performance');
      console.log('   - Cleaner code');
      console.log('   - Run: npm run cleanup:imports\n');
    }

    if (this.report.duplicateImportsFound > 0) {
      console.log('2. 🔄 Consolidate duplicate imports:');
      console.log('   - Combine multiple imports from same module');
      console.log('   - Reduces parser overhead');
      console.log('   - Better code organization\n');
    }

    if (this.report.circularDependenciesFound > 0) {
      console.log('3. ⚠️  Resolve circular dependencies:');
      console.log('   - Refactor code structure');
      console.log('   - Use dependency injection');
      console.log('   - Extract shared utilities\n');
    }

    // Bundle optimization suggestions
    console.log('4. 📦 Bundle optimization suggestions:');
    console.log('   - Use dynamic imports for large components');
    console.log('   - Implement code splitting');
    console.log('   - Consider lazy loading for routes');
    console.log('   - Use React.memo for expensive components\n');

    // Performance suggestions
    console.log('5. ⚡ Performance optimizations:');
    console.log('   - Implement virtual scrolling for large lists');
    console.log('   - Use React Query for data caching');
    console.log('   - Optimize re-renders with useMemo/useCallback');
    console.log('   - Consider service workers for caching\n');
  }

  async generateCleanupScript() {
    console.log('🛠️  Generating cleanup script...\n');
    
    let script = '#!/usr/bin/env node\n\n';
    script += '// Auto-generated import cleanup script\n';
    script += '// Run with: node scripts/auto-cleanup.js\n\n';
    script += 'const fs = require("fs").promises;\n\n';
    
    script += 'async function cleanupImports() {\n';
    script += '  console.log("🧹 Starting automatic import cleanup...");\n\n';

    for (const [file, unused] of this.unusedImports) {
      script += `  // Cleanup ${file}\n`;
      script += `  await cleanupFile("src/${file}", [\n`;
      
      for (const item of unused) {
        script += `    { name: "${item.name}", module: "${item.module}" },\n`;
      }
      
      script += '  ]);\n\n';
    }

    script += '  console.log("✅ Import cleanup completed!");\n';
    script += '}\n\n';

    script += 'async function cleanupFile(filePath, unusedImports) {\n';
    script += '  try {\n';
    script += '    let content = await fs.readFile(filePath, "utf8");\n';
    script += '    \n';
    script += '    for (const unused of unusedImports) {\n';
    script += '      // Remove unused import\n';
    script += '      const importRegex = new RegExp(\n';
    script += '        `import\\\\s+\\\\{[^}]*\\\\b${unused.name}\\\\b[^}]*\\\\}\\\\s+from\\\\s+[\'"\`]${unused.module.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}[\'"\`]`,\n';
    script += '        "g"\n';
    script += '      );\n';
    script += '      content = content.replace(importRegex, "");\n';
    script += '    }\n';
    script += '    \n';
    script += '    await fs.writeFile(filePath, content);\n';
    script += '    console.log(`✅ Cleaned up ${filePath}`);\n';
    script += '  } catch (error) {\n';
    script += '    console.error(`❌ Failed to cleanup ${filePath}:`, error.message);\n';
    script += '  }\n';
    script += '}\n\n';

    script += 'cleanupImports().catch(console.error);\n';

    // Write the cleanup script
    await fs.writeFile('scripts/auto-cleanup.js', script);
    console.log('✅ Cleanup script generated: scripts/auto-cleanup.js');
    console.log('   Run with: node scripts/auto-cleanup.js\n');
  }
}

// Main execution
async function main() {
  const analyzer = new ImportCleanupAnalyzer();
  
  try {
    await analyzer.analyzeProject();
    
    if (analyzer.report.unusedImportsFound > 0) {
      await analyzer.generateCleanupScript();
    }
    
    console.log('🎉 Analysis completed successfully!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ImportCleanupAnalyzer;