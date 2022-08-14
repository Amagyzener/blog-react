import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';


export default function(ComposedComponent: ComponentType): ComponentType {
	return function NetworkDetector(props): JSX.Element {
		const [isDisconnected, updateConnection] = useState<boolean>(false);

		const handleConnectionChange = () => {
			const condition = navigator.onLine ? 'online' : 'offline';
			if (condition == 'online') {
				const webPing = setInterval(
					() => {
						fetch('//google.com', { mode: 'no-cors' })
							.then(() => {
								updateConnection(false);
								clearInterval(webPing);
							})
							.catch(() => updateConnection(true));
					}, 2000
				);
				return;
			}

			updateConnection(true);
		};

		useEffect(() => {
			handleConnectionChange();
			window.addEventListener('online', handleConnectionChange);
			window.addEventListener('offline', handleConnectionChange);

			return () => {
				window.removeEventListener('online', handleConnectionChange);
				window.removeEventListener('offline', handleConnectionChange);
			};
		}, []);

		return (
			<>
				{isDisconnected && (
					<div className='internet-error'>
						<p>Internet connection lost</p>
					</div>
				)}
				<ComposedComponent {...props} />
			</>
		);
	};
}