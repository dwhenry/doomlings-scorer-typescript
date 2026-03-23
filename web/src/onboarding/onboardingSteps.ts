/** Bump when onboarding copy or flow changes materially so users see updates. */
export const ONBOARDING_VERSION = 1;

export const ONBOARDING_STORAGE_KEY = 'doomlings_onboarding_version';

export type TourAnchorId =
  | 'header'
  | 'players'
  | 'pack'
  | 'card-preview'
  | 'footer';

export interface OnboardingStep {
  title: string;
  /** One or more paragraphs */
  body: string[];
  /** If set, soft-highlight `[data-tour="…"]` when present; otherwise text-only. */
  tourAnchor?: TourAnchorId;
}

export const onboardingStepsMobile: OnboardingStep[] = [
  {
    title: 'Welcome',
    body: [
      'This scorer tracks Doomlings hands, catastrophes, and points. Use the tour to learn the basics, or skip anytime.'
    ]
  },
  {
    title: 'Menu and setup',
    body: [
      'Tap the menu (☰) to start a new game, set how many players you have, filter which releases or collections appear in the pack, share your game state, or report a bug.'
    ],
    tourAnchor: 'header'
  },
  {
    title: 'Players',
    body: [
      'Each player has a hand of cards and a running score. Tap a player to select them, then use Add cards to focus on that player on small screens. Tap Done when you finish adding cards for them.'
    ],
    tourAnchor: 'players'
  },
  {
    title: 'Card pack',
    body: [
      'With a player selected, tap cards in the pack to add them to that player’s hand. Use color tabs and search to find cards. On touch devices, press and hold a pack card to see a full-screen preview.'
    ],
    tourAnchor: 'pack'
  },
  {
    title: 'Catastrophes',
    body: [
      'Open the Catastrophe tab in the pack to toggle active catastrophes. Some need extra details—follow prompts to fill in metadata when required.'
    ]
  },
  {
    title: 'Scoring and help',
    body: [
      'When you have cards in play, open View scoring logs in the footer for a detailed breakdown. You can replay this tour from How to use anytime.'
    ],
    tourAnchor: 'footer'
  }
];

export const onboardingStepsDesktop: OnboardingStep[] = [
  {
    title: 'Welcome',
    body: [
      'This scorer tracks Doomlings hands, catastrophes, and points. Use the tour to learn the basics, or skip anytime.'
    ]
  },
  {
    title: 'Header controls',
    body: [
      'Use New Game to reset. Filter by release or collection to limit which cards appear in the pack, and set the number of players here.'
    ],
    tourAnchor: 'header'
  },
  {
    title: 'Players',
    body: [
      'Click a player to select them. Their hand and score stay visible; other players shrink so you can focus on the active player.'
    ],
    tourAnchor: 'players'
  },
  {
    title: 'Card pack',
    body: [
      'With a player selected, click cards in the pack to add them to that player’s hand. Use color tabs and search to find cards quickly.'
    ],
    tourAnchor: 'pack'
  },
  {
    title: 'Card preview',
    body: [
      'On desktop, hovering a pack card shows a larger preview on the side so you can read the card without adding it.'
    ],
    tourAnchor: 'card-preview'
  },
  {
    title: 'Catastrophes',
    body: [
      'Use the Catastrophe tab in the pack to enable catastrophes for this game. Some require metadata—complete any prompts that appear.'
    ]
  },
  {
    title: 'Scoring and help',
    body: [
      'Open View scoring logs in the footer for a full breakdown. Replay this tour anytime via How to use.'
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
