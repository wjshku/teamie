// ==================== Export Meeting to Markdown ====================
// Export all meeting data (pre, in, post) to Notion-compatible Markdown

import { Meeting, PreMeeting, InMeeting, PostMeeting } from '../types/api';

interface ExportMeetingData {
  meeting: Meeting;
  preMeeting?: PreMeeting | null;
  inMeeting?: InMeeting | null;
  postMeeting?: PostMeeting | null;
}

/**
 * Format timestamp to readable date string
 * Handles both ISO format and custom format like "2025-10-24T10:00 America/Los_Angeles"
 */
const formatTimestamp = (timestamp: string): string => {
  try {
    // Check if timestamp contains timezone info (custom format)
    if (timestamp.includes(' ') && !timestamp.includes('GMT')) {
      // Split datetime and timezone: "2025-10-24T10:00 America/Los_Angeles"
      const [dateTimePart, timezonePart] = timestamp.split(' ', 2);
      const date = new Date(dateTimePart);

      if (isNaN(date.getTime())) {
        return timestamp; // Return original if parsing fails
      }

      const dateStr = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Format timezone nicely (e.g., "America/Los_Angeles" -> "Los Angeles")
      const tzFormatted = timezonePart ? timezonePart.split('/').pop()?.replace(/_/g, ' ') : '';

      return tzFormatted ? `${dateStr} (${tzFormatted})` : dateStr;
    }

    // Standard ISO format or other date formats
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return timestamp; // Return original if parsing fails
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
};

/**
 * Generate Notion-compatible markdown from meeting data
 */
export const generateMeetingMarkdown = (data: ExportMeetingData): string => {
  const { meeting, preMeeting, inMeeting, postMeeting } = data;

  let markdown = '';

  // ============ Meeting Header ============
  markdown += `# ${meeting.title}\n\n`;
  markdown += `**Meeting ID:** ${meeting.meetingid}\n\n`;
  markdown += `**Date & Time:** ${formatTimestamp(meeting.time)}\n\n`;

  // Participants
  if (meeting.participants && meeting.participants.length > 0) {
    markdown += `**Participants:** `;
    markdown += meeting.participants.map(p => p.name).join(', ');
    markdown += '\n\n';
  }

  // Vote Link
  if (meeting.votelink) {
    markdown += `**Vote Link:** [${meeting.votelink}](${meeting.votelink})\n\n`;
  }

  markdown += '---\n\n';

  // ============ Pre-Meeting Section ============
  if (preMeeting) {
    markdown += `## 🕒 Pre-Meeting Preparation\n\n`;

    // Objective
    if (preMeeting.objective) {
      markdown += `### Meeting Objective\n\n`;
      markdown += `${preMeeting.objective}\n\n`;
    }

    // Questions Table
    if (preMeeting.questions && preMeeting.questions.length > 0) {
      markdown += `### Questions & Topics\n\n`;
      markdown += `| # | Author | Question | Time |\n`;
      markdown += `|---|--------|----------|------|\n`;
      preMeeting.questions.forEach((question, index) => {
        // Escape pipe characters in content and replace newlines with <br>
        const content = question.content.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
        markdown += `| ${index + 1} | ${question.author} | ${content} | ${formatTimestamp(question.timestamp)} |\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  }

  // ============ In-Meeting Section ============
  if (inMeeting && inMeeting.notes && inMeeting.notes.length > 0) {
    markdown += `## 💬 In-Meeting Notes\n\n`;

    markdown += `| # | Author | Note | Time |\n`;
    markdown += `|---|--------|------|------|\n`;
    inMeeting.notes.forEach((note, index) => {
      // Escape pipe characters in content and replace newlines with <br>
      const content = note.content.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
      markdown += `| ${index + 1} | ${note.author} | ${content} | ${formatTimestamp(note.timestamp)} |\n`;
    });
    markdown += '\n';

    markdown += '---\n\n';
  }

  // ============ Post-Meeting Section ============
  if (postMeeting) {
    markdown += `## ✅ Post-Meeting Summary\n\n`;

    // Summary
    if (postMeeting.summary) {
      markdown += `### Meeting Summary\n\n`;
      markdown += `${postMeeting.summary}\n\n`;
    }

    // Feedbacks Table
    if (postMeeting.feedbacks && postMeeting.feedbacks.length > 0) {
      markdown += `### Team Feedback\n\n`;
      markdown += `| # | Author | Feedback | Time |\n`;
      markdown += `|---|--------|----------|------|\n`;
      postMeeting.feedbacks.forEach((feedback, index) => {
        // Escape pipe characters in content and replace newlines with <br>
        const content = feedback.content.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
        markdown += `| ${index + 1} | ${feedback.author} | ${content} | ${formatTimestamp(feedback.timestamp)} |\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  }

  // Footer
  markdown += `\n*Exported from Teamie on ${new Date().toLocaleString()}*\n`;

  return markdown;
};

/**
 * Download markdown file
 */
export const downloadMarkdown = (markdown: string, filename: string): void => {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export meeting to markdown and download
 */
export const exportMeetingToMarkdown = (data: ExportMeetingData): void => {
  const markdown = generateMeetingMarkdown(data);
  const filename = `${data.meeting.title.replace(/[^a-z0-9]/gi, '_')}_${data.meeting.meetingid}`;
  downloadMarkdown(markdown, filename);
};

/**
 * Copy markdown to clipboard
 */
export const copyMarkdownToClipboard = async (markdown: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
