import { PromptVariable } from '../types.ts';

export interface AnalysisWarning {
    type: 'VariableMismatch' | 'Clarity';
    message: string;
}

export interface AnalysisResult {
    warnings: AnalysisWarning[];
    tokenCount: number;
}

const WEAK_PHRASES = [
    'be creative', 'think outside the box', 'do your best', 'as you see fit', 'without any restrictions',
    'make it interesting', 'make it good', 'make it better',
];

/**
 * Analyzes a prompt's content and variables for potential issues.
 * @param content The prompt template string.
 * @param variables The array of defined PromptVariable objects.
 * @returns An AnalysisResult object with warnings and token count.
 */
export const analyzePrompt = (content: string, variables: PromptVariable[]): AnalysisResult => {
    const warnings: AnalysisWarning[] = [];

    // 1. Token Estimation (simple heuristic)
    const tokenCount = Math.round(content.length / 4);

    // 2. Variable Mismatch Check
    const definedVars = new Set(variables.map(v => v.name));
    const usedVarsMatches = content.matchAll(/{{([a-zA-Z_][a-zA-Z0-9_]*)}}/g);
    const usedVars = new Set(Array.from(usedVarsMatches, match => match[1]));

    // Find variables defined but not used
    definedVars.forEach(definedVar => {
        if (!usedVars.has(definedVar)) {
            warnings.push({
                type: 'VariableMismatch',
                message: `Variable "${definedVar}" is defined but not used in the prompt.`
            });
        }
    });

    // Find variables used but not defined
    usedVars.forEach(usedVar => {
        if (!definedVars.has(usedVar)) {
            warnings.push({
                type: 'VariableMismatch',
                message: `Variable "{{${usedVar}}}" is used but not defined.`
            });
        }
    });

    // 3. Clarity Check for weak phrases
    WEAK_PHRASES.forEach(phrase => {
        if (content.toLowerCase().includes(phrase)) {
            warnings.push({
                type: 'Clarity',
                message: `The phrase "${phrase}" is ambiguous. Consider providing more specific instructions.`
            });
        }
    });


    return {
        warnings,
        tokenCount,
    };
};
