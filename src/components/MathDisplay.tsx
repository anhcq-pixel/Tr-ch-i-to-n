import React, { useMemo } from 'react';
import katex from 'katex';

interface MathDisplayProps {
  text: string;
  latex?: string;
  className?: string;
  inline?: boolean;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
}

// Convert plain text math into pristine LaTeX markup for Vietnamese textbook notation
function textToLatex(input: string): string {
  let s = input.trim();

  // If already standard LaTeX with \frac or \sqrt, ensure dfrac for clear fraction line
  if (s.includes('\\frac') || s.includes('\\dfrac') || s.includes('\\sqrt') || s.includes('\\pi') || s.includes('\\alpha')) {
    return s.replace(/\\frac\b/g, '\\dfrac');
  }

  // Replace Greek alpha
  s = s.replace(/α/g, '\\alpha ');

  // Replace degree symbols: e.g. 60° -> 60^\circ, n° -> n^\circ, α° -> \alpha^\circ
  s = s.replace(/([a-zA-Z0-9\\]+)\s*°/g, '{$1}^\\circ');
  s = s.replace(/°/g, '^\\circ');

  // Replace exponents
  s = s.replace(/²/g, '^2');
  s = s.replace(/³/g, '^3');

  // Replace pi
  s = s.replace(/π/g, '\\pi ');

  // Replace square roots like 3√10 -> 3\sqrt{10}, √7 -> \sqrt{7}
  s = s.replace(/(\d*)√(\d+)/g, (_match, prefix, num) => {
    return `${prefix ? prefix + ' ' : ''}\\sqrt{${num}}`;
  });

  // Replace subscripts: r1 -> r_1, r2 -> r_2, r₁ -> r_1, r₂ -> r_2
  s = s.replace(/r[1₁]/g, 'r_1');
  s = s.replace(/r[2₂]/g, 'r_2');

  // Replace units: cm² -> \text{ cm}^2, cm -> \text{ cm}
  s = s.replace(/cm\^2/g, '\\text{ cm}^2');
  s = s.replace(/cm²/g, '\\text{ cm}^2');
  s = s.replace(/\bcm\b/g, '\\text{ cm}');

  // Replace fraction expressions: e.g.
  // "S = πr²α / 360" -> "S = \dfrac{\pi r^2 \alpha}{360}"
  // "l = πRn / 180" -> "l = \dfrac{\pi R n}{180}"
  // "10π / 3" -> "\dfrac{10\pi}{3}"
  // "9π / 2" -> "\dfrac{9\pi}{2}"
  // "S = πa²x / 360" -> "S = \dfrac{\pi a^2 x}{360}"
  // "S = 2πax / 360" -> "S = \dfrac{2\pi a x}{360}"
  s = s.replace(
    /([A-Za-z]\s*=\s*)?\(?([0-9a-zA-Z\s\\pi\\alpha\^\{\}_]+?)\)?\s*\/\s*(\d+)/g,
    (_m, eq, num, den) => {
      const eqPrefix = eq ? eq : '';
      return `${eqPrefix}\\dfrac{${num.trim()}}{${den.trim()}}`;
    }
  );

  return s;
}

export const MathDisplay: React.FC<MathDisplayProps> = ({
  text,
  latex,
  className = '',
  inline = true,
  size = 'base',
}) => {
  const html = useMemo(() => {
    // If explicit latex is provided, render it directly with KaTeX
    if (latex) {
      try {
        const ltx = latex.replace(/\\frac\b/g, '\\dfrac');
        return katex.renderToString(ltx, {
          displayMode: !inline,
          throwOnError: false,
        });
      } catch {
        // Fallback
      }
    }

    if (!text) return '';

    try {
      // Check if text has Vietnamese characters (a full question sentence)
      const hasVietnameseLetters = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i.test(
        text
      );

      // If it's pure formula/choice like "S = πr²α / 360" or "10π / 3" or "\dfrac{\pi R n}{180}"
      if (!hasVietnameseLetters) {
        const formulaLatex = textToLatex(text);
        return katex.renderToString(formulaLatex, {
          displayMode: !inline,
          throwOnError: false,
        });
      }

      // If it's a Vietnamese question statement: tokenize formulas enclosed in math markers or variables
      let transformedText = text
        // If there's an explicit LaTeX formula in the explanation like S = \frac{...}{...}
        .replace(/(S\s*=\s*\\(?:d?frac)[^.]*)/g, '$$$1$$')
        .replace(/([radkxy])\s*=\s*(\d+)/g, '$$$1 = $2$$')
        .replace(/([nmxaα])°\s*=\s*(\d+)°/g, '$$$1^\\circ = $2^\\circ$$')
        .replace(/([nmxaα])°/g, '$$$1^\\circ$$')
        .replace(/(\d+)°/g, '$$$1^\\circ$$')
        .replace(/(\d+π\s*cm²)/g, '$$$1$$')
        .replace(/(\d+π\s*cm\^2)/g, '$$$1$$');

      return transformedText.replace(/\$(.+?)\$/g, (_m, formula) => {
        const ltx = textToLatex(formula);
        return katex.renderToString(ltx, {
          displayMode: false,
          throwOnError: false,
        });
      });
    } catch {
      return text;
    }
  }, [text, latex, inline]);

  const sizeClass = `math-size-${size}`;

  return (
    <span
      className={`inline-math-container font-sans ${sizeClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
