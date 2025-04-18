"use client";

import React from 'react';
import { sanitizeHtml } from '@/lib/utils';

export interface SanitizedHtmlProps {
  html: string;
  className?: string;
  component?: keyof JSX.IntrinsicElements;
}

/**
 * Component for rendering sanitized HTML safely
 * Uses DOMPurify to sanitize HTML content before rendering
 */
export function SanitizedHtml({
  html,
  className = '',
  component: Component = 'div',
}: SanitizedHtmlProps) {
  // Sanitize the HTML on the client side
  const sanitizedHtml = React.useMemo(() => {
    return sanitizeHtml(html);
  }, [html]);

  // Create the props for the component
  const props = {
    className,
    dangerouslySetInnerHTML: { __html: sanitizedHtml },
  };

  // Render the sanitized HTML in the specified component
  return React.createElement(Component, props);
}

/**
 * Specialized component for rendering shorter HTML content
 */
export function SanitizedContent({
  html,
  className = '',
}: {
  html: string;
  className?: string;
}) {
  return (
    <SanitizedHtml
      html={html}
      className={className}
      component="div"
    />
  );
}

/**
 * Specialized component for rendering larger HTML descriptions
 */
export function SanitizedDescription({
  html,
  className = '',
}: {
  html: string;
  className?: string;
}) {
  return (
    <SanitizedHtml
      html={html}
      className={`prose dark:prose-invert max-w-none ${className}`}
      component="article"
    />
  );
}