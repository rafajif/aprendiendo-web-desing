# Requirements Document

## Introduction

A web-based CSS learning game that teaches real CSS through interactive visual puzzles. Players write actual CSS properties into a code editor and immediately see the result applied to animated elements in a live preview panel. The game progresses through levels organized by CSS topic (Flexbox, Grid, positioning, selectors, etc.), each presenting a target layout that the player must recreate. The design is inspired by Flexbox Froggy, emphasising low friction entry, immediate visual feedback, and a playful aesthetic accessible to beginners. The game supports multiple languages, including Spanish, and meets WCAG 2.1 AA accessibility standards.

---

## Glossary

- **Game**: The web application described in this document.
- **Player**: A person using the Game in a browser.
- **Level**: A single puzzle unit consisting of a scenario, a target layout, pre-filled HTML, and one or more CSS properties the Player must supply.
- **Chapter**: A named group of Levels that share a CSS topic (e.g., "Flexbox", "Grid", "Positioning").
- **Code_Editor**: The text input area where the Player writes CSS declarations.
- **Preview_Panel**: The visual area that renders the puzzle scene and updates in real time as the Player types.
- **Target_Layout**: The desired final visual state the Player must achieve to complete a Level.
- **Completion_Check**: The subsystem that compares the rendered state of the Preview_Panel to the Target_Layout.
- **Score**: A numeric value representing a Player's performance on a Level, based on attempts and hints used.
- **Progress_Store**: The browser-local storage mechanism that persists Level completion status and scores.
- **Hint_System**: The subsystem that reveals partial or full solutions to a Player on request.
- **I18n_Engine**: The subsystem responsible for loading and applying locale-specific text strings.
- **Locale**: A language-and-region identifier (e.g., `en`, `es`, `fr`) that selects translated content.
- **Theme**: A visual skin applied to the Game (e.g., "Ocean", "Forest", "Space") that changes background, colors, and character sprites without affecting gameplay.
- **Accessibility_Mode**: A setting that activates high-contrast colors and reduces motion.
- **CSS_Property**: A single valid CSS declaration (e.g., `justify-content: center`).
- **Sandbox**: An isolated iframe used to render the Player's CSS without affecting the host page.

---

## Requirements

### Requirement 1: Level Structure and Progression

**User Story:** As a Player, I want to advance through a sequence of levels that gradually introduce new CSS concepts, so that I learn CSS in a structured, scaffolded way.

#### Acceptance Criteria

1. THE Game SHALL contain at least 50 Levels organized into at least 5 Chapters.
2. WHEN a Player completes a Level, THE Game SHALL unlock the immediately following Level in the same Chapter.
3. WHEN a Player completes the final Level of a Chapter, THE Game SHALL unlock the first Level of the next Chapter.
4. WHILE a Level is locked, THE Game SHALL display the Level as unavailable and prevent the Player from opening it.
5. THE Game SHALL present Levels within each Chapter in a fixed order that progresses from simpler to more complex CSS concepts.
6. WHEN a Player visits the Level select screen, THE Game SHALL display each Level's completion status (locked, unlocked, completed) and the Player's best Score for completed Levels.

---

### Requirement 2: Chapter Topics

**User Story:** As a Player, I want the game to cover multiple CSS topics beyond just Flexbox, so that I build a broad CSS skill set.

#### Acceptance Criteria

1. THE Game SHALL include a Chapter covering CSS Flexbox properties: `display`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `align-content`, `order`, `flex-grow`, `flex-shrink`, `flex-basis`, `align-self`.
2. THE Game SHALL include a Chapter covering CSS Grid properties: `display`, `grid-template-columns`, `grid-template-rows`, `grid-column`, `grid-row`, `gap`, `justify-items`, `align-items`, `place-items`, `grid-area`.
3. THE Game SHALL include a Chapter covering CSS Positioning properties: `position`, `top`, `right`, `bottom`, `left`, `z-index`.
4. THE Game SHALL include a Chapter covering CSS Selectors and Specificity: element, class, ID, attribute, pseudo-class, and pseudo-element selectors.
5. THE Game SHALL include a Chapter covering CSS Box Model properties: `margin`, `padding`, `border`, `box-sizing`, `width`, `height`, `overflow`.
6. WHEN a new Chapter is added to the Game, THE Game SHALL place it after the existing final Chapter without renumbering existing Levels.

---

### Requirement 3: Split-Screen Interface

**User Story:** As a Player, I want to see my CSS code and its visual effect side by side, so that I immediately understand the connection between code and layout.

#### Acceptance Criteria

1. THE Game SHALL display the Code_Editor and the Preview_Panel simultaneously on screens with a viewport width of 768 px or wider.
2. WHEN the viewport width is below 768 px, THE Game SHALL stack the Code_Editor above the Preview_Panel vertically.
3. THE Game SHALL display the Level's instructional text above the Code_Editor.
4. WHEN the Player resizes the browser window, THE Game SHALL reflow the layout within 100 ms without losing the Player's current code input.
5. THE Game SHALL allow the Player to drag the divider between the Code_Editor and Preview_Panel to adjust their relative widths within a range of 25 % to 75 % of the total interface width.
6. WHEN the divider position is changed, THE Game SHALL persist that position for the remainder of the session.

---

### Requirement 4: Code Editor

**User Story:** As a Player, I want a comfortable, purpose-built editor to write CSS, so that I can focus on learning rather than fighting the input interface.

#### Acceptance Criteria

1. THE Code_Editor SHALL accept free-form text input of CSS declarations.
2. THE Code_Editor SHALL apply syntax highlighting to CSS property names, values, and punctuation.
3. WHEN the Player types a valid CSS property name followed by a colon, THE Code_Editor SHALL display an autocomplete dropdown listing the top 5 most relevant values for that property.
4. WHEN the Player selects an autocomplete suggestion, THE Code_Editor SHALL insert the selected value and place the cursor after it.
5. THE Code_Editor SHALL display line numbers alongside each line of code.
6. WHEN the Player presses Tab inside the Code_Editor, THE Code_Editor SHALL insert two spaces rather than moving focus to the next browser control.
7. WHEN the Player presses Ctrl+Z (Windows/Linux) or Cmd+Z (macOS), THE Code_Editor SHALL undo the last edit action.
8. THE Code_Editor SHALL pre-fill read-only scaffold code showing the HTML structure of the puzzle scene so the Player knows which selectors to target.
9. WHEN the Player's input contains a CSS syntax error, THE Code_Editor SHALL underline the offending token with a red wavy line and display an inline error message describing the problem.

---

### Requirement 5: Live Preview

**User Story:** As a Player, I want the preview to update instantly as I type, so that I get immediate feedback on each CSS change.

#### Acceptance Criteria

1. WHEN the Player changes any character in the Code_Editor, THE Preview_Panel SHALL re-render within 300 ms.
2. THE Preview_Panel SHALL render the puzzle scene inside a Sandbox so that the Player's CSS cannot affect the Game's own styles.
3. WHEN the Player's CSS is syntactically invalid, THE Preview_Panel SHALL retain the last valid render rather than showing a blank or broken layout.
4. THE Preview_Panel SHALL display animated characters or objects (e.g., animals, shapes) whose positions are determined by the Player's CSS.
5. WHEN the Player's rendered layout matches the Target_Layout within the defined tolerance, THE Preview_Panel SHALL display a success animation before the Game advances to the next Level.
6. THE Game SHALL define layout match tolerance as: each positioned element's computed center coordinate within ±4 px of the Target_Layout coordinate, and each element's computed size within ±4 px of the target size.

---

### Requirement 6: Win Condition and Scoring

**User Story:** As a Player, I want to know when I've solved a puzzle and earn a score that reflects my efficiency, so that I feel rewarded and motivated to improve.

#### Acceptance Criteria

1. WHEN the Completion_Check determines that the Player's layout matches the Target_Layout, THE Game SHALL mark the Level as completed and record the Player's Score to the Progress_Store.
2. THE Game SHALL calculate Score on a scale of 1 to 3 stars: 3 stars for solving without hints and in one attempt, 2 stars for solving with one hint or two attempts, 1 star for any other successful completion.
3. WHEN a Player replays a completed Level and achieves a higher Score, THE Progress_Store SHALL update the stored Score to the higher value.
4. WHEN a Player replays a completed Level and achieves an equal or lower Score, THE Progress_Store SHALL retain the previously stored Score.
5. THE Game SHALL display the Score immediately after Level completion before showing the Level-advance prompt.
6. THE Game SHALL display the Player's total star count across all completed Levels on the main menu screen.

---

### Requirement 7: Hint System

**User Story:** As a Player, I want to request hints when I am stuck, so that I can keep learning without becoming frustrated.

#### Acceptance Criteria

1. WHEN a Player requests a hint, THE Hint_System SHALL reveal the name and purpose of the next CSS property needed to solve the Level, without revealing its value.
2. WHEN a Player requests a second hint on the same Level, THE Hint_System SHALL reveal the full CSS declaration needed for the next unsolved property.
3. WHEN a Player requests a third hint on the same Level, THE Hint_System SHALL insert the complete solution into the Code_Editor.
4. WHEN the Hint_System inserts the complete solution, THE Game SHALL mark the Level as completed with 1 star and prevent further hint requests on that Level.
5. THE Game SHALL display the number of hints remaining for the current Level at all times during gameplay.
6. IF the Player has already used the maximum hints for the Level, THEN THE Hint_System SHALL disable the hint button and display a message explaining why.

---

### Requirement 8: Progress Persistence

**User Story:** As a Player, I want my progress to be saved automatically, so that I can close the browser and return to exactly where I left off.

#### Acceptance Criteria

1. WHEN the Player completes a Level, THE Progress_Store SHALL save the completion status and Score within 500 ms, without requiring any explicit save action from the Player.
2. WHEN the Player opens the Game in the same browser where progress was previously saved, THE Game SHALL restore all completed Level statuses and Scores from the Progress_Store.
3. THE Progress_Store SHALL use the browser's `localStorage` API to persist data across sessions.
4. WHEN the Player's localStorage is unavailable or full, THE Game SHALL display a warning message and continue operating without persistence for that session.
5. THE Game SHALL provide a "Reset Progress" option in the settings screen that clears all data from the Progress_Store after the Player confirms the action in a modal dialog.
6. WHEN the Player confirms a progress reset, THE Progress_Store SHALL clear all stored data and THE Game SHALL return the Player to the first Level of the first Chapter.

---

### Requirement 9: Multilingual Support

**User Story:** As a Spanish-speaking Player, I want to play the game in my own language, so that language is not a barrier to learning CSS.

#### Acceptance Criteria

1. THE Game SHALL support at least the following Locales at launch: `en` (English) and `es` (Spanish).
2. WHEN the Player selects a Locale, THE I18n_Engine SHALL replace all visible UI text strings with translations in the selected Locale within 200 ms.
3. THE I18n_Engine SHALL translate: level instructions, hint messages, button labels, error messages, Chapter names, and settings labels.
4. THE I18n_Engine SHALL NOT translate CSS property names or values, as these are part of the CSS language being taught.
5. WHEN the Game first loads, THE I18n_Engine SHALL detect the browser's preferred language using the `navigator.language` API and select the closest matching supported Locale, defaulting to `en` if no match is found.
6. THE Game SHALL provide a language selector control visible on the main menu and in the settings screen.
7. WHEN a Locale is selected, THE Game SHALL persist the selection in localStorage so that the same Locale is applied on future visits.
8. WHERE a future Locale is added to the Game, THE I18n_Engine SHALL load it without requiring changes to the Game's core logic.

---

### Requirement 10: Accessibility

**User Story:** As a Player with visual or motor impairments, I want the game to be usable with assistive technologies, so that CSS learning is available to everyone.

#### Acceptance Criteria

1. THE Game SHALL meet WCAG 2.1 Level AA criteria for all interactive and informational elements.
2. THE Game SHALL provide a minimum text contrast ratio of 4.5:1 for normal text and 3:1 for large text against their backgrounds.
3. WHEN Accessibility_Mode is enabled, THE Game SHALL increase contrast ratios to a minimum of 7:1 for all text and reduce all CSS transitions and animations to 0 ms duration.
4. THE Game SHALL ensure all interactive controls (buttons, the Code_Editor, the language selector, the Level select grid) are reachable and operable using the keyboard alone, with a visible focus indicator on every focused element.
5. THE Game SHALL assign descriptive `aria-label` attributes to all icon-only buttons.
6. THE Game SHALL assign `role="status"` and `aria-live="polite"` to the region that announces Level completion and hint messages, so that screen readers announce updates without interrupting the Player.
7. THE Preview_Panel SHALL include a text description of the Target_Layout (e.g., "Three boxes aligned to the right of the container") as an `aria-description` on the preview region.
8. WHEN the success animation plays, THE Game SHALL provide an equivalent non-animated textual announcement for Players who have reduced-motion preferences (`prefers-reduced-motion: reduce`).

---

### Requirement 11: Theming

**User Story:** As a Player, I want to choose a visual theme, so that the game's aesthetic matches my preferences and keeps the experience fresh.

#### Acceptance Criteria

1. THE Game SHALL offer at least 3 Themes at launch (e.g., Ocean, Forest, Space).
2. WHEN the Player selects a Theme, THE Game SHALL apply the new Theme's colors, background, and character sprites within 150 ms.
3. WHEN a Theme is applied, THE Game SHALL not alter any gameplay logic, Level content, or CSS properties being taught.
4. THE Game SHALL persist the Player's selected Theme in localStorage and restore it on the next visit.
5. WHERE a Theme uses color as the sole means of conveying element state (locked, completed, active), THE Game SHALL provide a secondary indicator (icon, pattern, or text label) for that state.

---

### Requirement 12: Level Reset

**User Story:** As a Player, I want to reset the current Level's editor back to its initial state, so that I can start over without penalty to my saved progress.

#### Acceptance Criteria

1. THE Game SHALL display a "Reset Level" button during gameplay.
2. WHEN the Player activates "Reset Level", THE Code_Editor SHALL revert to the Level's initial scaffold code and THE Preview_Panel SHALL re-render accordingly.
3. WHEN the Player activates "Reset Level", THE Game SHALL NOT alter the Player's stored completion status or Score for that Level.
4. WHEN the Player activates "Reset Level" on a Level the Player has already completed, THE Game SHALL display a confirmation dialog before resetting.

---

### Requirement 13: CSS Validation and Sandboxing

**User Story:** As a developer operating the game, I want player-supplied CSS to be safely sandboxed, so that malicious or erroneous CSS cannot break the game or harm other users.

#### Acceptance Criteria

1. THE Sandbox SHALL isolate all Player-supplied CSS inside an `<iframe>` element with the `sandbox` attribute, restricting script execution and navigation.
2. THE Game SHALL apply Player-supplied CSS only to elements within the Sandbox and SHALL NOT apply it to any element outside the Sandbox.
3. WHEN the Player's CSS contains a `@import` rule pointing to an external URL, THE Sandbox SHALL block the network request and THE Code_Editor SHALL display a warning that external imports are not permitted.
4. WHEN the Player's CSS contains a `url()` reference to an external resource, THE Sandbox SHALL block that request.
5. THE Completion_Check SHALL evaluate layout correctness by reading the computed styles of elements inside the Sandbox using the `getComputedStyle` API, not by string-matching the Player's input.

---

### Requirement 14: Performance

**User Story:** As a Player on a typical consumer device, I want the game to load and respond quickly, so that slow performance does not interrupt my learning flow.

#### Acceptance Criteria

1. THE Game SHALL achieve a Largest Contentful Paint (LCP) of under 2.5 s on a broadband connection (defined as 10 Mbps download) on a mid-range mobile device.
2. THE Game SHALL achieve a Cumulative Layout Shift (CLS) score below 0.1 during initial page load.
3. WHEN the Player navigates between Levels, THE Game SHALL display the new Level's content within 200 ms without a full page reload.
4. THE Game SHALL cache all static assets (scripts, stylesheets, sprite images) using a Service Worker so that subsequent visits load from cache.
5. THE Game SHALL operate fully offline after the first successful load, with no degradation of gameplay functionality.

---

### Requirement 15: Completion Check Correctness Properties

**User Story:** As a developer, I want the Completion_Check subsystem to behave correctly across all possible player inputs, so that puzzles are neither falsely marked solved nor falsely rejected.

#### Acceptance Criteria

1. THE Completion_Check SHALL return "solved" if and only if every required element in the Level's Target_Layout satisfies the tolerance defined in Requirement 5, Criterion 6.
2. FOR ALL CSS inputs that produce the same computed layout as the Target_Layout, THE Completion_Check SHALL return "solved" regardless of the specific CSS declarations used to achieve that layout.
3. FOR ALL CSS inputs that produce a computed layout differing from the Target_Layout by more than the defined tolerance on any axis, THE Completion_Check SHALL return "not solved".
4. FOR ALL valid CSS inputs applied repeatedly to the same Level without changing the Code_Editor content, THE Completion_Check SHALL return the same result on every invocation (idempotence property).
5. WHEN the Code_Editor content is reset to the Level's initial scaffold (empty player CSS), THE Completion_Check SHALL return "not solved" for every Level.
6. FOR ALL Levels, the Target_Layout SHALL be achievable by at least one valid CSS input (solvability property — every puzzle has a solution).
7. FOR ALL pairs of CSS input A and CSS input B that both satisfy the Target_Layout tolerance for a Level, THE Completion_Check SHALL return "solved" for both A and B, confirming that the check is solution-agnostic and not tied to a single expected string.

---

### Requirement 16: I18n Engine Correctness Properties

**User Story:** As a developer, I want the I18n_Engine to behave consistently across all Locales and string keys, so that no UI element is ever untranslated or missing.

#### Acceptance Criteria

1. FOR ALL supported Locales, THE I18n_Engine SHALL return a non-empty string for every registered UI string key.
2. FOR ALL UI string keys present in the `en` Locale, the same key SHALL exist in every other supported Locale (key completeness property).
3. WHEN the I18n_Engine is switched from Locale A to Locale A (same Locale applied twice), THE I18n_Engine SHALL produce output identical to a single application of Locale A (idempotence property).
4. FOR ALL string keys whose value contains no interpolation placeholders, THE I18n_Engine SHALL return the stored translation string unchanged (no spurious mutation property).
5. WHEN a string key contains exactly N named interpolation placeholders, THE I18n_Engine SHALL substitute all N placeholders and return a string with zero remaining unsubstituted placeholders, regardless of the Locale.
