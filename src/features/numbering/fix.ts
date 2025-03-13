/**
 * Numbering Fix functionality
 * 
 * This module provides functions for fixing numbering in ordered lists and section headers.
 */

/**
 * Fix numbering in lines
 * @param lines - The lines to fix numbering in
 * @returns - The lines with fixed numbering
 */
export function fixNumberingInLines(lines: string[]): string[] {
  const fixedLines = [...lines];
  
  // Track list state
  let inList = false;
  let listLevel = 0;
  let listCounters: Record<number, number> = {};
  
  // Track section state
  let sectionCounters: number[] = [0];
  
  for (let i = 0; i < fixedLines.length; i++) {
    const line = fixedLines[i];
    
    // Check for section headers (e.g., "1. Section Name")
    const sectionMatch = line.match(/^(\d+)(\.\d+)*\.?\s+(.+)$/);
    if (sectionMatch) {
      // Extract the section number part
      const sectionNumberMatch = line.match(/^(\d+(?:\.\d+)*)(?:\.?\s+)/);
      if (!sectionNumberMatch) {
        continue; // Skip if we can't extract the section number
      }
      const sectionNumberPart = sectionNumberMatch[1];
      const sectionParts = sectionNumberPart.split('.');
      const sectionLevel = sectionParts.length;
      
      // Ensure we have enough counters for this level
      while (sectionCounters.length < sectionLevel) {
        sectionCounters.push(0);
      }
      
      // If we're at a new level, reset deeper levels
      if (sectionLevel < sectionCounters.length) {
        sectionCounters = sectionCounters.slice(0, sectionLevel);
        sectionCounters.push(0);
      }
      
      // Increment the counter for this level
      sectionCounters[sectionLevel - 1]++;
      
      // Build the new section number
      const newSectionNumber = sectionCounters.slice(0, sectionLevel).join('.');
      
      // Replace the section number
      fixedLines[i] = `${newSectionNumber}. ${sectionMatch[3]}`;
      
      // Reset list state after a section header
      inList = false;
      listLevel = 0;
      listCounters = {};
      
      continue;
    }
    
    // Check for ordered lists
    const listMatch = line.match(/^(\s*)(\d+|[a-z])\.(\s+)(.+)$/i);
    if (listMatch) {
      const indentation = listMatch[1];
      const marker = listMatch[2];
      const spacing = listMatch[3];
      const content = listMatch[4];
      
      // Determine list level based on indentation
      const currentLevel = Math.floor(indentation.length / 4) + 1;
      
      // If we're starting a new list or changing levels
      if (!inList || currentLevel !== listLevel) {
        // Reset counters for this level and deeper
        for (let level = currentLevel; level <= 10; level++) {
          listCounters[level] = 0;
        }
        
        inList = true;
        listLevel = currentLevel;
      }
      
      // Increment the counter for this level
      listCounters[currentLevel]++;
      
      // Determine the new marker based on level
      let newMarker: string;
      if (currentLevel % 2 === 1) {
        // Odd levels use numbers (1, 2, 3...)
        newMarker = listCounters[currentLevel].toString();
      } else {
        // Even levels use letters (a, b, c...)
        newMarker = String.fromCharCode(96 + listCounters[currentLevel]);
      }
      
      // Replace the line with the new marker
      fixedLines[i] = `${indentation}${newMarker}.${spacing}${content}`;
      
      continue;
    } else if (line.trim() === '') {
      // Empty line - might be the end of a list
      // We don't reset list state here to support lists with blank lines
    } else if (!line.match(/^\s+/)) {
      // Non-indented, non-list line - end of list
      inList = false;
      listLevel = 0;
      listCounters = {};
    }
  }
  
  return fixedLines;
}

/**
 * Count the number of differences between two arrays of strings
 * @param original - The original lines
 * @param fixed - The fixed lines
 * @returns - The number of lines that were changed
 */
export function countChangedLines(original: string[], fixed: string[]): number {
  let changedLines = 0;
  const minLength = Math.min(original.length, fixed.length);
  
  for (let i = 0; i < minLength; i++) {
    if (original[i] !== fixed[i]) {
      changedLines++;
    }
  }
  
  // Add any additional lines as changes
  changedLines += Math.abs(original.length - fixed.length);
  
  return changedLines;
}