import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.lg,
  },
  
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  
  text: {
    color: theme.colors.text,
    fontSize: 16,
  },
  
  textSecondary: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  
  textMuted: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  
  badgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

