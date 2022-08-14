import { useState } from 'react';

import styles from './DayNightSwitch.module.scss';


interface SwitchProps {
	checked?: boolean;
	defaultChecked?: boolean;
	style?: React.CSSProperties;
	onChange?: (checked: boolean) => void;
}

export default function DayNightSwitch(props: SwitchProps): JSX.Element {
	const [mode, setMode] = useState(props.defaultChecked ?? props.checked ?? false);

	return (
		<div style={props.style}>
			<input
				type='checkbox'
				id='toggle'
				className={styles.toggle_checkbox}
				checked={props.checked ?? mode}
				onChange={() => (props.onChange && props.onChange(!mode))}
				onClick={() => setMode(props.checked ?? !mode)}
			/>
			<label htmlFor='toggle' className={styles.toggle_label}>
				<span className={styles.toggle_label_background}></span>
			</label>
		</div>
	);
}

/* DayNightSwitch.defaultProps = {
	checked: false
}; */