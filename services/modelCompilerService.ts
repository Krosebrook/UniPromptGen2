// FIX: Added file extension to fix module resolution error.
import type { ModelProfile } from '../types.ts';

/**
 * Compiles an abstract prompt into a concrete, model-specific, runnable prompt string.
 *
 * @param abstractPrompt - The template string with placeholders like {{type.name}}.
 * @param modelProfile - The profile of the target model, containing formatting rules.
 * @param userInput - A record of user-provided inputs, e.g., { content: '...' }.
 * @returns The compiled, runnable prompt string.
 */
export const compilePrompt = (
  abstractPrompt: string,
  modelProfile: ModelProfile,
  userInput: Record<string, string>
): string => {
  if (!abstractPrompt) return '';

  const placeholderRegex = /{{(.*?)}}/g;

  return abstractPrompt.replace(placeholderRegex, (match, placeholder) => {
    const parts = placeholder.split('.');
    if (parts.length !== 2) return match; // Invalid placeholder

    const type = parts[0];
    const name = parts[1];

    switch (type) {
      case 'instruction':
        if (name === 'role') {
          // Extract content for role from the abstract prompt itself
          const roleContent = extractContent(abstractPrompt, 'instruction.role');
          return modelProfile.formatting_rules.system_prompt(roleContent);
        }
        if (name === 'task') {
          const taskContent = extractContent(abstractPrompt, 'instruction.task');
          return modelProfile.formatting_rules.user_prompt(taskContent);
        }
        break;

      case 'context':
        if (name === 'critical') {
          const criticalContent = extractContent(abstractPrompt, 'context.critical');
          return modelProfile.formatting_rules.critical_context(criticalContent);
        }
        break;

      case 'user_input':
        return userInput[name] || '';

      default:
        return match; // Return the original placeholder if type is unknown
    }
    return ''; // Return empty string for consumed placeholders
  }).replace(/\n{3,}/g, '\n\n').trim(); // Clean up extra newlines
};

/**
 * Helper function to extract content associated with a placeholder.
 * It finds the placeholder and captures the text until the next placeholder or end of string.
 */
const extractContent = (prompt: string, placeholder: string): string => {
  const startTag = `{{${placeholder}}}`;
  const startIndex = prompt.indexOf(startTag);
  if (startIndex === -1) return '';

  const contentStart = startIndex + startTag.length;
  const nextPlaceholderIndex = prompt.indexOf('{{', contentStart);

  const contentEnd = nextPlaceholderIndex !== -1 ? nextPlaceholderIndex : prompt.length;
  
  return prompt.substring(contentStart, contentEnd).trim();
};