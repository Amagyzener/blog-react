import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import './index.css';

import { store } from './store';
import App from './App';
//import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	/* StrictMode renders components twice (on dev, but not production)
		in order to detect any problems with the code and warn about them. */
	<StrictMode>
		<Provider store={store}>
			<Router>
				<App />
			</Router>
		</Provider>
	</StrictMode>
);

/* If you want to start measuring performance in your app, pass a function to log results (for example: reportWebVitals(console.log))
	or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals */
//reportWebVitals(console.log);