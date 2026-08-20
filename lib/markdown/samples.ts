import { MarkdownDocument } from "@/types/document";

export const SAMPLE_SHOWCASE = `---
title: "rendermd — Modern Markdown Studio"
description: "A local-first Markdown studio with unified design presets, LaTeX math, and Mermaid diagrams."
author: "rendermd Core Team"
date: "2026-08-20"
tags: [markdown, katex, mermaid, presets, frontmatter]
status: "Published"
draft: false
license: "MIT"
---

# rendermd — Modern Markdown Studio

> [!NOTE]
> **rendermd** is a lightweight, local-first Markdown studio where typography, math, and diagrams share a single cohesive design system.

Welcome to the unified document preview. Switch presets in the top navigation to watch typography, LaTeX formulas, code blocks, and diagrams transform seamlessly together.

---

## 1. GitHub-Style Alerts & Callouts

> [!TIP]
> Use alerts to emphasize critical steps, best practices, and helpful recommendations.

> [!IMPORTANT]
> Preset themes map directly to CSS variables (\`--md-*\`), ensuring full portability to standalone HTML and vector PDF prints.

> [!WARNING]
> Ensure all Mermaid node identifiers use alphanumeric characters for optimal compatibility.

> [!CAUTION]
> Hardcoding arbitrary CSS colors inside markdown may break dark/light theme switching.

---

## 2. Interactive Mermaid Diagrams

All Mermaid diagrams dynamically inherit the active document preset's color palette, typography, and border radius.

### System Architecture Flowchart

\`\`\`mermaid
graph TD
    A[Markdown Input] --> B(Parser Engine)
    B --> C{AST Transformer}
    C -->|GFM Elements| D[React DOM]
    C -->|Equations| E[KaTeX Math Engine]
    C -->|Diagrams| F[Mermaid Vector SVG]
    D --> G[Unified Design Tokens]
    E --> G
    F --> G
    G --> H[Rendered Document]
    H --> I[HTML Export]
    H --> J[Vector PDF]
    H --> K[PNG / SVG]
\`\`\`

### User Flow Sequence

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant Editor as Markdown Editor
    participant Engine as Token Engine
    participant Preview as Live Preview
    
    User->>Editor: Write Markdown with Math (E = mc²) & Diagrams
    Editor->>Engine: Stream AST with tokens
    Engine->>Preview: Apply CSS Variables & Render SVGs
    Preview-->>User: Instant visual feedback
\`\`\`

---

## 3. Mathematical Equations (KaTeX)

Render beautiful mathematical formulas inline like $\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}$ or as full display equation blocks:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

The standard formulation of the Riemann Zeta Function $\\zeta(s)$ across the complex plane:

$$
\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s} = \\prod_{p \\text{ prime}} \\frac{1}{1 - p^{-s}} \\quad \\text{for } \\operatorname{Re}(s) > 1
$$

---

## 4. Syntax Highlighted Code Blocks

Code blocks feature line numbers, language identification, and one-click copy to clipboard.

\`\`\`typescript
import { DocumentPreset, getMermaidConfig } from "rendermd";

export function renderDocument(markdown: string, preset: DocumentPreset) {
  const cssVars = generatePresetCSSVariables(preset);
  const mermaidConfig = getMermaidConfig(preset);
  
  console.log(\`Rendering document with \${preset.name} preset...\`);
  return { cssVars, mermaidConfig };
}
\`\`\`

\`\`\`python
# Gradient descent optimization
def optimize_weights(learning_rate: float, epochs: int) -> list[float]:
    weights = [0.0] * 10
    for epoch in range(epochs):
        gradient = compute_gradient(weights)
        weights = [w - learning_rate * g for w, g in zip(weights, gradient)]
    return weights
\`\`\`

---

## 5. Rich Tables & Task Lists

| Feature | rendermd | Standard Markdown | Notes |
| :--- | :---: | :---: | :--- |
| **Unified Presets** | ✅ Yes | ❌ No | Consistent diagram and math theme |
| **KaTeX Math** | ✅ Built-in | ⚠️ Plugin required | Instant client-side HTML output |
| **Lazy Mermaid** | ✅ Built-in | ❌ No | Zero initial bundle bloat |
| **Self-Contained Export** | ✅ Single HTML | ⚠️ Complex | Embedded styles and vector SVGs |

### Task List
- [x] Integrate \`react-markdown\` and \`remark-gfm\`
- [x] Connect unified design tokens to Mermaid \`themeVariables\`
- [x] Implement GitHub Alert callouts
- [ ] Export to standalone single-file HTML
- [ ] Implement browser print-to-PDF stylesheet

---

## 6. Footnotes & References

Markdown documents in rendermd support GFM footnotes[^1] that link cleanly to the bottom of the page[^2].

[^1]: Footnotes provide concise citations and supplementary notes.
[^2]: Links automatically navigate back to their referenced anchor.
`;

export const SAMPLE_ACADEMIC = `# Attention Is All You Need: Modern Transformer Architectures

**Author**: Research Team  
**Date**: August 2026  
**Status**: Published

---

## Abstract

The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the **Transformer**, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.

---

## 1. Scaled Dot-Product Attention

We compute the attention function on a set of queries simultaneously, packed together into a matrix $Q$. The keys and values are packed into matrices $K$ and $V$.

$$
\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V
$$

Where $d_k$ represents the dimensionality of the keys and queries.

---

## 2. Multi-Head Attention Mechanism

Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions:

$$
\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h)W^O
$$

where each head is calculated as:

$$
\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)
$$

\`\`\`mermaid
graph TD
    subgraph Attention Layer
        Q[Queries Q] --> MatMul1(MatMul)
        K[Keys K] --> MatMul1
        MatMul1 --> Scale(Scale 1 / sqrt dk)
        Scale --> Mask(Mask Optional)
        Mask --> Softmax(Softmax)
        Softmax --> MatMul2(MatMul)
        V[Values V] --> MatMul2
        MatMul2 --> Output[Attention Output]
    end
\`\`\`

---

## 3. Computational Complexity

| Layer Type | Complexity per Layer | Sequential Operations | Maximum Path Length |
| :--- | :--- | :--- | :--- |
| **Self-Attention** | $O(n^2 \\cdot d)$ | $O(1)$ | $O(1)$ |
| **Recurrent** | $O(n \\cdot d^2)$ | $O(n)$ | $O(n)$ |
| **Convolutional** | $O(k \\cdot n \\cdot d^2)$ | $O(1)$ | $O(\\log_k(n))$ |

> [!NOTE]
> Self-attention layers connect all positions with a constant number of sequentially executed operations, whereas recurrent layers require $O(n)$ sequential operations.
`;

export const SAMPLE_RFC = `# RFC-042: Distributed Cache Invalidation Protocol

* **Author**: Core Infrastructure Team
* **Target Release**: v3.4.0
* **Reviewers**: Architecture Working Group

---

## 1. Context & Motivation

As our global traffic scales, edge cache consistency has become a primary latency bottleneck. This RFC outlines the implementation of an event-driven cache invalidation bus using Raft consensus and WebSocket replication.

> [!IMPORTANT]
> The invalidation latency target is $\\le 25\\text{ms}$ globally across all Tier-1 edge regions.

---

## 2. Architecture Overview

\`\`\`mermaid
flowchart LR
    Client([Client App]) --> API[API Gateway]
    API --> Primary[(Primary DB)]
    API --> EventBus{{Kafka Invalidation Topic}}
    EventBus --> Worker[Invalidation Worker]
    Worker --> Edge1[(Edge Cache US-East)]
    Worker --> Edge2[(Edge Cache EU-Central)]
    Worker --> Edge3[(Edge Cache AP-East)]
\`\`\`

---

## 3. Protocol Specification

\`\`\`typescript
interface CacheInvalidationPayload {
  version: "1.0";
  timestamp: number;
  namespace: string;
  keys: string[];
  ttlReductionSeconds?: number;
  originNodeId: string;
}
\`\`\`

> [!WARNING]
> Wildcard purges like \`users:*\` must be throttled to prevent cache stampedes on database backends.

---

## 4. Rollout Checklist

- [x] Finalize data structure serialization benchmarks
- [x] Conduct chaos testing with 20% network packet drop
- [ ] Deploy shadow pipeline to staging cluster
- [ ] Enable gradual traffic ramp (10% -> 50% -> 100%)
`;

export const INITIAL_DOCUMENTS: MarkdownDocument[] = [
  {
    id: "doc-showcase",
    title: "rendermd Showcase",
    content: SAMPLE_SHOWCASE,
    presetId: "minimal",
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: "doc-academic",
    title: "Academic Paper: Transformers",
    content: SAMPLE_ACADEMIC,
    presetId: "academic",
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now(),
  },
  {
    id: "doc-rfc",
    title: "RFC: Distributed Cache",
    content: SAMPLE_RFC,
    presetId: "technical",
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now(),
  },
];
