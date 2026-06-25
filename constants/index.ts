// constants/index.ts — root barrel so every screen imports from 'constants'

// Colors — re-export the full Colors object from theme (canonical source)
// theme.ts has the complete Colors with all semantic + legacy aliases
export { Colors, Spacing, FontSize, FontWeight, Fonts, Radius, Shadow } from './theme';

// StorageKeys
export { StorageKeys } from '../src/repositories/keys';
