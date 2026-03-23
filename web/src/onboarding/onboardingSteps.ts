/** Bump when onboarding copy or flow changes materially so users see updates. */
export const ONBOARDING_VERSION = 3;

export const ONBOARDING_STORAGE_KEY = 'doomlings_onboarding_version';

export type TourAnchorId =
  | 'header'
  | 'players'
  | 'pack'
  | 'card-preview'
  | 'footer'
  | 'scoring-logs-modal'
  | 'scoring-report-bug';

export type OnboardingStepId =
  | 'welcome'
  | 'menu'
  | 'header'
  | 'players'
  | 'pack'
  | 'hover-preview'
  | 'long-press'
  | 'catastrophe'
  | 'scoring-breakdown'
  | 'beta-report-desktop'
  | 'footer';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  /** One or more paragraphs */
  body: string[];
  /** If set, soft-highlight `[data-tour="…"]` when present; otherwise text-only. */
  tourAnchor?: TourAnchorId;
}

export const onboardingStepsMobile: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    body: [
      'This scorer tracks Doomlings hands, catastrophes, and points. Use the tour to learn the basics, or skip anytime.'
    ]
  },
  {
    id: 'menu',
    title: 'Menu and setup',
    body: [
      'Tap the menu (☰) to start a new game, pick how many players you have, choose which decks appear in the pack, or share your game state.',
      'During beta testing, use Report bug in this menu if you hit errors or odd behavior—your message can include what you expected versus what happened. When you have cards in play, View scoring logs in the footer still opens the full score breakdown.'
    ],
    tourAnchor: 'header'
  },
  {
    id: 'players',
    title: 'Players',
    body: [
      'Each player has a hand of cards and a running score. We’ve opened add-cards mode for Player 1—tap Done when you finish adding cards for them.'
    ],
    tourAnchor: 'players'
  },
  {
    id: 'pack',
    title: 'Card pack',
    body: [
      'Tap cards below to add them to the selected player. Use color tabs and search to find cards. The next step shows full-screen preview, like a long press.'
    ],
    tourAnchor: 'pack'
  },
  {
    id: 'long-press',
    title: 'Full-screen preview',
    body: [
      'After a short delay (like holding your finger down), a full-screen preview opens—same as press-and-hold on a pack card. Close it with ✕, the backdrop, or continue the tour.'
    ],
    tourAnchor: 'pack'
  },
  {
    id: 'catastrophe',
    title: 'Catastrophes',
    body: [
      'Open the Catastrophe tab in the pack to toggle active catastrophes. Some need extra details—follow prompts to fill in metadata when required.'
    ]
  },
  {
    id: 'footer',
    title: 'Footer and help',
    body: [
      'Use How to use anytime to replay this tour. The Doomlings link, Contact us, and License entries are in the footer too.'
    ],
    tourAnchor: 'footer'
  }
];

export const onboardingStepsDesktop: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    body: [
      'This scorer tracks Doomlings hands, catastrophes, and points. Use the tour to learn the basics, or skip anytime.'
    ]
  },
  {
    id: 'header',
    title: 'Header controls',
    body: [
      'Use New Game to reset. Filter by release or collection to limit which cards appear in the pack, and set the number of players here.'
    ],
    tourAnchor: 'header'
  },
  {
    id: 'players',
    title: 'Players',
    body: [
      'We’ve selected Player 1. Click a player to focus them; their hand and score stay visible while others shrink.'
    ],
    tourAnchor: 'players'
  },
  {
    id: 'pack',
    title: 'Card pack',
    body: [
      'With a player selected, click cards in the pack to add them to that player’s hand. Use color tabs and search to find cards quickly.'
    ],
    tourAnchor: 'pack'
  },
  {
    id: 'hover-preview',
    title: 'Card preview',
    body: [
      'Hovering a pack card shows a larger preview on the right (we’re simulating that for you here). Move the real pointer over cards anytime to read them without adding.'
    ],
    tourAnchor: 'card-preview'
  },
  {
    id: 'catastrophe',
    title: 'Catastrophes',
    body: [
      'Use the Catastrophe tab in the pack to enable catastrophes for this game. Some require metadata—complete any prompts that appear.'
    ]
  },
  {
    id: 'scoring-breakdown',
    title: 'Score breakdown (beta)',
    body: [
      'We’ve opened Scoring logs for you. Switch between By player and By source to see how totals are built. Expand a card row for phase-by-phase detail (A, B, C). During beta, this view helps you double-check that scoring matches how you played.'
    ],
    tourAnchor: 'scoring-logs-modal'
  },
  {
    id: 'beta-report-desktop',
    title: 'Report scoring issues (beta)',
    body: [
      'If a total or log line looks wrong, use Report scoring bug to send your current game state and a short note. That feedback is a big part of the beta test.',
      'When you’re done exploring, close the logs window or continue—either way you can reopen it from View scoring logs in the footer. Replay this tour anytime via How to use there too.'
    ],
    tourAnchor: 'scoring-report-bug'
  },
  {
    id: 'footer',
    title: 'Footer shortcuts',
    body: [
      'How to use replays this tour. You’ll also find the Doomlings site link, Contact us, and License here.'
    ],
    tourAnchor: 'footer'
  }
];

export function isOnboardingCompleteForCurrentVersion(): boolean {
  try {
    return (
      localStorage.getItem(ONBOARDING_STORAGE_KEY) ===
      String(ONBOARDING_VERSION)
    );
  } catch {
    return false;
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, String(ONBOARDING_VERSION));
  } catch {
    /* ignore quota / private mode */
  }
}
