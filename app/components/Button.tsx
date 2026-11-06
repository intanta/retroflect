import type { ComponentProps } from 'react'

const baseClasses =
	'inline-flex items-center justify-center rounded-xl cursor-pointer transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2'

// :where() gives these zero specificity, so any padding class passed through
// `className` wins. With plain px-2 py-1, stylesheet order would decide instead
// (px-2 beats p-2, for example).
const defaultPaddingClasses = '[:where(&)]:px-2 [:where(&)]:py-1'

const variantClasses = {
	primary:
		'border border-transparent bg-action text-on-action enabled:hover:bg-action-hover focus-visible:outline-action disabled:bg-surface-muted disabled:text-ink-disabled',
	ghost:
		'border border-transparent text-action enabled:hover:bg-action/10 enabled:hover:text-action-hover focus-visible:outline-action disabled:text-ink-disabled',
	secondary:
		'border border-transparent bg-ink text-on-action enabled:hover:bg-ink-hover focus-visible:outline-ink disabled:bg-surface-muted disabled:text-ink-disabled',
	tertiary:
		'border border-line-strong text-ink enabled:hover:bg-ink/10 focus-visible:outline-ink disabled:border-line-disabled disabled:text-ink-disabled',
	'secondary-ghost':
		'border border-transparent text-ink enabled:hover:bg-ink/10 focus-visible:outline-ink disabled:text-ink-disabled',
	danger:
		'border border-transparent bg-danger/80 text-on-danger enabled:hover:bg-danger-hover focus-visible:outline-danger disabled:bg-surface-muted disabled:text-ink-disabled',
}

export type ButtonVariant = keyof typeof variantClasses

type ButtonProps = ComponentProps<'button'> & {
	/**
	 * Omit for one-off colors: only the base classes apply, so colors passed in
	 * `className` don't conflict with a variant. The focus outline then follows
	 * the text color.
	 */
	variant?: ButtonVariant
}

/**
 * Padding defaults to `px-2 py-1`: override it through `className` (`p-0` for a
 * bare icon). Pass width and position there too.
 * Defaults to `type="button"`, so form submit buttons must set `type="submit"`.
 */
export function Button({
	variant,
	className = '',
	type = 'button',
	...props
}: ButtonProps) {
	const colorClasses = variant
		? variantClasses[variant]
		: 'focus-visible:outline-current'

	return (
		<button
			type={type}
			className={`${baseClasses} ${defaultPaddingClasses} ${colorClasses} ${className}`}
			{...props}
		/>
	)
}
